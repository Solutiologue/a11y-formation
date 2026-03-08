import { prisma } from '../../config/prisma'

export class ChapterService {
  async getChaptersBySessionId(sessionId: string) {
    if (!prisma) {
      console.error('CRITICAL: Prisma client is undefined!')
      throw new Error('Database client not initialized')
    }

    try {
      const chapters = await prisma.chapter.findMany({
        where: { sessionId },
        include: {
          slides: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      })

      return chapters
    } catch (error) {
      console.error('Error fetching chapters:', error)
      throw error
    }
  }

  async getChapterById(id: string) {
    if (!prisma) {
      console.error('CRITICAL: Prisma client is undefined!')
      throw new Error('Database client not initialized')
    }

    try {
      const chapter = await prisma.chapter.findUnique({
        where: { id }
      })

      return chapter
    } catch (error) {
      console.error('Error fetching chapter:', error)
      throw error
    }
  }
}
