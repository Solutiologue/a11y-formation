<template>
  <div class="trainer-setup-container">
    <div v-if="loading" class="loading-state">
      <p>Chargement...</p>
    </div>

    <div v-else-if="!validMagicLink" class="error-state">
      <h2>❌ Lien invalide</h2>
      <p>{{ errorMessage }}</p>
      <router-link to="/trainer" class="btn btn-primary">Retour</router-link>
    </div>

    <div v-else class="setup-modal">
      <div class="modal-content">
        <h2>⚙️ Configuration FreeOTP</h2>
        <p class="subtitle">Finalisez votre authentification à deux facteurs</p>

        <!-- QR Code Section -->
        <div class="qr-section">
          <p class="info-text">📱 Scannez ce code QR avec votre application <strong>FreeOTP</strong></p>
          <div class="qr-container">
            <img v-if="qrCode" :src="qrCode" alt="Code QR FreeOTP" class="qr-code" />
            <div v-else class="qr-placeholder">
              Génération du code QR...
            </div>
          </div>
          <div class="qr-instructions">
            <ol>
              <li>Ouvrez l'application <strong>FreeOTP</strong></li>
              <li>Appuyez sur le bouton <strong>«&nbsp;+&nbsp;»</strong></li>
              <li>Scannez le code QR ci-dessus</li>
              <li>Entrez le code généré ci-dessous</li>
            </ol>
          </div>
        </div>

        <!-- OTP Input Section -->
        <div class="otp-input-section">
          <label for="otpCode" class="label">Code OTP (6 chiffres)</label>
          <input
            id="otpCode"
            v-model="otpCode"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            class="input"
            @keyup.enter="submitOTP"
          />
          <p v-if="otpError" class="error-text">{{ otpError }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="button-group">
          <button 
            type="button"
            @click="submitOTP" 
            :disabled="otpSubmitting || otpCode.length < 6" 
            class="btn btn-primary"
          >
            {{ otpSubmitting ? '⏳ Validation...' : '✓ Valider' }}
          </button>
          <router-link to="/trainer" class="btn btn-secondary">Annuler</router-link>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
          <p>✅ {{ successMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrainerStore } from '@/stores/trainerStore'
import { apiClient } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const trainerStore = useTrainerStore()

const token = ref<string>('')
const loading = ref(true)
const validMagicLink = ref(false)
const errorMessage = ref('')
const qrCode = ref<string>('')
const trainerInfo = ref<any>(null)
const otpCode = ref('')
const otpError = ref('')
const otpSubmitting = ref(false)
const successMessage = ref('')

onMounted(async () => {
  // Get token from route params
  token.value = route.params.token as string

  if (!token.value) {
    errorMessage.value = 'Aucun token fourni'
    validMagicLink.value = false
    loading.value = false
    return
  }

  try {
    // Validate magic link and get QR code
    const response = await apiClient.get(`/trainer/magic-link/${token.value}`)
    
    if (response.data.success) {
      validMagicLink.value = true
      qrCode.value = response.data.qrCode || ''
      trainerInfo.value = response.data.trainer
    } else {
      validMagicLink.value = false
      errorMessage.value = response.data.message || 'Lien invalid'
    }
  } catch (error: any) {
    console.error('Magic link validation error:', error)
    validMagicLink.value = false
    errorMessage.value = error.response?.data?.message || 'Erreur lors de la validation du lien'
  } finally {
    loading.value = false
  }
})

const submitOTP = async () => {
  console.log('submitOTP called, otpCode:', otpCode.value);
  if (otpCode.value.length !== 6) {
    otpError.value = 'Le code OTP doit contenir 6 chiffres'
    return
  }

  otpError.value = ''
  otpSubmitting.value = true

  try {
    console.log('Sending request to /api/trainer/setup-totp...');
    const response = await apiClient.post('/trainer/setup-totp', {
      email: trainerInfo.value.email,
      otpCode: otpCode.value,
      magicLink: token.value,
    }, true) // skipAuth = true

    console.log('Response received:', response.data);

    if (response.data.success && (response.data.token || response.data.data?.token)) {
      successMessage.value = 'FreeOTP configuré avec succès! Redirection en cours...'
      
      const trainerData = response.data.data?.trainer || response.data.trainer
      const trainerToken = response.data.data?.token || response.data.token

      console.log('TOTP Success Data:', { trainerData, trainerToken })

      // Mettre à jour le store
      trainerStore.setTrainer(trainerData, trainerToken)
      
      // On log pour vérifier juste avant de quitter la page
      console.log('Final check before redirect:', {
        storeAuth: trainerStore.isAuthenticated,
        storageToken: sessionStorage.getItem('trainerToken')
      })

      // Redirection immédiate
      router.push('/trainer')
    } else {
      otpError.value = response.data.message || 'Le code OTP est invalide'
    }
  } catch (error: any) {
    console.error('Setup TOTP error:', error)
    otpError.value = error.response?.data?.message || 'Erreur lors de la validation du code'
  } finally {
    otpSubmitting.value = false
  }
}
</script>

<style scoped>
.trainer-setup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.loading-state,
.error-state {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.error-state h2 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.setup-modal {
  width: 100%;
  max-width: 500px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h2 {
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.qr-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
}

.info-text {
  color: #555;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.qr-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  min-height: 220px;
  background: #f9f9f9;
  border-radius: 8px;
  align-items: center;
}

.qr-code {
  max-width: 200px;
  max-height: 200px;
  image-rendering: pixelated;
}

.qr-placeholder {
  color: #999;
  font-size: 0.9rem;
}

.qr-instructions {
  background: #e8f4f8;
  border-left: 4px solid #3498db;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.qr-instructions ol {
  margin: 0;
  padding-left: 1.5rem;
  color: #333;
  font-size: 0.9rem;
}

.qr-instructions li {
  margin-bottom: 0.5rem;
}

.qr-instructions strong {
  color: #2c3e50;
}

.otp-input-section {
  margin-bottom: 1.5rem;
}

.label {
  display: block;
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  text-align: center;
  letter-spacing: 8px;
  font-family: 'Courier New', monospace;
  transition: border-color 0.3s;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  background: #f8f9ff;
}

.error-text {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.success-message {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  color: #155724;
}
</style>
