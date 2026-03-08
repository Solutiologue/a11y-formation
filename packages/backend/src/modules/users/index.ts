// src/modules/users/route.ts
import { NextRequest, NextResponse } from 'next'
import { UserController } from './controller'

const userController = new UserController()

export async function GET(req: NextRequest) {
  return userController.getAll(req)
}

export async function POST(req: NextRequest) {
  return userController.create(req)
}
