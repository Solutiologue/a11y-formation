import { NextRequest, NextResponse } from 'next/server'
import { TrainerService } from '@/modules/trainer/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otpCode } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email requis' },
        { status: 400 }
      )
    }

    // Si otpCode fourni: valider le code TOTP
    if (otpCode) {
      if (!otpCode || otpCode.length !== 6) {
        return NextResponse.json(
          { success: false, message: 'Code TOTP invalide (6 chiffres attendus)' },
          { status: 400 }
        )
      }

      const result = await TrainerService.validateOTP(email, otpCode)
      if (result.success) {
        return NextResponse.json({
          success: true,
          trainer: result.trainer,
          token: result.token,
          message: result.message,
        })
      } else {
        return NextResponse.json(
          { success: false, message: result.message },
          { status: 401 }
        )
      }
    }

    // Sinon: juste vérifier que l'email existe et retourner un message
    return NextResponse.json({
      success: true,
      message: `Entrez le code TOTP généré par FreeOTP`,
    })
  } catch (error) {
    console.error('OTP email request error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
