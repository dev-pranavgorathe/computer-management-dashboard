import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      // Only ADMIN can view all users
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Only admin can view users' },
          { status: 403 }
        )
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      })

      return NextResponse.json({ users })
    } catch (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}
