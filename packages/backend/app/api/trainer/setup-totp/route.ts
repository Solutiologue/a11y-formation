import { NextRequest, NextResponse } from 'next/server'
import { TrainerService } from '@/modules/trainer/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otpCode, magicLink } = body

    if (!email || !otpCode || !magicLink) {
      return NextResponse.json(
        { success: false, message: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    const result = await TrainerService.setupTotp(email, otpCode, magicLink)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Setup TOTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
