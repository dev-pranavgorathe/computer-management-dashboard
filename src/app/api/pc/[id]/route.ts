import { NextRequest } from 'next/server'
import { 
  getPCController, 
  updatePCController, 
  deletePCController 
} from '@/server/controllers/pc-monitoring.controller'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return await getPCController(req, id)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return await updatePCController(req, id)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return await deletePCController(id)
}
