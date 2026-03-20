import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const approval = await prisma.approvalRequest.update({
      where: { id },
      data: {
        status,
        approverId: session.user.id,
        reviewedAt: new Date(),
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, role: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ success: true, approval })
  } catch (error: any) {
    console.error('Failed to process approval:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const approval = await prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: { id: true, name: true, email: true, role: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    return NextResponse.json({ approval })
  } catch (error: any) {
    console.error('Failed to fetch approval:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
