import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/auth-helpers'

// Get all roles and permissions
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      // Only SUPER_ADMIN can manage permissions
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Only admins can view permissions' },
          { status: 403 }
        )
      }

      const roles = await prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true
        }
      })

      const roleStats = roles.map(r => ({
        role: r.role,
        userCount: r._count.role
      }))

      // Define permission matrix (in production, this would be in DB)
      const permissionMatrix = {
        SUPER_ADMIN: {
          dashboard: { view: true, edit: true, delete: true, export: true },
          shipments: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
          complaints: { view: true, create: true, edit: true, delete: true, resolve: true, export: true },
          repossessions: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
          redeployments: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
          templates: { view: true, create: true, edit: true, delete: true },
          approvals: { view: true, approve: true, reject: true, override: true },
          auditLogs: { view: true, export: true, delete: true },
          reports: { view: true, create: true, export: true, schedule: true },
          settings: { view: true, edit: true },
          users: { view: true, create: true, edit: true, delete: true, manageRoles: true }
        },
        ADMIN: {
          dashboard: { view: true, edit: true, delete: true, export: true },
          shipments: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
          complaints: { view: true, create: true, edit: true, delete: true, resolve: true, export: true },
          repossessions: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
          redeployments: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
          templates: { view: true, create: true, edit: true, delete: true },
          approvals: { view: true, approve: true, reject: true, override: false },
          auditLogs: { view: true, export: true, delete: false },
          reports: { view: true, create: true, export: true, schedule: true },
          settings: { view: true, edit: true },
          users: { view: true, create: true, edit: true, delete: false, manageRoles: false }
        },
        MANAGER: {
          dashboard: { view: true, edit: true, delete: false, export: true },
          shipments: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
          complaints: { view: true, create: true, edit: true, delete: false, resolve: true, export: true },
          repossessions: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
          redeployments: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
          templates: { view: true, create: true, edit: true, delete: false },
          approvals: { view: true, approve: true, reject: true, override: false },
          auditLogs: { view: true, export: true, delete: false },
          reports: { view: true, create: true, export: true, schedule: false },
          settings: { view: true, edit: false },
          users: { view: true, create: false, edit: false, delete: false, manageRoles: false }
        },
        USER: {
          dashboard: { view: true, edit: false, delete: false, export: false },
          shipments: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
          complaints: { view: true, create: true, edit: true, delete: false, resolve: false, export: false },
          repossessions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
          redeployments: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
          templates: { view: false, create: false, edit: false, delete: false },
          approvals: { view: false, approve: false, reject: false, override: false },
          auditLogs: { view: false, export: false, delete: false },
          reports: { view: true, create: false, export: false, schedule: false },
          settings: { view: false, edit: false },
          users: { view: false, create: false, edit: false, delete: false, manageRoles: false }
        },
        VIEWER: {
          dashboard: { view: true, edit: false, delete: false, export: false },
          shipments: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
          complaints: { view: true, create: false, edit: false, delete: false, resolve: false, export: false },
          repossessions: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
          redeployments: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
          templates: { view: false, create: false, edit: false, delete: false },
          approvals: { view: false, approve: false, reject: false, override: false },
          auditLogs: { view: false, export: false, delete: false },
          reports: { view: true, create: false, export: false, schedule: false },
          settings: { view: false, edit: false },
          users: { view: false, create: false, edit: false, delete: false, manageRoles: false }
        }
      }

      return NextResponse.json({
        roleStats,
        permissionMatrix
      })
    } catch (error) {
      console.error('Error fetching permissions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch permissions' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}

// Update role permissions (SUPER_ADMIN only)
export async function PUT(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Only admin can update permissions' },
          { status: 403 }
        )
      }

      const body = await request.json()
      const { userId, newRole } = body

      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_ROLE',
          entityType: 'User',
          entityId: userId,
          userId: user.id,
          changes: JSON.stringify({
            oldRole: user.role,
            newRole: newRole
          })
        }
      })

      return NextResponse.json({
        message: 'Role updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      })
    } catch (error) {
      console.error('Error updating permissions:', error)
      return NextResponse.json(
        { error: 'Failed to update permissions' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  })
}
