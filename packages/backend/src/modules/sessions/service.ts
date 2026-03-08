import { prisma } from '../../config/prisma'

export class SessionService {
  async validateSessionCode(code: string, email?: string) {
    if (!prisma) {
      console.error('CRITICAL: Prisma client is undefined!');
      throw new Error('Database client not initialized');
    }
    
    console.log('Validating code:', code);
    
    const session = await prisma.session.findUnique({
      where: { code : code.toUpperCase() },
    })

    if (!session) {
      return { valid: false, reason: 'NOT_FOUND' }
    }

    if (email) {
      const existingUser = await prisma.trainee.findFirst({
        where: {
          email,
          sessionId: session.id
        }
      })

      if (existingUser) {
        return { 
          valid: true, 
          id: session.id, 
          alreadyRegistered: true, 
          schoolId: session.schoolId,
          campusIds: session.campusIds 
        }
      }
    }

    return { 
      valid: true, 
      id: session.id, 
      alreadyRegistered: false, 
      schoolId: session.schoolId,
      campusIds: session.campusIds 
    }
  }

  async getSessionById(id: string) {
    const session = await prisma.session.findUnique({
      where: { id },
    })
    
    if (!session) return null

    return {
      valid: true,
      id: session.id,
      code: session.code,
      schoolId: session.schoolId,
      campusIds: session.campusIds,
      config: session.config
    }
  }
}
