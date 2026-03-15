import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, canModifyResource, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { shipmentUpdateSchema, idParamSchema, SHIPMENT_STATUSES } from '@/lib/validations'

async function createApprovalRequest(params: {
  entityId: string
  action: 'DELETE' | 'COMPLETE'
  requesterId: string
  reason?: string
  payload?: Record<string, unknown>
}) {
  const existing = await prisma.approvalRequest.findFirst({
    where: {
      entityType: 'Shipment',
      entityId: params.entityId,
      action: params.action,
      status: 'PENDING',
    }
  })

  if (existing) return existing

  return prisma.approvalRequest.create({
    data: {
      entityType: 'Shipment',
      entityId: params.entityId,
      action: params.action,
      status: 'PENDING',
      reason: params.reason,
      payload: params.payload ? JSON.stringify(params.payload) : null,
      requesterId: params.requesterId,
    }
  })
}

/**
 * GET /api/shipments/[id]
 * Fetch a single shipment by ID
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
          { error: 'Invalid shipment ID' },
          { status: 400 }
        )
      }

      const { id } = validation.data

      const shipment = await prisma.shipment.findFirst({
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
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

      if (!shipment) {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(shipment)
    } catch (error) {
      console.error('Error fetching shipment:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shipment' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * PUT /api/shipments/[id]
 * Update a shipment
 * PRD: Editable until COMPLETED status
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
          { error: 'Invalid shipment ID' },
          { status: 400 }
        )
      }

      const { id } = validation.data

      const existingShipment = await prisma.shipment.findFirst({
        where: { id, isDeleted: false }
      })

      if (!existingShipment) {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        )
      }

      // PRD: COMPLETED status is locked - no edits allowed
      if (existingShipment.status === 'COMPLETED') {
        return NextResponse.json(
          { error: 'Cannot update a completed shipment' },
          { status: 400 }
        )
      }

      if (user.role === 'VIEWER') {
        return NextResponse.json(
          { error: 'Viewers cannot update shipments' },
          { status: 403 }
        )
      }

      if (!await canModifyResource(user.id, existingShipment.userId, user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to update this shipment' },
          { status: 403 }
        )
      }

      const body = await request.json()
      const validationResult = shipmentUpdateSchema.safeParse(body)
      
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

      if (data.status === 'COMPLETED' && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
        const req = await createApprovalRequest({
          entityId: id,
          action: 'COMPLETE',
          requesterId: user.id,
          reason: 'Completion requires manager/admin approval',
          payload: { requestedStatus: 'COMPLETED' },
        })

        await prisma.shipment.update({
          where: { id },
          data: { approvalStatus: 'PENDING' },
        })

        return NextResponse.json({
          message: 'Completion approval requested',
          approvalRequestId: req.id,
          status: 'PENDING_APPROVAL',
        }, { status: 202 })
      }

      // Update shipment with PRD fields
      const shipment = await prisma.shipment.update({
        where: { id },
        data: {
          ...(data.podName && { podName: data.podName }),
          ...(data.shippingAddress && { shippingAddress: data.shippingAddress }),
          ...(data.contactPerson && { contactPerson: data.contactPerson }),
          ...(data.mobileNumber && { mobileNumber: data.mobileNumber }),
          ...(data.cpus && { cpus: data.cpus }),
          ...(data.components !== undefined && { components: data.components }),
          ...(data.serials !== undefined && { serials: data.serials }),
          ...(data.trackingId !== undefined && { trackingId: data.trackingId }),
          ...(data.qcReport !== undefined && { qcReport: data.qcReport }),
          ...(data.signedQc !== undefined && { signedQc: data.signedQc }),
          ...(data.orderDate && { orderDate: data.orderDate }),
          ...(data.dispatchDate !== undefined && { dispatchDate: data.dispatchDate }),
          ...(data.deliveryDate !== undefined && { deliveryDate: data.deliveryDate }),
          ...(data.totalCost !== undefined && { totalCost: data.totalCost }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.ownerId !== undefined && { ownerId: data.ownerId || null }),
          ...(data.team !== undefined && { team: data.team || null }),
          ...(data.location !== undefined && { location: data.location || null }),
          ...(data.status && SHIPMENT_STATUSES.includes(data.status as typeof SHIPMENT_STATUSES[number]) && { status: data.status }),
          ...(data.status === 'COMPLETED' && (user.role === 'ADMIN' || user.role === 'MANAGER') && { approvalStatus: 'APPROVED' }),
        },
        include: {
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
      })

      // Create audit log
      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'UPDATE',
        entityType: 'Shipment',
        entityId: shipment.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({ 
          before: existingShipment,
          after: shipment 
        })
      })

      return NextResponse.json(shipment)
    } catch (error) {
      console.error('Error updating shipment:', error)
      return NextResponse.json(
        { error: 'Failed to update shipment' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * DELETE /api/shipments/[id]
 * Soft delete a shipment
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
          { error: 'Invalid shipment ID' },
          { status: 400 }
        )
      }

      const { id } = validation.data

      const existingShipment = await prisma.shipment.findFirst({
        where: { id, isDeleted: false }
      })

      if (!existingShipment) {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        )
      }

      if (!await canModifyResource(user.id, existingShipment.userId, user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this shipment' },
          { status: 403 }
        )
      }

      if (user.role === 'VIEWER') {
        return NextResponse.json(
          { error: 'Viewers cannot delete shipments' },
          { status: 403 }
        )
      }

      if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
        const req = await createApprovalRequest({
          entityId: id,
          action: 'DELETE',
          requesterId: user.id,
          reason: 'Deletion requires manager/admin approval',
        })

        await prisma.shipment.update({
          where: { id },
          data: { approvalStatus: 'PENDING' },
        })

        return NextResponse.json({
          message: 'Deletion approval requested',
          approvalRequestId: req.id,
          status: 'PENDING_APPROVAL',
        }, { status: 202 })
      }

      const shipment = await prisma.shipment.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        }
      })

      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'DELETE',
        entityType: 'Shipment',
        entityId: shipment.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({ deletedAt: shipment.deletedAt })
      })

      return NextResponse.json(
        { message: 'Shipment deleted successfully' },
        { status: 200 }
      )
    } catch (error) {
      console.error('Error deleting shipment:', error)
      return NextResponse.json(
        { error: 'Failed to delete shipment' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}
