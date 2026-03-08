import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/config/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const trainerId = searchParams.get('trainerId')

    const where: any = {}
    if (trainerId) {
      where.trainers = { some: { id: trainerId } }
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        school: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: sessions
    })
  } catch (error) {
    console.error('Erreur sessions API:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, schoolId, campusIds, config } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de session manquant' }, { status: 400 })
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        schoolId,
        campusIds,
        config: config || {}
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedSession
    })
  } catch (error) {
    console.error('Erreur mise à jour session:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}
