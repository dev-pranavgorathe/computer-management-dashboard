import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, reviewNotes } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const approval = await prisma.approvalRequest.update({
      where: { id: params.id },
      data: {
        status,
        approverId: session.user.id,
        reviewedAt: new Date(),
        reviewNotes,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // TODO: Execute the approved action (delete shipment, complete, etc.)
    // This would involve checking approval.entityType and approval.action
    // and performing the actual operation

    return NextResponse.json({ success: true, approval })
  } catch (error: any) {
    console.error('Failed to process approval:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
