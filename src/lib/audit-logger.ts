import prisma from './prisma'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT'

interface AuditLogData {
  action: AuditAction
  entityType: string
  entityId: string
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  changes?: Record<string, unknown>
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        changes: data.changes || null,
      },
    })
  } catch (error) {
    // Log error but don't throw - audit logging should not break operations
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Batch create audit logs
 */
export async function createAuditLogs(logs: AuditLogData[]): Promise<void> {
  try {
    await prisma.auditLog.createMany({
      data: logs.map(log => ({
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        userId: log.userId,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        changes: log.changes || null,
      })),
    })
  } catch (error) {
    console.error('Failed to create audit logs:', error)
  }
}

/**
 * Get audit logs for an entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string,
  limit: number = 50
) {
  return prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

/**
 * Get recent audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
) {
  return prisma.auditLog.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}
