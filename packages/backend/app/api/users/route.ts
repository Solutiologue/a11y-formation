// app/api/users/route.ts
import { UserController } from '@/modules/users/controller'

const userController = new UserController()

export async function GET(request: Request) {
  return userController.getAll(request as any)
}

export async function POST(request: Request) {
  return userController.create(request as any)
}
