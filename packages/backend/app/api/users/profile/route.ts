// app/api/users/profile/route.ts
import { UserController } from '@/modules/users/controller'
import { NextRequest } from 'next/server'

const userController = new UserController()

export async function PUT(request: NextRequest) {
  // On utilise la méthode update de l'instance controller (on verra à l'ajouter plus bas)
  return userController.updateAccount(request)
}

export async function DELETE(request: NextRequest) {
  return userController.archiveAccount(request)
}
