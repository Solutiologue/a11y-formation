// src/types/index.ts
export interface User {
  id: string
  email: string
  lastname: string
  firstname: string
  photo?: string
  password?: string
  isLocked?: boolean
  isDeleted?: boolean
  isArchived?: boolean
  campus?: {
    id: string
    name: string
    school: string
  }
  session?: {
    id: string
    code: string
    school: string
    startDate?: string
    endDate?: string
  }
  createdAt: string
  updatedAt: string
  sessionId?: string
  campusId?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
