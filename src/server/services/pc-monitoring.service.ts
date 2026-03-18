/**
 * PC Monitoring Service
 * Handles all business logic for PC status tracking, activity logs, and website monitoring
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreatePCInput {
  pcId: string
  name: string
  podId?: string
  podName?: string
  serialNumber?: string
  model?: string
  os?: string
  cpu?: string
  ram?: string
  storage?: string
  ipAddress?: string
  macAddress?: string
  assignedUserId?: string
  notes?: string
}

export interface UpdatePCInput {
  name?: string
  podId?: string
  podName?: string
  serialNumber?: string
  model?: string
  os?: string
  cpu?: string
  ram?: string
  storage?: string
  ipAddress?: string
  macAddress?: string
  status?: string
  assignedUserId?: string | null
  notes?: string
  isActive?: boolean
}

export interface ActivityLogInput {
  pcId: string
  userId?: string
  action: string
  category: string
  description?: string
  details?: any
  duration?: number
}

export interface WebsiteLogInput {
  pcId: string
  userId?: string
  domain: string
  url?: string
  title?: string
  isBlocked?: boolean
  blockReason?: string
  duration?: number
}

export interface BlockedWebsiteInput {
  domain: string
  reason?: string
  category?: string
  blockLevel?: string
  allowedHours?: any
  addedById?: string
}

class PCMonitoringService {
  // ==================== PC MANAGEMENT ====================

  async createPC(data: CreatePCInput) {
    return await prisma.pC.create({
      data: {
        pcId: data.pcId,
        name: data.name,
        podId: data.podId,
        podName: data.podName,
        serialNumber: data.serialNumber,
        model: data.model,
        os: data.os,
        cpu: data.cpu,
        ram: data.ram,
        storage: data.storage,
        ipAddress: data.ipAddress,
        macAddress: data.macAddress,
        assignedUserId: data.assignedUserId,
        notes: data.notes,
        status: 'OFFLINE',
      },
    })
  }

  async updatePC(pcId: string, data: UpdatePCInput) {
    const pc = await prisma.pC.findFirst({ where: { pcId } })
    if (!pc) throw new Error('PC not found')

    return await prisma.pC.update({
      where: { id: pc.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async getPCById(pcId: string) {
    return await prisma.pC.findFirst({
      where: { pcId, isActive: true },
      include: {
        assignedUser: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { activityLogs: true, websiteLogs: true }
        }
      }
    })
  }

  async listPCs(filters?: {
    status?: string
    podId?: string
    isActive?: boolean
    search?: string
  }) {
    const where: any = { isActive: filters?.isActive ?? true }
    
    if (filters?.status) where.status = filters.status
    if (filters?.podId) where.podId = filters.podId
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { pcId: { contains: filters.search, mode: 'insensitive' } },
        { podName: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return await prisma.pC.findMany({
      where,
      include: {
        assignedUser: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { activityLogs: true, websiteLogs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async updatePCStatus(pcId: string, status: string) {
    const pc = await prisma.pC.findFirst({ where: { pcId } })
    if (!pc) throw new Error('PC not found')

    return await prisma.pC.update({
      where: { id: pc.id },
      data: {
        status,
        lastHeartbeat: status === 'ONLINE' ? new Date() : pc.lastHeartbeat,
        lastActiveAt: status === 'ONLINE' ? new Date() : pc.lastActiveAt,
        updatedAt: new Date(),
      },
    })
  }

  async deletePC(pcId: string) {
    const pc = await prisma.pC.findFirst({ where: { pcId } })
    if (!pc) throw new Error('PC not found')

    return await prisma.pC.update({
      where: { id: pc.id },
      data: { isActive: false, updatedAt: new Date() },
    })
  }

  // ==================== PC STATS ====================

  async getPCStats() {
    const [total, online, offline, maintenance] = await Promise.all([
      prisma.pC.count({ where: { isActive: true } }),
      prisma.pC.count({ where: { isActive: true, status: 'ONLINE' } }),
      prisma.pC.count({ where: { isActive: true, status: 'OFFLINE' } }),
      prisma.pC.count({ where: { isActive: true, status: 'MAINTENANCE' } }),
    ])

    return { total, online, offline, maintenance }
  }

  // ==================== ACTIVITY LOGS ====================

  async logActivity(data: ActivityLogInput) {
    const pc = await prisma.pC.findFirst({ where: { pcId: data.pcId } })
    if (!pc) throw new Error('PC not found')

    return await prisma.activityLog.create({
      data: {
        pcId: pc.id,
        userId: data.userId,
        action: data.action,
        category: data.category,
        description: data.description,
        details: data.details,
        duration: data.duration,
      },
    })
  }

  async getActivityLogs(filters?: {
    pcId?: string
    userId?: string
    action?: string
    category?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {}
    
    if (filters?.pcId) {
      const pc = await prisma.pC.findFirst({ where: { pcId: filters.pcId } })
      if (pc) where.pcId = pc.id
    }
    if (filters?.userId) where.userId = filters.userId
    if (filters?.action) where.action = filters.action
    if (filters?.category) where.category = filters.category

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          pc: { select: { pcId: true, name: true, podName: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.activityLog.count({ where }),
    ])

    return { logs, total }
  }

  // ==================== WEBSITE LOGS ====================

  async logWebsiteVisit(data: WebsiteLogInput) {
    const pc = await prisma.pC.findFirst({ where: { pcId: data.pcId } })
    if (!pc) throw new Error('PC not found')

    // Check if website is blocked
    const blockedSite = await prisma.blockedWebsite.findFirst({
      where: { domain: data.domain, isActive: true }
    })

    const isBlocked = !!blockedSite || data.isBlocked
    const blockReason = blockedSite?.reason || data.blockReason

    return await prisma.websiteUsageLog.create({
      data: {
        pcId: pc.id,
        userId: data.userId,
        domain: data.domain,
        url: data.url,
        title: data.title,
        isBlocked,
        blockReason,
        duration: data.duration,
      },
    })
  }

  async getWebsiteLogs(filters?: {
    pcId?: string
    userId?: string
    domain?: string
    isBlocked?: boolean
    limit?: number
    offset?: number
  }) {
    const where: any = {}
    
    if (filters?.pcId) {
      const pc = await prisma.pC.findFirst({ where: { pcId: filters.pcId } })
      if (pc) where.pcId = pc.id
    }
    if (filters?.userId) where.userId = filters.userId
    if (filters?.domain) where.domain = { contains: filters.domain, mode: 'insensitive' }
    if (filters?.isBlocked !== undefined) where.isBlocked = filters.isBlocked

    const [logs, total] = await Promise.all([
      prisma.websiteUsageLog.findMany({
        where,
        include: {
          pc: { select: { pcId: true, name: true, podName: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { visitedAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.websiteUsageLog.count({ where }),
    ])

    return { logs, total }
  }

  // ==================== BLOCKED WEBSITES ====================

  async blockWebsite(data: BlockedWebsiteInput) {
    return await prisma.blockedWebsite.upsert({
      where: { domain: data.domain },
      update: {
        reason: data.reason,
        category: data.category,
        blockLevel: data.blockLevel || 'FULL',
        allowedHours: data.allowedHours,
        addedById: data.addedById,
        isActive: true,
      },
      create: {
        domain: data.domain,
        reason: data.reason,
        category: data.category,
        blockLevel: data.blockLevel || 'FULL',
        allowedHours: data.allowedHours,
        addedById: data.addedById,
      },
    })
  }

  async unblockWebsite(domain: string) {
    return await prisma.blockedWebsite.update({
      where: { domain },
      data: { isActive: false },
    })
  }

  async listBlockedWebsites(category?: string) {
    const where: any = { isActive: true }
    if (category) where.category = category

    return await prisma.blockedWebsite.findMany({
      where,
      include: {
        addedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async checkWebsiteBlocked(domain: string) {
    return await prisma.blockedWebsite.findFirst({
      where: { domain, isActive: true }
    })
  }

  // ==================== STUDENT SESSIONS ====================

  async startSession(userId: string, pcId: string) {
    const pc = await prisma.pC.findFirst({ where: { pcId } })
    if (!pc) throw new Error('PC not found')

    // End any active session for this user
    await prisma.studentSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, logoutAt: new Date() }
    })

    // Start new session
    const session = await prisma.studentSession.create({
      data: {
        userId,
        pcId: pc.id,
        loginAt: new Date(),
        isActive: true,
      },
    })

    // Update PC status
    await this.updatePCStatus(pcId, 'ONLINE')

    // Log activity
    await this.logActivity({
      pcId,
      userId,
      action: 'SESSION_START',
      category: 'AUTH',
      description: 'User logged in',
    })

    return session
  }

  async endSession(userId: string, pcId: string) {
    const pc = await prisma.pC.findFirst({ where: { pcId } })
    if (!pc) throw new Error('PC not found')

    const session = await prisma.studentSession.findFirst({
      where: { userId, pcId: pc.id, isActive: true }
    })

    if (!session) return null

    const logoutAt = new Date()
    const duration = Math.floor((logoutAt.getTime() - session.loginAt.getTime()) / 1000)

    const updated = await prisma.studentSession.update({
      where: { id: session.id },
      data: {
        isActive: false,
        logoutAt,
        duration,
      },
    })

    // Log activity
    await this.logActivity({
      pcId,
      userId,
      action: 'SESSION_END',
      category: 'AUTH',
      description: 'User logged out',
      duration,
    })

    return updated
  }

  async getActiveSessions() {
    return await prisma.studentSession.findMany({
      where: { isActive: true },
      include: {
        user: { select: { id: true, name: true, email: true } },
        pc: { select: { pcId: true, name: true, podName: true } },
      },
      orderBy: { loginAt: 'desc' }
    })
  }
}

export const pcMonitoringService = new PCMonitoringService()
