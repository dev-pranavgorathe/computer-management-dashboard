import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$connect()
    const shipmentCount = await prisma.shipment.count().catch(() => -1)
    const complaintCount = await prisma.complaint.count().catch(() => -1)

    return NextResponse.json({
      ok: true,
      db: 'connected',
      shipmentCount,
      complaintCount,
      ts: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        db: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown DB error',
        ts: new Date().toISOString(),
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}
