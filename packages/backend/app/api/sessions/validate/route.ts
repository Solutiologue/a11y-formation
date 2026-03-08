import { SessionController } from '@/modules/sessions/controller'
import { NextRequest } from 'next/server'

const sessionController = new SessionController()

export async function POST(request: Request) {
  return sessionController.validate(request as NextRequest)
}
