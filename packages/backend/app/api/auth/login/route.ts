// app/api/auth/login/route.ts
import { UserController } from '../../../../src/modules/users/controller'
import { NextRequest } from 'next/server'

const userController = new UserController()

export async function POST(request: Request) {
  return userController.login(request as NextRequest)
}
