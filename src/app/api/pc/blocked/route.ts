import { NextRequest } from 'next/server'
import { 
  blockWebsiteController, 
  listBlockedWebsitesController 
} from '@/server/controllers/pc-monitoring.controller'

export async function GET(req: NextRequest) {
  return await listBlockedWebsitesController(req)
}

export async function POST(req: NextRequest) {
  return await blockWebsiteController(req)
}
