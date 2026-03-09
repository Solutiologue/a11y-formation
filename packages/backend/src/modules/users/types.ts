// src/modules/users/types.ts
export interface CreateUserDTO {
  email: string
  lastname: string
  firstname: string
  sessionId?: string | null
  campusId?: string | null
  password?: string
}

export interface UpdateUserDTO {
  email?: string
  lastname?: string
  firstname?: string
  sessionId?: string | null
  campusId?: string | null
}

export interface UserResponse {
  id: string
  email: string
  lastname: string
  firstname: string
  createdAt: string
}
