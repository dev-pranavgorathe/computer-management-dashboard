import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import prisma from './prisma'

// User roles as strings (SQLite doesn't support enums)
type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER' | 'USER'

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
      }
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
 * Authentication middleware wrapper
 */
export async function withAuth(
  request: NextRequest,
  handler: (user: { id: string; email: string; name: string; role: string }) => Promise<Response>
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
      }
    })

    if (!user || !user.isActive || user.isDeleted) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return handler({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Check if user can modify a resource (owner or admin/manager)
 */
export async function canModifyResource(
  currentUserId: string,
  resourceOwnerId: string,
  currentUserRole: string
): Promise<boolean> {
  // Admins and managers can modify any resource
  if (currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER') {
    return true
  }
  
  // Users can only modify their own resources
  return currentUserId === resourceOwnerId
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
