import { NextRequest } from 'next/server'
import { getActivityLogsController } from '@/server/controllers/pc-monitoring.controller'

export async function GET(req: NextRequest) {
  return await getActivityLogsController(req)
}
