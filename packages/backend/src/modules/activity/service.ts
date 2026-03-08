import { prisma } from '../../config/prisma'

export class ActivityLogService {
  async create(data: {
    type: string
    traineeId: string
    sessionId: string
    metadata?: any
  }) {
    console.log('[ActivityLogService] Creating log with prisma:', !!prisma)
    if (!prisma || !prisma.traineeActivityLog) {
      console.error('[ActivityLogService] Prisma or traineeActivityLog is undefined!')
      throw new Error('Database client not initialized')
    }
    
    return prisma.traineeActivityLog.create({
      data: {
        type: data.type,
        traineeId: data.traineeId,
        sessionId: data.sessionId,
        metadata: data.metadata || {}
      }
    })
  }

  async getBySession(sessionId: string) {
    return prisma.traineeActivityLog.findMany({
      where: { sessionId },
      include: {
        trainee: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'asc' }
    })
  }
}
