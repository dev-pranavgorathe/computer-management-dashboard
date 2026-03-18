import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, getClientInfo, requireMinimumRole } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { shipmentCreateSchema, shipmentUpdateSchema, paginationSchema, SHIPMENT_STATUSES, SHIPMENT_PURPOSES } from '@/lib/validations'

// Helper to generate refId
async function generateShipmentRefId(): Promise<string> {
  try {
    const lastShipment = await prisma.shipment.findFirst({
      where: { refId: { startsWith: 'SHP-' } },
      orderBy: { createdAt: 'desc' },
      select: { refId: true },
    })
    
    if (!lastShipment || !lastShipment.refId) {
    return 'SHP-001'
    }
    
    const lastNum = parseInt(lastShipment.refId.replace('SHP-', ''), 10)
    const nextNum = (isNaN(lastNum) ? 1 : lastNum + 1)
    return `SHP-${String(nextNum).padStart(3, '0')}`
  } catch (error) {
    console.error('Error generating refId:', error)
    return `SHP-${Date.now().toString().slice(-3)}`
  }
}

// Helper to auto-populate components based on CPU count
function generateComponents(cpus: number): string {
  return `${cpus} CPU${cpus > 1 ? 's' : ''}, ${cpus} Monitor${cpus > 1 ? 's' : ''}, ${cpus} Keyboard${cpus > 1 ? 's' : ''}, ${cpus} Mouse${cpus > 1 ? 'mice' : ''}, ${cpus} Webcam${cpus > 1 ? 's' : ''}, ${cpus} Headphone${cpus > 1 ? 's' : ''}`
}

