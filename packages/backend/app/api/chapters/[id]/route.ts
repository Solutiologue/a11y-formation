import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/config/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { isLocked } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
    }

    const updatedChapter = await prisma.chapter.update({
      where: { id },
      data: { isLocked }
    })

    return NextResponse.json({
      success: true,
      data: updatedChapter
    })
  } catch (error) {
    console.error('Error updating chapter lock:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
