import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth, canModifyResource, getClientInfo } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-logger'
import { shipmentUpdateSchema, idParamSchema } from '@/lib/validations'

/**
 * GET /api/shipments/[id]
 * Fetch a single shipment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      // Await params and validate ID
      const { id: paramId } = await params
      const validation = idParamSchema.safeParse({ id: paramId })
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid shipment ID' },
          { status: 400 }
        )
      }

      const { id } = validation.data

      // Fetch shipment
      const shipment = await prisma.shipment.findFirst({
        where: {
          id,
          isDeleted: false,
          // Non-admin users can only see their own shipments
          ...(user.role === 'USER' && { userId: user.id })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          }
        }
      })

      if (!shipment) {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(shipment)
    } catch (error) {
      console.error('Error fetching shipment:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shipment' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * PUT /api/shipments/[id]
 * Update a shipment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      // Await params and validate ID
      const { id: paramId } = await params
      const validation = idParamSchema.safeParse({ id: paramId })
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid shipment ID' },
          { status: 400 }
        )
      }

      const { id } = validation.data

      // Fetch existing shipment
      const existingShipment = await prisma.shipment.findFirst({
        where: { id, isDeleted: false }
      })

      if (!existingShipment) {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        )
      }

      // Check authorization
      if (!await canModifyResource(user.id, existingShipment.userId, user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to update this shipment' },
          { status: 403 }
        )
      }

      // Parse and validate request body
      const body = await request.json()
      const validationResult = shipmentUpdateSchema.safeParse(body)
      
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

      // Update shipment
      const shipment = await prisma.shipment.update({
        where: { id },
        data: {
          ...(data.podName && { podName: data.podName }),
          ...(data.shippingAddress && { shippingAddress: data.shippingAddress }),
          ...(data.contactPerson && { contactPerson: data.contactPerson }),
          ...(data.mobileNumber && { mobileNumber: data.mobileNumber }),
          ...(data.peripherals && { peripherals: data.peripherals }),
          ...(data.orderDate && { orderDate: data.orderDate }),
          ...(data.dispatchDate !== undefined && { dispatchDate: data.dispatchDate }),
          ...(data.deliveryDate !== undefined && { deliveryDate: data.deliveryDate }),
          ...(data.setupDate !== undefined && { setupDate: data.setupDate }),
          ...(data.totalCost && { totalCost: data.totalCost }),
          ...(data.notes !== undefined && { notes: data.notes }),
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

      // Create audit log
      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'UPDATE',
        entityType: 'Shipment',
        entityId: shipment.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: { 
          before: existingShipment,
          after: shipment 
        }
      })

      return NextResponse.json(shipment)
    } catch (error) {
      console.error('Error updating shipment:', error)
      return NextResponse.json(
        { error: 'Failed to update shipment' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

/**
 * DELETE /api/shipments/[id]
 * Soft delete a shipment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      // Await params and validate ID
      const { id: paramId } = await params
      const validation = idParamSchema.safeParse({ id: paramId })
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid shipment ID' },
          { status: 400 }
        )
      }

      const { id } = validation.data

      // Fetch existing shipment
      const existingShipment = await prisma.shipment.findFirst({
        where: { id, isDeleted: false }
      })

      if (!existingShipment) {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        )
      }

      // Check authorization
      if (!await canModifyResource(user.id, existingShipment.userId, user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this shipment' },
          { status: 403 }
        )
      }

      // Soft delete shipment
      const shipment = await prisma.shipment.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        }
      })

      // Create audit log
      const clientInfo = getClientInfo(request)
      await createAuditLog({
        action: 'DELETE',
        entityType: 'Shipment',
        entityId: shipment.id,
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        changes: { deletedAt: shipment.deletedAt }
      })

      return NextResponse.json(
        { message: 'Shipment deleted successfully' },
        { status: 200 }
      )
    } catch (error) {
      console.error('Error deleting shipment:', error)
      return NextResponse.json(
        { error: 'Failed to delete shipment' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}
