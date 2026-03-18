import { NextRequest } from 'next/server'
import { getActiveSessionsController } from '@/server/controllers/pc-monitoring.controller'

export async function GET(req: NextRequest) {
  return await getActiveSessionsController(req)
}
