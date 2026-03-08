import { NextRequest, NextResponse } from 'next/server'
import { ChapterService } from './service'

export class ChapterController {
  private chapterService: ChapterService

  constructor() {
    this.chapterService = new ChapterService()
  }

  async getChaptersBySession(req: NextRequest): Promise<NextResponse> {
    try {
      const sessionId = req.nextUrl.searchParams.get('sessionId')

      if (!sessionId) {
        return NextResponse.json(
          { success: false, error: 'sessionId requis' },
          { status: 400 }
        )
      }

      const chapters = await this.chapterService.getChaptersBySessionId(sessionId)

      return NextResponse.json({
        success: true,
        data: chapters
      })
    } catch (error) {
      console.error('Error in getChaptersBySession:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur serveur' },
        { status: 500 }
      )
    }
  }

  async getChapter(req: NextRequest): Promise<NextResponse> {
    try {
      const id = req.nextUrl.searchParams.get('id')

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'id requis' },
          { status: 400 }
        )
      }

      const chapter = await this.chapterService.getChapterById(id)

      if (!chapter) {
        return NextResponse.json(
          { success: false, error: 'Chapitre non trouvé' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: chapter
      })
    } catch (error) {
      console.error('Error in getChapter:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur serveur' },
        { status: 500 }
      )
    }
  }
}
