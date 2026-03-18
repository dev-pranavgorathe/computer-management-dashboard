import { NextRequest } from 'next/server'
import { 
  createPCController, 
  listPCsController 
} from '@/server/controllers/pc-monitoring.controller'

export async function GET(req: NextRequest) {
  return await listPCsController(req)
}

export async function POST(req: NextRequest) {
  return await createPCController(req)
}
