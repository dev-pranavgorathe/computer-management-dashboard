import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { redeploymentCreateSchema, paginationSchema } from '@/lib/validations'

/**
 * GET /api/redeployments
 * Fetch all redeployments with pagination and filtering
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
          { destination: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
          { shipmentId: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status
      }

      const total = await prisma.redeployment.count({ where })

      const redeployments = await prisma.redeployment.findMany({
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
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      })

      return NextResponse.json({
        redeployments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      })
    } catch (error) {
      console.error('Error fetching redeployments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch redeployments' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * POST /api/redeployments
 * Create a new redeployment
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const body = await request.json()

      const validationResult = redeploymentCreateSchema.safeParse(body)
      
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

      const redeployment = await prisma.redeployment.create({
        data: {
          shipmentId: data.shipmentId,
          destination: data.destination,
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
        entityType: 'Redeployment',
        entityId: redeployment.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: { 
          destination: redeployment.destination, 
          shipmentId: redeployment.shipmentId
        }
      })

      return NextResponse.json(redeployment, { status: 201 })
    } catch (error) {
      console.error('Error creating redeployment:', error)
      return NextResponse.json(
        { error: 'Failed to create redeployment' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

function getClientInfo(request: NextRequest) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  }
}
