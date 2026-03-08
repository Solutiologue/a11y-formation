// src/modules/users/controller.ts
import { NextRequest, NextResponse } from 'next/server'
import { UserService } from './service'
import type { ApiResponse, User } from '../../types'
import { verifyToken } from '../../middleware/auth'

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  async getAll(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await verifyToken(req)
      if (auth.error) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: auth.error },
          { status: auth.status }
        )
      }

      const users = await this.userService.getAllUsers()
      return NextResponse.json<ApiResponse<User[]>>({
        success: true,
        data: users,
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to fetch users',
        },
        { status: 500 }
      )
    }
  }

  async getById(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const user = await this.userService.getUserById(id)
      if (!user) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'User not found',
          },
          { status: 404 }
        )
      }
      return NextResponse.json<ApiResponse<User>>({
        success: true,
        data: user,
      })
    } catch (error) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to fetch user',
        },
        { status: 500 }
      )
    }
  }

  async create(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json()
      const userData = await this.userService.createUser(body)
      return NextResponse.json<ApiResponse<User & { token: string }>>(
        {
          success: true,
          data: userData,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating user:', error)
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create user',
        },
        { status: 500 }
      )
    }
  }

  async updateAccount(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await verifyToken(req)
      if (auth.error || !auth.userId) {
        console.log('PUT Profile Error:', auth.error);
        return NextResponse.json({ success: false, error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
      }

      const body = await req.json()
      const user = await this.userService.updateAccount(auth.userId, body)
      return NextResponse.json({ success: true, data: user })
    } catch (error) {
      console.error('PUT Profile Service Error:', error);
      return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
    }
  }

  async archiveAccount(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await verifyToken(req)
      if (auth.error || !auth.userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      await this.userService.archiveUser(auth.userId)
      return NextResponse.json({ success: true, message: 'Compte archivé avec succès' })
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed to archive account' }, { status: 500 })
    }
  }

  async login(req: NextRequest): Promise<NextResponse> {
    try {
      const { email, password } = await req.json()
      
      if (!email || !password) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Email et mot de passe requis' },
          { status: 400 }
        )
      }

      const userData = await this.userService.login(email, password)
      
      if (!userData) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        )
      }

      return NextResponse.json<ApiResponse<any>>({
        success: true,
        data: userData,
      })
    } catch (error: any) {
      console.error('Login error:', error)
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: error.message || 'Erreur lors de la connexion' },
        { status: error.message && error.message.includes('supprimé') ? 403 : 500 }
      )
    }
  }
}
