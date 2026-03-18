import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (status && status !== 'ALL') where.status = status

    const approvals = await prisma.approvalRequest.findMany({
      where,
      include: {
        requester: {
          select: { id: true, name: true, email: true, role: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ approvals })
  } catch (error: any) {
    console.error('Failed to fetch approvals:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
