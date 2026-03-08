import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { complaintCreateSchema, paginationSchema } from '@/lib/validations'

/**
 * GET /api/complaints
 * Fetch all complaints with pagination and filtering
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const { searchParams } = new URL(request.url)
      const { page, limit, search, sortBy, sortOrder } = paginationSchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '10',
        search: searchParams.get('search') || undefined,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      })

      const status = searchParams.get('status')
      const priority = searchParams.get('priority')

      // Build where clause
      const where: any = {
        isDeleted: false,
      }

      // Non-admin users can only see their own complaints
      if (user.role === 'USER') {
        where.userId = user.id
      }

      // Add search filter
      if (search) {
        where.OR = [
          { podName: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
          { issue: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Add status filter
      if (status) {
        where.status = status
      }

      // Add priority filter
      if (priority) {
        where.priority = priority
      }

      // Get total count
      const total = await prisma.complaint.count({ where })

      // Get complaints
      const complaints = await prisma.complaint.findMany({
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
          sortBy: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      })

      return NextResponse.json({
        complaints,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      })
    } catch (error) {
      console.error('Error fetching complaints:', error)
      return NextResponse.json(
        { error: 'Failed to fetch complaints' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * POST /api/complaints
 * Create a new complaint
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const body = await request.json()

      // Validate input
      const validationResult = complaintCreateSchema.safeParse(body)
      
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

      // Create complaint
      const complaint = await prisma.complaint.create({
        data: {
          computerId: data.computerId,
          issue: data.issue,
          description: data.description,
          priority: data.priority,
          notes: data.notes,
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
        entityType: 'Complaint',
        entityId: complaint.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: { 
          computerId: complaint.computerId, 
          issue: complaint.issue,
          priority: complaint.priority
        }
      })

      return NextResponse.json(complaint, { status: 201 })
    } catch (error) {
      console.error('Error creating complaint:', error)
      return NextResponse.json(
        { error: 'Failed to create complaint' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}
