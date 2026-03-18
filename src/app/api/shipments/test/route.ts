import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    console.log('[TEST] Connecting to database...')
    await prisma.$connect()
    console.log('[TEST] Database connected successfully')
    
    const testShipment = await prisma.shipment.findFirst()
    console.log('[TEST] Query successful, found shipment:', testShipment?.id)
    
    return NextResponse.json({
      ok: true,
      message: 'Database test successful',
      shipmentId: testShipment?.id || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[TEST] Database error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
