import { prisma } from '../../config/prisma'
import type { CreateUserDTO, UpdateUserDTO } from './types'
import type { User } from '../../types'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'a11y-secret-key-2026'

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return prisma.trainee.findMany()
  }

  async getUserById(id: string): Promise<User | null> {
    return prisma.trainee.findUnique({
      where: { id }
    })
  }

  async createUser(data: CreateUserDTO & { password?: string }): Promise<User & { token: string }> {
    const { password, sessionId, campusId, ...userData } = data
    
    if (!password) {
      throw new Error('Password is required')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const createData: any = {
      ...userData,
      password: hashedPassword,
      isLocked: false,
      isDeleted: false
    }

    // Connecter la session si fournie
    if (sessionId) {
      createData.session = { connect: { id: sessionId } }
    }

    // Connecter le campus si fourni
    if (campusId) {
      createData.campus = { connect: { id: campusId } }
    }

    const user = await prisma.trainee.create({
      data: createData,
      include: {
        campus: {
          include: {
            school: true
          }
        },
        session: true
      }
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Ajouter sessionId à la réponse
    return { ...user, sessionId: user.session?.id || null, token }
  }

  async login(email: string, password: string): Promise<(User & { token: string }) | null> {
    const user = await prisma.trainee.findUnique({
      where: { email: email.toLowerCase() },
      include: { 
        campus: {
          include: {
            school: true
          }
        }, 
        session: true 
      }
    })

    if (!user) return null

    // Si compte supprimé, on fait comme si le compte n'existe pas
    if (user.isDeleted) return null

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) return null

    // Si compte verrouillé, on rejette avec un message spécifique
    if (user.isLocked) {
      throw new Error('Votre compte a été verrouillé. Veuillez contacter l\'administrateur.');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return { ...user, token }
  }

  async updateAccount(id: string, data: { lastname?: string; firstname?: string; password?: string; photo?: string; campusId?: string; isDeleted?: boolean }): Promise<User> {
    const { campusId, photo, isDeleted, password, ...rest } = data
    const updateData: any = { ...rest }
    
    if (campusId) {
      updateData.campus = { connect: { id: campusId } }
    }

    if (photo) {
      updateData.photo = photo
    }

    // Si suppression du compte
    if (isDeleted) {
      updateData.isDeleted = true
      // Modifier l'email en le préfixant avec un underscore
      const user = await prisma.trainee.findUnique({ where: { id } })
      if (user) {
        updateData.email = `_${user.email}`
      }
    }

    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    const user = await prisma.trainee.update({
      where: { id },
      data: updateData,
      include: {
        campus: {
          include: {
            school: true
          }
        },
        session: true
      }
    })

    // Ajouter sessionId à la réponse
    return { ...user, sessionId: user.session?.id || null } as any
  }

  async archiveUser(id: string): Promise<User> {
    return prisma.trainee.update({
      where: { id },
      data: { isDeleted: true },
    })
  }

  async deleteUser(id: string): Promise<User> {
    return prisma.trainee.delete({
      where: { id },
    })
  }
}