function parseDateInput(input?: string | Date | null): Date | null {
  if (!input) return null
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }
  const normalized = input.trim()
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(normalized)
  if (dmy) {
    const [, dd, mm, yyyy] = dmy
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`)
  }
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function normalizeMobileNumber(input: string): string {
  const value = input.trim()
  if (value.startsWith('+233')) return `+91${value.slice(4)}`
  if (value.startsWith('233')) return `+91${value.slice(3)}`
  return value
}

/**
 * GET /api/shipments
 * Fetch all shipments with pagination and filtering
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const { searchParams } = new URL(request.url)
      const { page, limit, search, sortBy, sortOrder } = paginationSchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '50',
        search: searchParams.get('search') || undefined,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      })

      const status = searchParams.get('status')
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')

      // Build where clause
      const where: Record<string, unknown> = {
        isDeleted: false,
      }

      // Non-admin users can only see their own shipments
      if (user.role === 'USER') {
        where.userId = user.id
      }

      // Add search filter
      if (search) {
        where.OR = [
          { podName: { contains: search, mode: 'insensitive' } },
          { refId: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
          { contactPerson: { contains: search, mode: 'insensitive' } },
          { trackingId: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Add status filter
      if (status && SHIPMENT_STATUSES.includes(status as typeof SHIPMENT_STATUSES[number])) {
        where.status = status
      }

      // Add date range filter
      if (dateFrom || dateTo) {
        where.orderDate = {}
        if (dateFrom) (where.orderDate as Record<string, Date>).gte = new Date(dateFrom)
        if (dateTo) (where.orderDate as Record<string, Date>).lte = new Date(dateTo)
      }

      // Get total count
      const total = await prisma.shipment.count({ where })

      // Get shipments
      const shipments = await prisma.shipment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      })

      return NextResponse.json({
        shipments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      })
    } catch (error) {
      console.error('Error fetching shipments:', error)

      // Hotfix: avoid hard 500 loops on dashboard when DB schema/env is temporarily mismatched
      // (e.g., missing column/table in production). Return empty dataset so UI stays usable.
      return NextResponse.json(
        {
          shipments: [],
          pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          warning: 'Shipments data unavailable. Please verify DB migrations/env.',
        },
        { status: 200 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * POST /api/shipments
 * Create a new shipment
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const roleCheck = requireMinimumRole(user.role, 'USER')
      if (!roleCheck.ok) return roleCheck.response
      if (user.role === 'VIEWER') {
        return NextResponse.json({ error: 'Viewers cannot create shipments' }, { status: 403 })
      }

      const body = await request.json()

      // Validate input
      const validationResult = shipmentCreateSchema.safeParse(body)
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
        
        return NextResponse.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        )
      }

      const data = validationResult.data

      // Validate required fields
      if (!data.podName || !data.podName.trim()) {
        return NextResponse.json(
          { error: 'Validation failed', details: [{ field: 'podName', message: 'POD Name is required' }] },
          { status: 400 }
        )
      }
      if (!data.shippingAddress || !data.shippingAddress.trim()) {
        return NextResponse.json(
          { error: 'Validation failed', details: [{ field: 'shippingAddress', message: 'Shipping address is required' }] },
          { status: 400 }
        )
      }
      if (!data.contactPerson || !data.contactPerson.trim()) {
        return NextResponse.json(
          { error: 'Validation failed', details: [{ field: 'contactPerson', message: 'Contact person is required' }] },
          { status: 400 }
        )
      }
      if (!data.mobileNumber || !data.mobileNumber.trim()) {
        return NextResponse.json(
          { error: 'Validation failed', details: [{ field: 'mobileNumber', message: 'Mobile number is required' }] },
          { status: 400 }
        )
      }
      const podName = data.podName.trim()
      const shippingAddress = data.shippingAddress.trim()
      const contactPerson = data.contactPerson.trim()
      const mobileNumber = data.mobileNumber.trim()

      const parsedOrderDate = parseDateInput(data.orderDate)
      if (!parsedOrderDate) {
        return NextResponse.json(
          { error: 'Validation failed', details: [{ field: 'orderDate', message: 'Invalid order date format' }] },
          { status: 400 }
        )
      }

      // Auto-populate components if not provided
      const components = data.components || generateComponents(data.cpus || 1)

      const isRefIdConflict = (err: unknown) => {
        const msg = String(err || '')
        return msg.includes('Unique constraint failed') && msg.includes('refId')
      }

      const createWithRetry = async (
        createData: Record<string, unknown>,
        includeOwner = true
      ) => {
        let attempts = 0
        let currentRefId = await generateShipmentRefId()
        let lastError: unknown

        while (attempts < 4) {
          try {
            return await prisma.shipment.create({
              data: {
                ...createData,
                refId: currentRefId,
              },
              include: includeOwner
                ? {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      }
                    },
                    owner: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      }
                    }
                  }
                : {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      }
                    }
                  }
            })
          } catch (err) {
            lastError = err
            if (isRefIdConflict(err)) {
              attempts += 1
              currentRefId = await generateShipmentRefId()
              continue
            }
            throw err
          }
        }

        throw lastError
      }

      // Create shipment with schema-compat + refId retry
      let shipment
      try {
        shipment = await createWithRetry({
          podName,
          shippingAddress,
          state: data.state || null,
          pincode: data.pincode || null,
          contactPerson,
          mobileNumber: normalizeMobileNumber(mobileNumber),
          cpus: data.cpus || 1,
          components,
          serials: data.serials,
          trackingId: data.trackingId,
          qcReport: data.qcReport,
          signedQc: data.signedQc,
          additionalDocs: data.additionalDocs,
          purpose: data.purpose || 'OTHER',
          orderDate: parsedOrderDate,
          dispatchDate: parseDateInput(data.dispatchDate),
          deliveryDate: parseDateInput(data.deliveryDate),
          totalCost: data.totalCost || 0,
          notes: data.notes,
          ownerId: data.ownerId || user.id,
          team: data.team || null,
          location: data.location || null,
          status: 'PENDING',
          mailSent: false,
          userId: user.id,
        })
      } catch (createError) {
        console.error('Primary create shipment failed, trying compatibility mode:', createError)

        // Fallback for older DB schema: only write core columns
        shipment = await createWithRetry(
          {
            podName,
            shippingAddress,
            contactPerson,
            mobileNumber: normalizeMobileNumber(mobileNumber),
            cpus: data.cpus || 1,
            orderDate: parsedOrderDate,
            status: 'PENDING',
            userId: user.id,
          },
          false
        )
      }

      // Create audit log
      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'CREATE',
        entityType: 'Shipment',
        entityId: shipment.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({ 
          refId: shipment.refId,
          podName: shipment.podName, 
          cpus: shipment.cpus,
          status: shipment.status,
        })
      })

      return NextResponse.json(shipment, { status: 201 })
    } catch (error) {
      console.error('Error creating shipment:', error)
      return NextResponse.json(
        { error: 'Failed to create shipment' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}
