import { ChapterController } from '@/modules/chapters/controller'
import { NextRequest } from 'next/server'

const chapterController = new ChapterController()

export async function GET(request: NextRequest) {
  return chapterController.getChaptersBySession(request)
}
