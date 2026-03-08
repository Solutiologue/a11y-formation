import { NextRequest, NextResponse } from 'next/server'
import { TrainerService } from '@/modules/trainer/service'
import { prisma } from '@/config/prisma'
import speakeasy from 'speakeasy'

export async function GET(request: NextRequest) {
  try {
    // Récupérer le secret du trainer
    const trainer = await prisma.trainer.findUnique({
      where: { email: 'trainer@ipssi.fr' },
    })

    if (!trainer || !trainer.totpSecret) {
      return NextResponse.json(
        { success: false, message: 'Trainer ou TOTP secret non trouvé' },
        { status: 404 }
      )
    }

    // Générer un code TOTP valide
    const token = speakeasy.totp({
      secret: trainer.totpSecret,
      encoding: 'base32',
      window: 2,
    })

    return NextResponse.json({
      success: true,
      totpCode: token,
      email: trainer.email,
      message: 'Code TOTP généré. À utiliser pour valider: POST /api/trainer/validate-otp-email',
    })
  } catch (error) {
    console.error('Test TOTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
