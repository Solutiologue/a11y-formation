import { NextRequest, NextResponse } from 'next/server'
import { TrainerService } from '@/modules/trainer/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email requis' },
        { status: 400 }
      )
    }

    const result = await TrainerService.revokeTotp(email)

    if (result.success) {
      return NextResponse.json({
        success: true,
        magicLink: result.magicLink,
        message: result.message,
      })
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Revoke TOTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
