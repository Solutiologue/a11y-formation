import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/config/prisma'

export async function GET(req: NextRequest) {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: schools
    })
  } catch (error) {
    console.error('Erreur schools API:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
