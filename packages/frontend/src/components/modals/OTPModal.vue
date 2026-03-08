<!-- src/components/modals/OTPModal.vue -->
<template>
  <div v-if="isOpen" class="otp-modal-overlay" @click.self="closeModal">
    <div class="otp-modal" role="dialog" aria-labelledby="otp-title" aria-modal="true">
      <button @click="closeModal" class="close-btn" aria-label="Fermer la modal">×</button>

      <h2 id="otp-title">Connexion Formateur - FreeOTP</h2>

      <div v-if="!otpRequested" class="email-section">
        <p>Veuillez entrer votre email pour recevoir un code QR FreeOTP.</p>
        <div class="form-group">
          <label for="modal-email">Email</label>
          <input
            id="modal-email"
            v-model="email"
            type="email"
            placeholder="votre.email@ipssi.fr"
            autocomplete="email"
            @keyup.enter="requestOtp"
            required
          />
        </div>
        <button
          @click="requestOtp"
          :disabled="!email || trainerStore.loading"
          class="btn-primary"
        >
          {{ trainerStore.loading ? 'Envoi en cours...' : 'Demander le code QR' }}
        </button>
      </div>

      <div v-else class="otp-section">
        <div v-if="qrCode" class="qr-section">
          <p class="info-text">
            📱 Scannez ce code QR avec votre application <strong>FreeOTP</strong>
          </p>
          <div class="qr-container">
            <img :src="qrCode" alt="Code QR FreeOTP" class="qr-code" />
          </div>
          <p class="qr-instructions">
            1. Ouvrez l'application FreeOTP<br/>
            2. Appuyez sur le bouton « + »<br/>
            3. Scannez ce code QR<br/>
            4. Entrez le code à 6 chiffres généré
          </p>
        </div>

        <div class="otp-input-section">
          <div class="form-group">
            <label for="modal-otp">Code TOTP (6 chiffres)</label>
            <input
              id="modal-otp"
              v-model="otpCode"
              type="text"
              inputmode="numeric"
              placeholder="000000"
              maxlength="6"
              autocomplete="one-time-code"
              @keyup.enter="validateOtp"
              required
            />
          </div>
          <button
            @click="validateOtp"
            :disabled="otpCode.length !== 6 || trainerStore.loading"
            class="btn-primary"
          >
            {{ trainerStore.loading ? 'Vérification...' : 'Valider' }}
          </button>
          <button @click="resetForm" class="btn-secondary">
            Utiliser un autre email
          </button>
        </div>
      </div>

      <div v-if="trainerStore.error" class="error-message">
        {{ trainerStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTrainerStore } from '@/stores/trainerStore'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'authenticated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const trainerStore = useTrainerStore()

const email = ref('')
const otpCode = ref('')
const otpRequested = ref(false)
const qrCode = ref('')

const closeModal = () => {
  emit('close')
}

const requestOtp = async () => {
  if (!email.value) return
  const success = await trainerStore.requestOTP(email.value)
  if (success) {
    otpRequested.value = true
    // Le QR code est récupéré du store
    qrCode.value = trainerStore.currentQRCode || ''
  }
}

const validateOtp = async () => {
  if (otpCode.value.length !== 6) return
  const success = await trainerStore.validateOTP(email.value, otpCode.value)
  if (success) {
    emit('authenticated')
    resetForm()
    closeModal()
  }
}

const resetForm = () => {
  email.value = ''
  otpCode.value = ''
  otpRequested.value = false
  qrCode.value = ''
}

watch(
  () => trainerStore.otpRequired,
  (value) => {
    if (!value) {
      resetForm()
    }
  }
)
</script>

<style scoped>
.otp-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.otp-modal {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1a1a2e;
}

.close-btn:focus-visible {
  outline: 3px solid #e11d48 !important;
  outline-offset: 4px;
}

h2 {
  color: #1a1a2e;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

p {
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.info-text {
  background: #f0f9ff;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #0ea5e9;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  color: #1a1a2e;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

input[type="email"],
input[type="text"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

input[type="email"]:focus,
input[type="text"]:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

input[type="email"]:disabled,
input[type="text"]:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.btn-primary,
.btn-secondary {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.btn-primary {
  background-color: #0ea5e9;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0284c7;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:focus-visible {
  outline: 3px solid #e11d48 !important;
  outline-offset: 4px;
}

.btn-secondary {
  background: #f1f5f9;
  color: #1a1a2e;
  margin-top: 0.5rem;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-secondary:focus-visible {
  outline: 3px solid #e11d48 !important;
  outline-offset: 4px;
}

.error-message {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 1rem;
  border-radius: 8px;
  color: #7f1d1d;
  font-size: 0.9rem;
  margin-top: 1.5rem;
}

.qr-section {
  margin-bottom: 1.5rem;
}

.qr-container {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  border: 2px solid #e2e8f0;
}

.qr-code {
  max-width: 200px;
  width: 100%;
  height: auto;
}

.qr-instructions {
  background: #f0f9ff;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #0ea5e9;
  font-size: 0.85rem;
  line-height: 1.8;
  color: #0c4a6e;
  margin: 1rem 0;
}

.otp-input-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}
</style>
