// src/utils/api.ts
import type { ApiResponse } from '@/types'

// In development, use the Vite proxy (/api -> backend:3005)
// In production, use /api
const baseURL = import.meta.env.VITE_API_URL || '/api'

const getHeaders = (skipAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (!skipAuth) {
    const trainerToken = sessionStorage.getItem('trainerToken')
    const traineeToken = sessionStorage.getItem('token')
    const token = trainerToken || traineeToken
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}

export const apiClient = {
  async get(url: string, skipAuth = false) {
    const response = await fetch(`${baseURL}${url}`, {
      headers: getHeaders(skipAuth)
    })
    return { data: await response.json() }
  },

  async post(url: string, data: any, skipAuth = false) {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'POST',
      headers: getHeaders(skipAuth),
      body: JSON.stringify(data),
    })
    return { data: await response.json() }
  },

  async put(url: string, data: any, skipAuth = false) {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'PUT',
      headers: getHeaders(skipAuth),
      body: JSON.stringify(data),
    })
    return { data: await response.json() }
  },

  async patch(url: string, data: any, skipAuth = false) {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'PATCH',
      headers: getHeaders(skipAuth),
      body: JSON.stringify(data),
    })
    return { data: await response.json() }
  },

  async delete(url: string, skipAuth = false) {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(skipAuth),
    })
    return { data: await response.json() }
  },

  interceptors: {
    response: {
      use: () => {},
    },
  },
}

// For backward compatibility
export async function initApiClient() {
  return apiClient
}

export async function getApiClient() {
  return apiClient
}

export default apiClient
