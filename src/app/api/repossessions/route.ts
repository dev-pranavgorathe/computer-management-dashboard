import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { repossessionCreateSchema, repossessionUpdateSchema, paginationSchema, REPOSSESSION_STATUSES } from '@/lib/validations'

// Helper to generate refId
async function generateRepossessionRefId(): Promise<string> {
  const lastRepo = await prisma.repossession.findFirst({
    where: { refId: { startsWith: 'REP-' } },
    orderBy: { createdAt: 'desc' },
    select: { refId: true },
  })
  
  if (!lastRepo || !lastRepo.refId) {
    return 'REP-001'
  }
  
  const lastNum = parseInt(lastRepo.refId.replace('REP-', ''), 10)
  return `REP-${String(lastNum + 1).padStart(3, '0')}`
}

// Helper to generate ticket number
async function generateTicketNumber(): Promise<string> {
  const lastRepo = await prisma.repossession.findFirst({
    where: { ticket: { startsWith: 'TKT-' } },
    orderBy: { createdAt: 'desc' },
    select: { ticket: true },
  })
  
  // Start from 5000 series for repossessions
  if (!lastRepo || !lastRepo.ticket) {
    return 'TKT-5001'
  }
  
  const lastNum = parseInt(lastRepo.ticket.replace('TKT-', ''), 10)
  return `TKT-${String(lastNum + 1).padStart(4, '0')}`
}

/**
 * GET /api/repossessions
 * Fetch all repossessions with pagination and filtering
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

      // Build where clause
      const where: Record<string, unknown> = {
        isDeleted: false,
      }

      // Non-admin users can only see their own repossessions
      if (user.role === 'USER') {
        where.userId = user.id
      }

      // Add search filter
      if (search) {
        where.OR = [
          { podName: { contains: search } },
          { refId: { contains: search } },
          { ticket: { contains: search } },
          { serials: { contains: search } },
        ]
      }

      // Add status filter
      if (status && REPOSSESSION_STATUSES.includes(status as typeof REPOSSESSION_STATUSES[number])) {
        where.status = status
      }

      // Get total count
      const total = await prisma.repossession.count({ where })

      // Get repossessions
      const repossessions = await prisma.repossession.findMany({
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
        repossessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      })
    } catch (error) {
      console.error('Error fetching repossessions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch repossessions' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * POST /api/repossessions
 * Create a new repossession request
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const body = await request.json()

      // Validate input
      const validationResult = repossessionCreateSchema.safeParse(body)
      
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

      // Generate IDs
      const refId = await generateRepossessionRefId()
      const ticket = await generateTicketNumber()

      // Create repossession
      const repossession = await prisma.repossession.create({
        data: {
          refId,
          ticket,
          podName: data.podName,
          shippingAddress: data.shippingAddress,
          contactPerson: data.contactPerson,
          mobileNumber: data.mobileNumber,
          components: data.components,
          serials: data.serials, // Can be added later
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
        entityType: 'Repossession',
        entityId: repossession.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({ 
          refId: repossession.refId,
          ticket: repossession.ticket,
          podName: repossession.podName,
        })
      })

      return NextResponse.json(repossession, { status: 201 })
    } catch (error) {
      console.error('Error creating repossession:', error)
      return NextResponse.json(
        { error: 'Failed to create repossession' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}
