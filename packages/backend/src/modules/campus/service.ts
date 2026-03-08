import { prisma } from '../../config/prisma'

export class CampusService {
  async getBySchool(school: string) {
    return prisma.campus.findMany({
      where: { school },
      orderBy: { name: 'asc' }
    })
  }
}
