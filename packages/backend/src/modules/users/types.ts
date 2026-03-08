// src/modules/users/types.ts
export interface CreateUserDTO {
  email: string
  lastname: string
  firstname: string
  sessionId?: string
  password?: string
}

export interface UpdateUserDTO {
  email?: string
  lastname?: string
  firstname?: string
  sessionId?: string
}

export interface UserResponse {
  id: string
  email: string
  lastname: string
  firstname: string
  createdAt: string
}
