import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, canModifyResource, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { repossessionUpdateSchema, idParamSchema, REPOSSESSION_STATUSES } from '@/lib/validations'

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
        return NextResponse.json({ error: 'Invalid repossession ID' }, { status: 400 })
      }

      const { id } = validation.data

      const repossession = await prisma.repossession.findFirst({
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

      if (!repossession) {
        return NextResponse.json({ error: 'Repossession not found' }, { status: 404 })
      }

      return NextResponse.json(repossession)
    } catch (error) {
      console.error('Error fetching repossession:', error)
      return NextResponse.json({ error: 'Failed to fetch repossession' }, { status: 500 })
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
        return NextResponse.json({ error: 'Invalid repossession ID' }, { status: 400 })
      }

      const { id } = validation.data

      const existingRepossession = await prisma.repossession.findFirst({
        where: { id, isDeleted: false },
      })

      if (!existingRepossession) {
        return NextResponse.json({ error: 'Repossession not found' }, { status: 404 })
      }

      if (
        existingRepossession.status === 'COMPLETED' &&
        user.role !== 'ADMIN' &&
        user.role !== 'MANAGER'
      ) {
        return NextResponse.json(
          { error: 'Cannot update a completed repossession' },
          { status: 400 }
        )
      }

      if (!await canModifyResource(user.id, existingRepossession.userId, user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to update this repossession' },
          { status: 403 }
        )
      }

      const body = await request.json()
      const validationResult = repossessionUpdateSchema.safeParse(body)

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))

        return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
      }

      const data = validationResult.data

      const repossession = await prisma.repossession.update({
        where: { id },
        data: {
          ...(data.podName && { podName: data.podName }),
          ...(data.shippingAddress !== undefined && { shippingAddress: data.shippingAddress }),
          ...(data.contactPerson !== undefined && { contactPerson: data.contactPerson }),
          ...(data.mobileNumber !== undefined && { mobileNumber: data.mobileNumber }),
          ...(data.components !== undefined && { components: data.components }),
          ...(data.serials !== undefined && { serials: data.serials }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.reshippedDate !== undefined && { reshippedDate: data.reshippedDate }),
          ...(data.status &&
            REPOSSESSION_STATUSES.includes(data.status as typeof REPOSSESSION_STATUSES[number]) && {
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
        entityType: 'Repossession',
        entityId: repossession.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({
          before: existingRepossession,
          after: repossession,
        }),
      })

      return NextResponse.json(repossession)
    } catch (error) {
      console.error('Error updating repossession:', error)
      return NextResponse.json({ error: 'Failed to update repossession' }, { status: 500 })
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
        return NextResponse.json({ error: 'Invalid repossession ID' }, { status: 400 })
      }

      const { id } = validation.data

      const existingRepossession = await prisma.repossession.findFirst({
        where: { id, isDeleted: false },
      })

      if (!existingRepossession) {
        return NextResponse.json({ error: 'Repossession not found' }, { status: 404 })
      }

      if (!await canModifyResource(user.id, existingRepossession.userId, user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this repossession' },
          { status: 403 }
        )
      }

      const repossession = await prisma.repossession.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      })

      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'DELETE',
        entityType: 'Repossession',
        entityId: repossession.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: JSON.stringify({ deletedAt: repossession.deletedAt }),
      })

      return NextResponse.json({ message: 'Repossession deleted successfully' })
    } catch (error) {
      console.error('Error deleting repossession:', error)
      return NextResponse.json({ error: 'Failed to delete repossession' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  })
}
