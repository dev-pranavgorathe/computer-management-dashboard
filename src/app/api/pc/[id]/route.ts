import { NextRequest } from 'next/server'
import { 
  getPCController, 
  updatePCController, 
  deletePCController 
} from '@/server/controllers/pc-monitoring.controller'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await getPCController(req, params.id)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await updatePCController(req, params.id)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await deletePCController(params.id)
}
