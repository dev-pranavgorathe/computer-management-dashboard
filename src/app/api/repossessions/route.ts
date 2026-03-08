import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { repossessionCreateSchema, paginationSchema } from '@/lib/validations'

/**
 * GET /api/repossessions
 * Fetch all repossessions with pagination and filtering
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const { searchParams } = new URL(request.url)
      const { page, limit, search, sortBy, sortOrder } = paginationSchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '10',
        search: searchParams.get('search') || undefined,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      })

      const status = searchParams.get('status')

      const where: any = {
        isDeleted: false,
      }

      if (user.role === 'USER') {
        where.userId = user.id
      }

      if (search) {
        where.OR = [
          { podName: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
          { computerId: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status
      }

      const total = await prisma.repossession.count({ where })

      const repossessions = await prisma.repossession.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          }
        },
        orderBy: {
          createdAt: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      })

      return NextResponse.json({
        repossessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      })
    } catch (error) {
      console.error('Error fetching repossessions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch repossessions' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * POST /api/repossessions
 * Create a new repossession
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const body = await request.json()

      const validationResult = repossessionCreateSchema.safeParse(body)
      
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

      const repossession = await prisma.repossession.create({
        data: {
          podName: data.podName,
          computerId: data.computerId,
          reason: data.reason,
          notes: data.notes,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'CREATE',
        entityType: 'Repossession',
        entityId: repossession.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: { 
          podName: repossession.podName, 
          computerId: repossession.computerId
        }
      })

      return NextResponse.json(repossession, { status: 201 })
    } catch (error) {
      console.error('Error creating repossession:', error)
      return NextResponse.json(
        { error: 'Failed to create repossession' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}
