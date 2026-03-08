import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'
import prisma from './prisma'

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Role hierarchy for permission checks
 * Higher roles inherit permissions from lower roles
 */
const roleHierarchy: Record<UserRole, number> = {
  ADMIN: 4,
  MANAGER: 3,
  VIEWER: 2,
  USER: 1,
}

/**
 * Check if user role meets minimum required role level
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole]
}

/**
 * Get current session with user data from database
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isDeleted: true,
      },
    })

    if (!user || !user.isActive || user.isDeleted) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Authentication middleware wrapper for API routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  return handler(user)
}

/**
 * Authorization middleware with role check
 */
export async function withRole(
  request: NextRequest,
  requiredRoles: UserRole[],
  handler: (user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  if (!hasRole(user.role, requiredRoles)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  return handler(user)
}

/**
 * Check if user owns a resource or has admin/manager role
 */
export async function canModifyResource(
  userId: string,
  resourceUserId: string,
  userRole: UserRole
): Promise<boolean> {
  // User can modify their own resources
  if (userId === resourceUserId) {
    return true
  }

  // Admins and managers can modify any resource
  return hasMinimumRole(userRole, 'MANAGER')
}

/**
 * Extract client information from request
 */
export function getClientInfo(request: NextRequest) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  }
}
