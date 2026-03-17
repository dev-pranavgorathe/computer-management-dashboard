import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { redeploymentCreateSchema, redeploymentUpdateSchema, paginationSchema, REDEPLOYMENT_STATUSES } from '@/lib/validations'

// Helper to generate refId
async function generateRedeploymentRefId(): Promise<string> {
  const lastRedep = await prisma.redeployment.findFirst({
    where: { refId: { startsWith: 'RDP-' } },
    orderBy: { createdAt: 'desc' },
    select: { refId: true },
  })
  
  if (!lastRedep || !lastRedep.refId) {
    return 'RDP-001'
  }
  
  const lastNum = parseInt(lastRedep.refId.replace('RDP-', ''), 10)
  return `RDP-${String(lastNum + 1).padStart(3, '0')}`
}

/**
 * GET /api/redeployments
 * Fetch all redeployments with pagination and filtering
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
      const complaintTicket = searchParams.get('complaintTicket')

      // Build where clause
      const where: Record<string, unknown> = {
        isDeleted: false,
      }

      // Non-admin users can only see their own redeployments
      if (user.role === 'USER') {
        where.userId = user.id
      }

      // Add search filter
      if (search) {
        where.OR = [
          { podName: { contains: search } },
          { refId: { contains: search } },
          { sourcePod: { contains: search } },
          { complaintTicket: { contains: search } },
          { serials: { contains: search } },
        ]
      }

      // Add status filter
      if (status && REDEPLOYMENT_STATUSES.includes(status as typeof REDEPLOYMENT_STATUSES[number])) {
        where.status = status
      }

      // Filter by linked complaint
      if (complaintTicket) {
        where.complaintTicket = complaintTicket
      }

      // Get total count
      const total = await prisma.redeployment.count({ where })

      // Get redeployments
      const redeployments = await prisma.redeployment.findMany({
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
        redeployments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      })
    } catch (error) {
      console.error('Error fetching redeployments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch redeployments' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * POST /api/redeployments
 * Create a new redeployment
 * PRD: Can be linked to a complaint ticket for traceability
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const body = await request.json()

      // Validate input
      const validationResult = redeploymentCreateSchema.safeParse(body)
      
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

      if (!data.podName) {
        return NextResponse.json(
          { error: 'Validation failed', details: [{ field: 'podName', message: 'Destination POD name is required' }] },
          { status: 400 }
        )
      }

      // Generate refId
      const refId = await generateRedeploymentRefId()

      // Create redeployment
      const redeployment = await prisma.redeployment.create({
        data: {
          refId,
          podName: data.podName,
          shippingAddress: data.shippingAddress,
          contactPerson: data.contactPerson,
          mobileNumber: data.mobileNumber,
          sourcePod: data.sourcePod,
          components: data.components,
          serials: data.serials,
          complaintTicket: data.complaintTicket, // Linked for traceability
          trackingId: data.trackingId,
          orderDate: data.orderDate || new Date(),
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
        entityType: 'Redeployment',
        entityId: redeployment.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({ 
          refId: redeployment.refId,
          podName: redeployment.podName,
          sourcePod: redeployment.sourcePod,
          complaintTicket: redeployment.complaintTicket,
        })
      })

      return NextResponse.json(redeployment, { status: 201 })
    } catch (error) {
      console.error('Error creating redeployment:', error)
      return NextResponse.json(
        { error: 'Failed to create redeployment' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}
