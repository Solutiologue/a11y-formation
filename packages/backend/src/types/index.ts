// src/types/index.ts
export interface User {
  id: string
  email: string
  lastname: string
  firstname: string
  photo?: string | null
  password: string
  isLocked: boolean
  isDeleted: boolean
  isArchived?: boolean
  createdAt: Date
  updatedAt: Date
  sessionId?: string | null
  campusId?: string | null
  campus?: any
  session?: any
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
