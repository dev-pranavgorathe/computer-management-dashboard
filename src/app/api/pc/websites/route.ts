import { NextRequest } from 'next/server'
import { getWebsiteLogsController } from '@/server/controllers/pc-monitoring.controller'

export async function GET(req: NextRequest) {
  return await getWebsiteLogsController(req)
}
