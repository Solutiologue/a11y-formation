import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/config/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const schoolId = searchParams.get('schoolId')
    const ids = searchParams.get('ids')

    const where: any = {}
    if (schoolId) {
      where.schoolId = schoolId
    }
    if (ids) {
      where.id = { in: ids.split(',') }
    }

    const campuses = await prisma.campus.findMany({
      where,
      include: {
        school: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: campuses
    })
  } catch (error) {
    console.error('Erreur campus API:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
