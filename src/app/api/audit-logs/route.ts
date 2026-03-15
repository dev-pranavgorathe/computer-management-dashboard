import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      if (user.role === 'USER') {
        return NextResponse.json({ error: 'Only viewer/manager/admin can access audit logs' }, { status: 403 })
      }

      const { searchParams } = new URL(request.url)
      const entityType = searchParams.get('entityType') || undefined
      const action = searchParams.get('action') || undefined
      const limit = Math.min(Number(searchParams.get('limit') || 100), 200)

      const logs = await prisma.auditLog.findMany({
        where: {
          ...(entityType ? { entityType } : {}),
          ...(action ? { action } : {}),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      return NextResponse.json({ logs })
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  })
}
