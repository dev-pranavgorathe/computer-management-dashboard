import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { complaintCreateSchema, complaintUpdateSchema, paginationSchema, COMPLAINT_STATUSES, DEVICE_TYPES } from '@/lib/validations'

// Helper to generate refId
async function generateComplaintRefId(): Promise<string> {
  const lastComplaint = await prisma.complaint.findFirst({
    where: { refId: { startsWith: 'CMP-' } },
    orderBy: { createdAt: 'desc' },
    select: { refId: true },
  })
  
  if (!lastComplaint || !lastComplaint.refId) {
    return 'CMP-001'
  }
  
  const lastNum = parseInt(lastComplaint.refId.replace('CMP-', ''), 10)
  return `CMP-${String(lastNum + 1).padStart(3, '0')}`
}

// Helper to generate ticket number
async function generateTicketNumber(): Promise<string> {
  const lastComplaint = await prisma.complaint.findFirst({
    where: { ticket: { startsWith: 'TKT-' } },
    orderBy: { createdAt: 'desc' },
    select: { ticket: true },
  })
  
  if (!lastComplaint || !lastComplaint.ticket) {
    return 'TKT-0001'
  }
  
  const lastNum = parseInt(lastComplaint.ticket.replace('TKT-', ''), 10)
  return `TKT-${String(lastNum + 1).padStart(4, '0')}`
}

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
        limit: searchParams.get('limit') || '50',
        search: searchParams.get('search') || undefined,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      })

      const status = searchParams.get('status')
      const priority = searchParams.get('priority')
      const deviceType = searchParams.get('deviceType')

      // Build where clause
      const where: Record<string, unknown> = {
        isDeleted: false,
      }

      // Non-admin users can only see their own complaints
      if (user.role === 'USER') {
        where.userId = user.id
      }

      // Add search filter
      if (search) {
        where.OR = [
          { podName: { contains: search } },
          { refId: { contains: search } },
          { ticket: { contains: search } },
          { issue: { contains: search } },
          { deviceSerial: { contains: search } },
        ]
      }

      // Add status filter
      if (status && COMPLAINT_STATUSES.includes(status as typeof COMPLAINT_STATUSES[number])) {
        where.status = status
      }

      // Add priority filter
      if (priority) {
        where.priority = priority
      }

      // Add device type filter
      if (deviceType && DEVICE_TYPES.includes(deviceType as typeof DEVICE_TYPES[number])) {
        where.deviceType = deviceType
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
          createdAt: sortOrder,
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
 * PRD: Phase is optional at creation
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

      if (!data.podName || !data.podName.trim()) {
        return NextResponse.json(
          { error: 'Validation failed', details: [{ field: 'podName', message: 'POD Name is required' }] },
          { status: 400 }
        )
      }
      const podName = data.podName.trim()

      // Generate IDs
      const refId = await generateComplaintRefId()
      const ticket = await generateTicketNumber()

      // Create complaint
      const complaint = await prisma.complaint.create({
        data: {
          refId,
          ticket,
          podName,
          phase: data.phase, // Optional per PRD
          deviceType: data.deviceType || 'CPU',
          deviceSerial: data.deviceSerial,
          issue: data.issue,
          description: data.description,
          contactPerson: data.contactPerson,
          mobileNumber: data.mobileNumber,
          attachments: data.attachments,
          priority: data.priority || 'MEDIUM',
          status: 'OPEN',
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
        changes: JSON.stringify({ 
          refId: complaint.refId,
          ticket: complaint.ticket,
          podName: complaint.podName, 
          issue: complaint.issue,
          deviceType: complaint.deviceType,
        })
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
