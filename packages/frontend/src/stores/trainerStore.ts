// src/stores/trainerStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/utils/api'

export interface Trainer {
  id: string
  email: string
  firstname: string
  lastname: string
  name: string
  sessionId?: string | null
}

export const useTrainerStore = defineStore('trainer', () => {
  const getInitialTrainer = () => {
    const stored = sessionStorage.getItem('trainer')
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse trainer from sessionStorage:', e)
      sessionStorage.removeItem('trainer')
      return null
    }
  }

  const currentTrainer = ref<Trainer | null>(getInitialTrainer())
  const token = ref<string | null>(sessionStorage.getItem('trainerToken'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const otpRequired = ref(false)
  const currentQRCode = ref<string | null>(null)

  const isAuthenticated = computed(() => !!currentTrainer.value && !!token.value)

  const setTrainer = (trainer: Trainer | null, trainerToken?: string | null) => {
    console.log('Pinia: Setting Trainer:', trainer)
    currentTrainer.value = trainer
    if (trainerToken !== undefined) {
      token.value = trainerToken
    }
    
    if (trainer) {
      sessionStorage.setItem('trainer', JSON.stringify(trainer))
      if (token.value) {
        sessionStorage.setItem('trainerToken', token.value)
      }
    } else {
      sessionStorage.removeItem('trainer')
      sessionStorage.removeItem('trainerToken')
    }
  }

  const logout = () => {
    setTrainer(null)
    otpRequired.value = false
  }

  const validateOTP = async (email: string, otpCode: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/trainer/validate-otp', { email, otpCode })
      if (response.data.success) {
        const { trainer, token: trainerToken } = response.data.data
        setTrainer(trainer, trainerToken)
        otpRequired.value = false
        return true
      } else {
        error.value = response.data.message || 'OTP validation failed'
        return false
      }
    } catch (err) {
      error.value = 'OTP validation error'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  const requestOTP = async (email: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/trainer/request-otp', { email })
      if (response.data.success) {
        otpRequired.value = true
        currentQRCode.value = response.data.qrCode || null
        return true
      } else {
        error.value = response.data.message || 'OTP request failed'
        return false
      }
    } catch (err) {
      error.value = 'OTP request error'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    currentTrainer,
    token,
    loading,
    error,
    otpRequired,
    currentQRCode,
    isAuthenticated,
    setTrainer,
    logout,
    validateOTP,
    requestOTP,
  }
})
