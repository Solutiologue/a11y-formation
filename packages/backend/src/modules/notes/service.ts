import { prisma } from '../../config/prisma'

export class NoteService {
  async getNotesByTraineeAndSession(traineeId: string, sessionId: string) {
    return await prisma.note.findMany({
      where: {
        traineeId,
        slide: {
          chapter: {
            sessionId
          }
        }
      },
      include: {
        slide: true
      }
    })
  }

  async getAllNotesByTrainee(traineeId: string) {
    return await prisma.note.findMany({
      where: {
        traineeId
      },
      include: {
        slide: {
          include: {
            chapter: {
              include: {
                session: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  }

  async upsertNote(traineeId: string, slideId: string, content: string) {
    return await prisma.note.upsert({
      where: {
        traineeId_slideId: {
          traineeId,
          slideId
        }
      },
      update: {
        content,
        updatedAt: new Date()
      },
      create: {
        traineeId,
        slideId,
        content
      }
    })
  }

  async bulkSyncNotes(traineeId: string, notes: Record<string, string>) {
    // notes est un Record<`${chapterId}-${slideIndex}`, content>
    // Ici on simplifie pour le moment, mais on pourrait parser les clés si nécessaire
    // Pour l'instant, on va demander au front d'envoyer slideId directement si possible
    // ou de faire des appels unitaires.
  }
}
