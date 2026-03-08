// app/api/trainer/request-otp/route.ts
import { NextRequest } from 'next/server'
import { TrainerController } from '@/modules/trainer/controller'

export async function POST(request: NextRequest) {
  return TrainerController.requestOTP(request)
}
