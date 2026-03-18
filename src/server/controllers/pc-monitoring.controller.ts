/**
 * PC Monitoring Controller
 * Handles HTTP requests for PC monitoring endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { pcMonitoringService } from '../services/pc-monitoring.service'
import { getServerSession } from 'next-auth'

// ==================== PC CRUD ====================

export async function createPCController(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const pc = await pcMonitoringService.createPC(body)

    return NextResponse.json({ success: true, pc }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function listPCsController(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const filters = {
      status: searchParams.get('status') || undefined,
      podId: searchParams.get('podId') || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : true,
      search: searchParams.get('search') || undefined,
    }

    const pcs = await pcMonitoringService.listPCs(filters)
    const stats = await pcMonitoringService.getPCStats()

    return NextResponse.json({ pcs, stats })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function getPCController(req: NextRequest, pcId: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pc = await pcMonitoringService.getPCById(pcId)
    if (!pc) {
      return NextResponse.json({ error: 'PC not found' }, { status: 404 })
    }

    return NextResponse.json({ pc })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function updatePCController(req: NextRequest, pcId: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const pc = await pcMonitoringService.updatePC(pcId, body)

    return NextResponse.json({ success: true, pc })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function deletePCController(pcId: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await pcMonitoringService.deletePC(pcId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// ==================== ACTIVITY LOGS ====================

export async function getActivityLogsController(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const filters = {
      pcId: searchParams.get('pcId') || undefined,
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') || undefined,
      category: searchParams.get('category') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const { logs, total } = await pcMonitoringService.getActivityLogs(filters)
    return NextResponse.json({ logs, total })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ==================== WEBSITE LOGS ====================

export async function getWebsiteLogsController(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const filters = {
      pcId: searchParams.get('pcId') || undefined,
      userId: searchParams.get('userId') || undefined,
      domain: searchParams.get('domain') || undefined,
      isBlocked: searchParams.get('isBlocked') === 'true' ? true : undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const { logs, total } = await pcMonitoringService.getWebsiteLogs(filters)
    return NextResponse.json({ logs, total })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ==================== BLOCKED WEBSITES ====================

export async function blockWebsiteController(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const blocked = await pcMonitoringService.blockWebsite({
      ...body,
      addedById: session.user.id,
    })

    return NextResponse.json({ success: true, blocked }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function unblockWebsiteController(domain: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await pcMonitoringService.unblockWebsite(domain)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function listBlockedWebsitesController(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const blocked = await pcMonitoringService.listBlockedWebsites(category)

    return NextResponse.json({ blocked })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ==================== SESSIONS ====================

export async function getActiveSessionsController(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await pcMonitoringService.getActiveSessions()
    return NextResponse.json({ sessions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
