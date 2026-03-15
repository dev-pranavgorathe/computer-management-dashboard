import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Only manager/admin can review approvals' }, { status: 403 })
      }

      const { id } = await params
      const body = await request.json()
      const decision = body?.decision as 'APPROVE' | 'REJECT'

      if (!decision || !['APPROVE', 'REJECT'].includes(decision)) {
        return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })
      }

      const approval = await prisma.approvalRequest.findUnique({ where: { id } })
      if (!approval) return NextResponse.json({ error: 'Approval request not found' }, { status: 404 })
      if (approval.status !== 'PENDING') return NextResponse.json({ error: 'Approval already processed' }, { status: 400 })

      const updated = await prisma.approvalRequest.update({
        where: { id },
        data: {
          status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          approverId: user.id,
          reviewedAt: new Date(),
        }
      })

      if (approval.entityType === 'Shipment') {
        if (decision === 'APPROVE' && approval.action === 'DELETE') {
          await prisma.shipment.update({
            where: { id: approval.entityId },
            data: {
              isDeleted: true,
              deletedAt: new Date(),
              approvalStatus: 'APPROVED',
            }
          })
        } else if (decision === 'APPROVE' && approval.action === 'COMPLETE') {
          await prisma.shipment.update({
            where: { id: approval.entityId },
            data: {
              status: 'COMPLETED',
              approvalStatus: 'APPROVED',
            }
          })
        } else {
          await prisma.shipment.update({
            where: { id: approval.entityId },
            data: { approvalStatus: 'REJECTED' }
          })
        }
      }

      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'UPDATE',
        entityType: 'ApprovalRequest',
        entityId: updated.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: {
          decision,
          action: updated.action,
          targetEntity: `${updated.entityType}:${updated.entityId}`,
        }
      })

      return NextResponse.json({ message: `Request ${decision.toLowerCase()}d`, approval: updated })
    } catch (error) {
      console.error('Error processing approval', error)
      return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  })
}
