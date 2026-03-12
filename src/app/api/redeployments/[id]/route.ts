import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, canModifyResource, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { redeploymentUpdateSchema, idParamSchema, REDEPLOYMENT_STATUSES } from '@/lib/validations'

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
        return NextResponse.json({ error: 'Invalid redeployment ID' }, { status: 400 })
      }

      const { id } = validation.data

      const redeployment = await prisma.redeployment.findFirst({
        where: {
          id,
          isDeleted: false,
          ...(user.role === 'USER' && { userId: user.id }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      })

      if (!redeployment) {
        return NextResponse.json({ error: 'Redeployment not found' }, { status: 404 })
      }

      return NextResponse.json(redeployment)
    } catch (error) {
      console.error('Error fetching redeployment:', error)
      return NextResponse.json({ error: 'Failed to fetch redeployment' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  })
}

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
        return NextResponse.json({ error: 'Invalid redeployment ID' }, { status: 400 })
      }

      const { id } = validation.data

      const existingRedeployment = await prisma.redeployment.findFirst({
        where: { id, isDeleted: false },
      })

      if (!existingRedeployment) {
        return NextResponse.json({ error: 'Redeployment not found' }, { status: 404 })
      }

      if (
        existingRedeployment.status === 'COMPLETED' &&
        user.role !== 'ADMIN' &&
        user.role !== 'MANAGER'
      ) {
        return NextResponse.json(
          { error: 'Cannot update a completed redeployment' },
          { status: 400 }
        )
      }

      if (!await canModifyResource(user.id, existingRedeployment.userId, user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to update this redeployment' },
          { status: 403 }
        )
      }

      const body = await request.json()
      const validationResult = redeploymentUpdateSchema.safeParse(body)

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))

        return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
      }

      const data = validationResult.data

      const redeployment = await prisma.redeployment.update({
        where: { id },
        data: {
          ...(data.podName && { podName: data.podName }),
          ...(data.shippingAddress !== undefined && { shippingAddress: data.shippingAddress }),
          ...(data.contactPerson !== undefined && { contactPerson: data.contactPerson }),
          ...(data.mobileNumber !== undefined && { mobileNumber: data.mobileNumber }),
          ...(data.sourcePod !== undefined && { sourcePod: data.sourcePod }),
          ...(data.components !== undefined && { components: data.components }),
          ...(data.serials !== undefined && { serials: data.serials }),
          ...(data.complaintTicket !== undefined && { complaintTicket: data.complaintTicket }),
          ...(data.trackingId !== undefined && { trackingId: data.trackingId }),
          ...(data.orderDate && { orderDate: data.orderDate }),
          ...(data.dispatchDate !== undefined && { dispatchDate: data.dispatchDate }),
          ...(data.deliveryDate !== undefined && { deliveryDate: data.deliveryDate }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.status &&
            REDEPLOYMENT_STATUSES.includes(data.status as typeof REDEPLOYMENT_STATUSES[number]) && {
              status: data.status,
            }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'UPDATE',
        entityType: 'Redeployment',
        entityId: redeployment.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({
          before: existingRedeployment,
          after: redeployment,
        }),
      })

      return NextResponse.json(redeployment)
    } catch (error) {
      console.error('Error updating redeployment:', error)
      return NextResponse.json({ error: 'Failed to update redeployment' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  })
}

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
        return NextResponse.json({ error: 'Invalid redeployment ID' }, { status: 400 })
      }

      const { id } = validation.data

      const existingRedeployment = await prisma.redeployment.findFirst({
        where: { id, isDeleted: false },
      })

      if (!existingRedeployment) {
        return NextResponse.json({ error: 'Redeployment not found' }, { status: 404 })
      }

      if (!await canModifyResource(user.id, existingRedeployment.userId, user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this redeployment' },
          { status: 403 }
        )
      }

      const redeployment = await prisma.redeployment.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      })

      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'DELETE',
        entityType: 'Redeployment',
        entityId: redeployment.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({ deletedAt: redeployment.deletedAt }),
      })

      return NextResponse.json({ message: 'Redeployment deleted successfully' })
    } catch (error) {
      console.error('Error deleting redeployment:', error)
      return NextResponse.json({ error: 'Failed to delete redeployment' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  })
}
