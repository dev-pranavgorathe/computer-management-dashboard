import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, canModifyResource, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { complaintUpdateSchema, idParamSchema } from '@/lib/validations'

/**
 * GET /api/complaints/[id]
 * Fetch a single complaint by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const { id: paramId } = await params
      const validation = idParamSchema.safeParse({ id: paramId })
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid complaint ID' },
          { status: 400 }
        )
      }

      const { id } = validation.data

      const complaint = await prisma.complaint.findFirst({
        where: {
          id,
          isDeleted: false,
          ...(user.role === 'USER' && { userId: user.id })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          }
        }
      })

      if (!complaint) {
        return NextResponse.json(
          { error: 'Complaint not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(complaint)
    } catch (error) {
      console.error('Error fetching complaint:', error)
      return NextResponse.json(
        { error: 'Failed to fetch complaint' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * PUT /api/complaints/[id]
 * Update a complaint
 * PRD: All fields editable before SOLVED status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const { id: paramId } = await params
      const validation = idParamSchema.safeParse({ id: paramId })
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid complaint ID' },
          { status: 400 }
        )
      }

      const { id } = validation.data

      const existingComplaint = await prisma.complaint.findFirst({
        where: { id, isDeleted: false }
      })

      if (!existingComplaint) {
        return NextResponse.json(
          { error: 'Complaint not found' },
          { status: 404 }
        )
      }

      // PRD: SOLVED status is locked - no edits allowed
      if (existingComplaint.status === 'SOLVED') {
        return NextResponse.json(
          { error: 'Cannot update a solved complaint' },
          { status: 400 }
        )
      }

      if (!await canModifyResource(user.id, existingComplaint.userId, user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to update this complaint' },
          { status: 403 }
        )
      }

      const body = await request.json()
      const validationResult = complaintUpdateSchema.safeParse(body)
      
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

      const complaint = await prisma.complaint.update({
        where: { id },
        data: {
          ...(data.podName && { podName: data.podName }),
          ...(data.phase !== undefined && { phase: data.phase }),
          ...(data.deviceType && { deviceType: data.deviceType }),
          ...(data.deviceSerial !== undefined && { deviceSerial: data.deviceSerial }),
          ...(data.issue && { issue: data.issue }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.contactPerson !== undefined && { contactPerson: data.contactPerson }),
          ...(data.mobileNumber !== undefined && { mobileNumber: data.mobileNumber }),
          ...(data.status && { status: data.status }),
          ...(data.priority && { priority: data.priority }),
          ...(data.resolution !== undefined && { resolution: data.resolution }),
          ...(data.remarks !== undefined && { remarks: data.remarks }),
          ...(data.attachments !== undefined && { attachments: data.attachments }),
          ...(data.solvedDate !== undefined && { solvedDate: data.solvedDate }),
          ...(body.resolutionMethod !== undefined && { resolutionMethod: body.resolutionMethod || null }),
          ...(body.mailSent !== undefined && { mailSent: body.mailSent }),
          ...(body.mailSentAt !== undefined && { mailSentAt: body.mailSentAt ? new Date(body.mailSentAt) : null }),
          ...(body.ticket !== undefined && { ticket: body.ticket || null }),
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

      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'UPDATE',
        entityType: 'Complaint',
        entityId: complaint.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({ 
          before: existingComplaint,
          after: complaint 
        })
      })

      return NextResponse.json(complaint)
    } catch (error) {
      console.error('Error updating complaint:', error)
      return NextResponse.json(
        { error: 'Failed to update complaint' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * DELETE /api/complaints/[id]
 * Soft delete a complaint
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const { id: paramId } = await params
      const validation = idParamSchema.safeParse({ id: paramId })
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid complaint ID' },
          { status: 400 }
        )
      }

      const { id } = validation.data

      const existingComplaint = await prisma.complaint.findFirst({
        where: { id, isDeleted: false }
      })

      if (!existingComplaint) {
        return NextResponse.json(
          { error: 'Complaint not found' },
          { status: 404 }
        )
      }

      if (!await canModifyResource(user.id, existingComplaint.userId, user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this complaint' },
          { status: 403 }
        )
      }

      const complaint = await prisma.complaint.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        }
      })

      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'DELETE',
        entityType: 'Complaint',
        entityId: complaint.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({ deletedAt: complaint.deletedAt })
      })

      return NextResponse.json(
        { message: 'Complaint deleted successfully' },
        { status: 200 }
      )
    } catch (error) {
      console.error('Error deleting complaint:', error)
      return NextResponse.json(
        { error: 'Failed to delete complaint' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}
