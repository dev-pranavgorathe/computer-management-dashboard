import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { shipmentCreateSchema, shipmentUpdateSchema, paginationSchema, SHIPMENT_STATUSES } from '@/lib/validations'

// Helper to generate refId
async function generateShipmentRefId(): Promise<string> {
  const lastShipment = await prisma.shipment.findFirst({
    where: { refId: { startsWith: 'SHP-' } },
    orderBy: { createdAt: 'desc' },
    select: { refId: true },
  })
  
  if (!lastShipment || !lastShipment.refId) {
    return 'SHP-001'
  }
  
  const lastNum = parseInt(lastShipment.refId.replace('SHP-', ''), 10)
  return `SHP-${String(lastNum + 1).padStart(3, '0')}`
}

// Helper to auto-populate components based on CPU count
function generateComponents(cpus: number): string {
  return `${cpus} CPU${cpus > 1 ? 's' : ''}, ${cpus} Monitor${cpus > 1 ? 's' : ''}, ${cpus} Keyboard${cpus > 1 ? 's' : ''}, ${cpus} Mouse${cpus > 1 ? 'mice' : ''}, ${cpus} Webcam${cpus > 1 ? 's' : ''}, ${cpus} Headphone${cpus > 1 ? 's' : ''}`
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
      return NextResponse.json(
        { error: 'Failed to fetch shipments' },
        { status: 500 }
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

      // Generate refId
      const refId = await generateShipmentRefId()

      // Auto-populate components if not provided
      const components = data.components || generateComponents(data.cpus || 1)

      // Create shipment
      const shipment = await prisma.shipment.create({
        data: {
          refId,
          podName: data.podName,
          shippingAddress: data.shippingAddress,
          contactPerson: data.contactPerson,
          mobileNumber: data.mobileNumber,
          cpus: data.cpus || 1,
          components,
          serials: data.serials,
          trackingId: data.trackingId,
          qcReport: data.qcReport,
          signedQc: data.signedQc,
          orderDate: data.orderDate,
          dispatchDate: data.dispatchDate,
          deliveryDate: data.deliveryDate,
          totalCost: data.totalCost || 0,
          notes: data.notes,
          status: 'PENDING',
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

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
