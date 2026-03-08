// src/modules/trainer/controller.ts
import { NextRequest, NextResponse } from 'next/server'
import { TrainerService } from './service'

export class TrainerController {
  static async requestOTP(request: NextRequest) {
    try {
      const body = await request.json()
      const { email } = body

      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email requis' },
          { status: 400 }
        )
      }

      const trainerService = new TrainerService()
      const result = await trainerService.requestOTP(email)
      return NextResponse.json(
        {
          success: result.success,
          message: result.message,
          ...(result.qrCode && { qrCode: result.qrCode }),
        },
        { status: result.success ? 200 : 401 }
      )
    } catch (error) {
      console.error('Request OTP error:', error)
      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      )
    }
  }

  static async validateOTP(request: NextRequest) {
    try {
      const body = await request.json()
      const { email, otpCode } = body

      if (!email || !otpCode) {
        return NextResponse.json(
          { success: false, message: 'Email et code OTP requis' },
          { status: 400 }
        )
      }

      const result = await TrainerService.validateOTP(email, otpCode)

      if (result.success) {
        return NextResponse.json(
          {
            success: true,
            message: result.message,
            data: {
              trainer: result.trainer,
              token: result.token,
            },
          },
          { status: 200 }
        )
      } else {
        return NextResponse.json(
          { success: false, message: result.message },
          { status: 401 }
        )
      }
    } catch (error) {
      console.error('Validate OTP error:', error)
      return NextResponse.json(
        { success: false, message: 'Erreur serveur' },
        { status: 500 }
      )
    }
  }
}
