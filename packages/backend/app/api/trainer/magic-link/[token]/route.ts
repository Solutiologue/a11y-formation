import { NextRequest, NextResponse } from 'next/server'
import { TrainerService } from '@/modules/trainer/service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const result = await TrainerService.validateMagicLink(token)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Magic link validation error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
