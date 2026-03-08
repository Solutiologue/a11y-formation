// src/stores/userStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { apiClient } from '@/utils/api'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(JSON.parse(sessionStorage.getItem('user') || 'null'))
  const token = ref<string | null>(sessionStorage.getItem('token'))
  const sessionValidated = ref<boolean>(JSON.parse(sessionStorage.getItem('sessionValidated') || 'false'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!currentUser.value && !!token.value)
  const hasValidSession = computed(() => !!sessionValidated.value)
  const userCount = computed(() => users.value.length)

  const setUser = (user: User | null, userToken?: string | null, validatedSession?: boolean) => {
    currentUser.value = user
    token.value = userToken || null
    sessionValidated.value = validatedSession || false
    if (user && userToken) {
      sessionStorage.setItem('user', JSON.stringify(user))
      sessionStorage.setItem('token', userToken)
      sessionStorage.setItem('sessionValidated', JSON.stringify(validatedSession || false))
    } else {
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('sessionValidated')
    }
  }

  const validateSession = async (code: string) => {
    try {
      const response = await apiClient.post('/sessions/validate', { code })
      if (response.data.success && response.data.data.valid) {
        sessionValidated.value = true
        sessionStorage.setItem('sessionValidated', 'true')
        return true
      }
      return false
    } catch (err) {
      console.error('Session validation failed:', err)
      return false
    }
  }

  const logout = () => {
    setUser(null)
  }

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/users')
      if (response.data.success) {
        users.value = response.data.data || []
      }
    } catch (err) {
      error.value = 'Failed to fetch users'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const addUser = async (email: string, name: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/users', { email, name })
      if (response.data.success) {
        users.value.push(response.data.data)
      }
    } catch (err) {
      error.value = 'Failed to add user'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    currentUser,
    token,
    sessionValidated,
    loading,
    error,
    userCount,
    isAuthenticated,
    hasValidSession,
    fetchUsers,
    addUser,
    setUser,
    logout,
    validateSession,
  }
})
