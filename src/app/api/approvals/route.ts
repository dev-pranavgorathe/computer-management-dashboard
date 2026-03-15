import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Only manager/admin can view approvals' }, { status: 403 })
      }

      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') || 'PENDING'

      const approvals = await prisma.approvalRequest.findMany({
        where: { status },
        include: {
          requester: { select: { id: true, name: true, email: true } },
          approver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })

      return NextResponse.json({ approvals })
    } catch (error) {
      console.error('Error fetching approvals', error)
      return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  })
}
