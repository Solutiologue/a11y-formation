import { NextRequest } from 'next/server'
import { ActivityLogController } from '@/modules/activity/controller'

const controller = new ActivityLogController()

export async function POST(request: NextRequest) {
  return controller.create(request)
}
