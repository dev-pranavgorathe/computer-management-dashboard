import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/auth-helpers'

function getDateRange(searchParams: URLSearchParams) {
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const from = dateFrom ? new Date(dateFrom) : null
  const to = dateTo ? new Date(dateTo) : null

  if (to) {
    to.setHours(23, 59, 59, 999)
  }

  return { from, to }
}

function bucketLabel(date: Date, bucket: 'day' | 'week') {
  if (bucket === 'day') {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  return `Week of ${start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await prisma.$connect()

      const { searchParams } = new URL(request.url)
      const { from, to } = getDateRange(searchParams)

      const shipmentDateWhere = from || to ? {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      } : undefined

      const createdAtWhere = from || to ? {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      } : undefined

      const ownershipFilter = user.role === 'USER' ? { userId: user.id } : {}

      const [shipments, complaints, repossessions, redeployments] = await Promise.all([
        prisma.shipment.findMany({
          where: {
            isDeleted: false,
            ...ownershipFilter,
            ...(shipmentDateWhere && { orderDate: shipmentDateWhere }),
          },
          select: {
            id: true,
            refId: true,
            podName: true,
            cpus: true,
            status: true,
            orderDate: true,
            createdAt: true,
          },
          orderBy: { orderDate: 'asc' },
        }),
        prisma.complaint.findMany({
          where: {
            isDeleted: false,
            ...ownershipFilter,
            ...(createdAtWhere && { createdAt: createdAtWhere }),
          },
          select: {
            id: true,
            refId: true,
            ticket: true,
            podName: true,
            priority: true,
            status: true,
            createdAt: true,
            solvedDate: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
        prisma.repossession.findMany({
          where: {
            isDeleted: false,
            ...ownershipFilter,
            ...(createdAtWhere && { createdAt: createdAtWhere }),
          },
          select: {
            id: true,
            refId: true,
            podName: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
        prisma.redeployment.findMany({
          where: {
            isDeleted: false,
            ...ownershipFilter,
            ...(createdAtWhere && { createdAt: createdAtWhere }),
          },
          select: {
            id: true,
            refId: true,
            podName: true,
            sourcePod: true,
            complaintTicket: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
      ])

      const completedShipments = shipments.filter(shipment => shipment.status === 'COMPLETED')
      const solvedComplaints = complaints.filter(complaint => complaint.status === 'SOLVED')

      const spanMs = from && to ? to.getTime() - from.getTime() : 0
      const bucket = spanMs > 1000 * 60 * 60 * 24 * 45 ? 'week' : 'day'

      const activityMap = new Map<string, { name: string; shipments: number; complaints: number; repossessions: number; redeployments: number }>()

      const addActivity = (date: Date, field: 'shipments' | 'complaints' | 'repossessions' | 'redeployments') => {
        const key = bucketLabel(date, bucket)
        const current = activityMap.get(key) || {
          name: key,
          shipments: 0,
          complaints: 0,
          repossessions: 0,
          redeployments: 0,
        }
        current[field] += 1
        activityMap.set(key, current)
      }

      shipments.forEach(item => addActivity(item.orderDate, 'shipments'))
      complaints.forEach(item => addActivity(item.createdAt, 'complaints'))
      repossessions.forEach(item => addActivity(item.createdAt, 'repossessions'))
      redeployments.forEach(item => addActivity(item.createdAt, 'redeployments'))

      const activityData = Array.from(activityMap.values())

      const byPriority = complaints.reduce<Record<string, number>>((acc, complaint) => {
        acc[complaint.priority] = (acc[complaint.priority] || 0) + 1
        return acc
      }, {})

      return NextResponse.json({
        dateRange: {
          from: from?.toISOString() ?? null,
          to: to?.toISOString() ?? null,
        },
        summary: {
          pcsDeployed: completedShipments.reduce((sum, shipment) => sum + shipment.cpus, 0),
          totalShipments: shipments.length,
          complaintsRaised: complaints.length,
          complaintsSolved: solvedComplaints.length,
          repossessions: repossessions.length,
          redeployments: redeployments.length,
          resolutionRate: complaints.length ? Number(((solvedComplaints.length / complaints.length) * 100).toFixed(2)) : 0,
        },
        distributions: {
          shipmentStatus: shipments.reduce<Record<string, number>>((acc, shipment) => {
            acc[shipment.status] = (acc[shipment.status] || 0) + 1
            return acc
          }, {}),
          complaintPriority: byPriority,
        },
        highlights: {
          completedPods: [...new Set(completedShipments.map(shipment => shipment.podName))].length,
          linkedRedeployments: redeployments.filter(item => item.complaintTicket).length,
        },
        activityData,
        achievements: [
          `${completedShipments.reduce((sum, shipment) => sum + shipment.cpus, 0)} PCs were fully deployed in the selected period.`,
          `${solvedComplaints.length} complaints were resolved${complaints.length ? ` with a ${Number(((solvedComplaints.length / complaints.length) * 100).toFixed(1))}% resolution rate` : ''}.`,
          `${redeployments.filter(item => item.complaintTicket).length} redeployments were linked to complaint resolution.`,
        ],
        challenges: [
          `${shipments.filter(item => item.status !== 'COMPLETED').length} shipments are still in progress.`,
          `${complaints.filter(item => item.status !== 'SOLVED').length} complaints remain open or in progress.`,
          `${repossessions.filter(item => item.status !== 'COMPLETED').length} repossessions still need completion.`,
        ],
      })
    } catch (error) {
      console.error('Error generating reports:', error)
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  })
}
