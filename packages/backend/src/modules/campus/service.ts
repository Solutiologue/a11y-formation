import { prisma } from '../../config/prisma'

export class CampusService {
  async getBySchool(schoolId: string) {
    return prisma.campus.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' }
    })
  }
}
