<template>
  <div class="login-section">
    <h2>🔑 Connexion Formateur</h2>
    <div class="header-text-container">
      <p class="main-description">Saisissez votre email professionnel pour accéder à votre espace d'administration.</p>
    </div>

    <div class="info-box login-box">
      <div class="info-box-header">
        <h3>Identification</h3>
      </div>
      <div class="info-box-content">
        <!-- Étape 1: Saisie du mail -->
        <form v-if="!showTotpInput" @submit.prevent="$emit('request-otp')" class="form-group">
          <label for="trainerEmail" class="label">Email Formateur</label>
          <div class="input-with-button">
            <input
              id="trainerEmail"
              v-model="emailValue"
              type="email"
              name="email"
              placeholder="votre.email@formation-a11y.fr"
              class="input"
              autocomplete="email"
              autofocus
            />
            <button type="submit" :disabled="!emailValue" class="btn-connect">
              Se connecter
            </button>
          </div>
          <!-- Message d'erreur sous l'input -->
          <div class="error-container">
            <p v-if="error && !showTotpInput" class="error-text">{{ error }}</p>
          </div>
        </form>

        <!-- Étape 2: Saisie du code TOTP -->
        <form v-if="showTotpInput" @submit.prevent="$emit('validate-totp')" class="form-group">
          <h3>Validation OTP</h3>
          <div class="totp-header">
            <span class="trainer-email-display">{{ emailValue }}</span>
            <button type="button" @click="$emit('reset-form')" class="btn-reset" title="Changer d'email">✕</button>
          </div>
          <label for="totpCode" class="label">Code TOTP (6 chiffres)</label>
          <div class="input-with-button">
            <input
              id="totpCode"
              ref="otpInput"
              v-model="otpValue"
              type="text"
              name="one-time-code"
              inputmode="numeric"
              placeholder="000000"
              maxlength="6"
              class="input totp-input"
              autocomplete="one-time-code"
              @input="onOtpInput"
            />
            <button 
              type="submit" 
              :disabled="otpValue.length !== 6" 
              class="btn-connect"
            >
              Valider
            </button>
          </div>
          <!-- Message d'erreur sous l'input OTP -->
          <div class="error-container">
            <p v-if="error && showTotpInput" class="error-text">{{ error }}</p>
          </div>

          <button
            type="button"
            @click="$emit('revoke-totp')"
            :disabled="revokeLoading"
            class="btn-revoke"
            title="Révoquer l'accès TOTP et générer un nouveau lien magic"
          >
            {{ revokeLoading ? '⏳ Révocation...' : '🔐 Révoquer le code QR' }}
          </button>
        </form>
      </div>
      <p class="note-footer">Vous devrez ensuite saisir le code généré par votre application FreeOTP.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';

const props = defineProps<{
  email: string;
  otp: string;
  showTotpInput: boolean;
  revokeLoading: boolean;
  error: string;
}>();

const emit = defineEmits<{
  (e: 'update:email', value: string): void;
  (e: 'update:otp', value: string): void;
  (e: 'request-otp'): void;
  (e: 'validate-totp'): void;
  (e: 'revoke-totp'): void;
  (e: 'reset-form'): void;
}>();

const otpInput = ref<HTMLInputElement | null>(null);

// Surveiller le passage à l'étape TOTP pour donner le focus
watch(() => props.showTotpInput, async (newValue) => {
  if (newValue) {
    await nextTick();
    otpInput.value?.focus();
  }
});

const emailValue = computed({
  get: () => props.email,
  set: (val) => emit('update:email', val)
});

const otpValue = computed({
  get: () => props.otp,
  set: (val) => emit('update:otp', val)
});

const onOtpInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  otpValue.value = target.value.replace(/[^0-9]/g, '');
};
</script>

<style scoped>
.login-section {
  background: #1a1a2e;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem 1.5rem;
  height: 100%; /* S'adapte au parent grid */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden; /* Empêche tout dépassement */
}

.login-section h2 {
  color: #f8fafc;
  margin: 0 0 1rem 0;
  text-align: center;
  font-size: 1.4rem;
}

.header-text-container {
  min-height: 40px; /* Réduit énormément pour gagner de la place */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.main-description {
  color: #cbd5e1;
  text-align: center;
  margin: 0;
  line-height: 1.3;
  font-size: 0.95rem;
}

.info-box {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 10px;
  border: 1px solid #475569;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; /* Important pour garder le layout interne */
  width: 100%;
}

.info-box-header {
  padding: 0.75rem 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-bottom: 1px solid #334155;
}

.info-box-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #818cf8;
  text-align: left;
}

.info-box-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.note-footer {
  margin: 0;
  padding: 0.75rem 1.25rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-top: 1px solid #334155;
  font-size: 0.85rem;
  font-style: italic;
  color: #94a3b8;
  min-height: 50px;
  display: flex;
  align-items: center;
  text-align: left;
}

.form-group {
  width: 100%;
}

.label {
  display: block;
  font-weight: 500;
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 8px;
  text-align: left;
}

.input-with-button {
  display: flex;
  width: 100%;
}

.input {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid #475569;
  border-right: none;
  background: #0f172a;
  color: white;
  height: 44px;
  padding: 0 1rem;
  font-size: 0.95rem;
  outline: none;
  width: 100%; /* Ensure input takes full width */
  position: relative;
  z-index: 1;
}

.input:focus {
  border-color: #667eea;
  z-index: 2; /* Passe au-dessus du bouton pour afficher la bordure entière */
}

.btn-connect {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  height: 44px;
  padding: 0 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
  margin: 0;
  position: relative;
  z-index: 1;
}

.btn-connect:focus {
  outline: 2px solid #ef4444;
  outline-offset: -2px;
  z-index: 2;
}

.btn-connect:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-connect:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-revoke {
  width: 100%;
  margin-top: 0.5rem;
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.4rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-revoke:hover:not(:disabled) {
  background: #ef4444;
  color: white;
}

.btn-revoke:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 0;
  text-align: left;
  border-left: 3px solid #ff6b6b;
  padding-left: 0.75rem;
  background: rgba(255, 107, 107, 0.1);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 4px;
  width: 100%;
}

.error-container {
  min-height: 24px; /* Réduit pour éviter le dépassement */
  display: flex;
  align-items: flex-start;
  margin-top: 0.5rem;
  width: 100%;
}

.totp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #0f0f1e;
  border: 1px solid #333;
  border-radius: 6px;
}

.trainer-email-display {
  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-reset {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.btn-reset:hover {
  color: #e0e0e0;
}

.totp-input {
  font-size: 1.5rem;
  letter-spacing: 0.2rem;
  text-align: center;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}
</style>
