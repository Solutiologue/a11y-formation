<!-- src/pages/TrainerPage.vue -->
<template>
  <div class="trainer-layout">
    <main class="trainer-content" role="main" tabindex="-1">
      <div class="container">
        <div v-if="!trainerStore.isAuthenticated" class="welcome-section">
          <h1>Espace Formateur</h1>


          <div class="sections-grid">
            <!-- Colonne gauche: Premier accès -->
            <MagicLinkSection v-if="showMagicLinkSection" />

            <!-- Colonne droite: Connexion formateur -->
            <LoginSection
              v-if="showLoginSection"
              v-model:email="trainerEmail"
              v-model:otp="otpCode"
              :show-totp-input="showTotpInput"
              :revoke-loading="revokeLoading"
              :error="loginError"
              @request-otp="requestOTP"
              @validate-totp="validateTotp"
              @revoke-totp="revokeTotp"
              @reset-form="resetForm"
            />
          </div>
        </div>

        <div v-else class="authenticated-section">
          <div class="dashboard-grid">
            <!-- Section 1: Mes formations -->
            <div class="dashboard-card glass-crystal formations-card">
              <div class="card-header-crystal">
                <div class="card-icon">📚</div>
                <div class="title-group">
                  <h2>Mes formations enregistrées</h2>
                  <p class="subtitle">Sélectionnez un module pour l'animer ou le configurer.</p>
                </div>
              </div>

              <div class="formations-list">
                <div v-if="myFormations.length === 0" class="no-formations">
                  Aucune session active trouvée en base de données.
                </div>
                <div v-for="formation in myFormations" :key="formation.id" class="formation-item">
                  <div class="formation-info">
                    <span class="formation-name">{{ formation.title }}</span>
                    <span class="formation-meta">Code: {{ formation.code }}</span>
                  </div>
                  <div class="formation-actions">
                    <router-link :to="`/trainer/animation?id=${formation.id}`" class="action-btn launch" title="Lancer l'animation">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-small">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Lancer
                    </router-link>
                    <router-link :to="`/trainer/config?id=${formation.id}`" class="action-btn config" title="Configurer la formation">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-small">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      Config.
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Mon compte -->
            <div class="dashboard-card glass-crystal">
              <div class="card-icon">👤</div>
              <h2>Gestion de mon compte</h2>
              <p>Mettez à jour vos informations personnelles, mot de passe et préférences.</p>
              <div class="card-actions">
                <router-link to="/trainer/account" class="btn-crystal-primary">Accéder au profil</router-link>
              </div>
            </div>

            <!-- Section 3: Statistiques -->
            <div class="dashboard-card glass-crystal">
              <div class="card-icon">📊</div>
              <h2>Statistiques des formations</h2>
              <p>Analysez les résultats, l'engagement et la progression de vos stagiaires.</p>
              <div class="card-actions">
                <router-link to="/trainer/stats" class="btn-crystal-primary">Voir les rapports</router-link>
              </div>
            </div>

            <!-- Section 4: Bibliothèque -->
            <div class="dashboard-card glass-crystal">
              <div class="card-icon">📁</div>
              <h2>Bibliothèque de documents</h2>
              <p>Gérez vos supports, ressources pédagogiques et documents partagés.</p>
              <div class="card-actions">
                <router-link to="/trainer/library" class="btn-crystal-primary">Ouvrir la doc</router-link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTrainerStore } from '@/stores/trainerStore'
import { apiClient } from '@/utils/api'
import MagicLinkSection from '@/components/sections/MagicLinkSection.vue'
import LoginSection from '@/components/sections/LoginSection.vue'

const router = useRouter()
const trainerStore = useTrainerStore()
const trainerEmail = ref('')
const otpCode = ref('')
const loginError = ref('')
const showMagicLinkSection = ref(true)
const showLoginSection = ref(true)
const showTotpInput = ref(false)
const revokeLoading = ref(false)

// Données dynamiques chargées depuis la DB
const myFormations = ref<any[]>([])

const fetchFormations = async () => {
  try {
    const response = await apiClient.get('/sessions')
    const sessions = response.data?.sessions || response.data?.data || []
    
    if (sessions.length > 0) {
      myFormations.value = sessions.map((s: any) => ({
        id: s.id,
        title: (s.school?.name || 'Inconnue') + ' - ' + s.code,
        sessions: 1,
        code: s.code
      }))
    } else {
      myFormations.value = []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des sessions:', error)
  }
}

onMounted(() => {
  if (trainerStore.isAuthenticated) {
    fetchFormations()
  }
})

const requestOTP = async () => {
  if (!trainerEmail.value) return
  
  loginError.value = ''
  try {
    const success = await trainerStore.requestOTP(trainerEmail.value)
    
    if (success) {
      // Afficher le champ TOTP
      showTotpInput.value = true
      otpCode.value = ''
      loginError.value = ''
    } else {
      loginError.value = trainerStore.error || 'Erreur lors de la demande'
    }
  } catch (error: any) {
    console.error('OTP request error:', error)
    loginError.value = 'Erreur serveur'
  }
}

const validateTotp = async () => {
  console.log('LoginPage: validateTotp called with code:', otpCode.value)
  if (otpCode.value.length !== 6) {
    loginError.value = 'Le code doit contenir 6 chiffres'
    return
  }
  
  loginError.value = ''
  try {
    const success = await trainerStore.validateOTP(trainerEmail.value, otpCode.value)
    console.log('LoginPage: Validation result:', success)
    
    if (success) {
      console.log('LoginPage: Login success, redirecting...')
      // Forcer la redirection vers le dashboard si Vue n'a pas réagi au v-if
      router.push('/trainer')
    } else {
      loginError.value = trainerStore.error || 'Code OTP invalide. Veuillez réessayer.'
    }
  } catch (error: any) {
    console.error('TOTP validation error:', error)
    loginError.value = 'Erreur lors de la validation du code'
  }
}

const resetForm = () => {
  showTotpInput.value = false
  otpCode.value = ''
  loginError.value = ''
  trainerEmail.value = ''
}

const revokeTotp = async () => {
  if (!trainerEmail.value) return
  
  if (!confirm('Êtes-vous sûr de vouloir révoquer le code QR ? Un nouveau lien magic will be generated.')) {
    return
  }
  
  revokeLoading.value = true
  loginError.value = ''
  
  try {
    const response = await apiClient.post('/trainer/revoke-totp', {
      email: trainerEmail.value,
    }, true) // skipAuth = true
    
    if (response.data.success) {
      loginError.value = ''
      alert(`✅ Code QR révoqué!\n\nNouveau lien magic:\n/trainer/setup/${response.data.magicLink}`)
      resetForm()
    } else {
      loginError.value = response.data.message || 'Erreur lors de la révocation'
    }
  } catch (error: any) {
    console.error('Revoke TOTP error:', error)
    loginError.value = error.response?.data?.message || 'Erreur serveur'
  } finally {
    revokeLoading.value = false
  }
}

const handleLogout = () => {
  trainerStore.logout()
  resetForm()
}

// Initialiser l'état si déjà connecté
if (trainerStore.isAuthenticated) {
  console.log('Trainer already authenticated:', trainerStore.currentTrainer)
}
</script>

<style scoped>
.trainer-layout {
  display: flex;
  flex-direction: column;
  min-height: auto; /* Supprime la hauteur minimale forcée */
  background: #0f0f1e;
}

.trainer-content {
  flex: 1;
  padding: 1rem 2rem 0.5rem 2rem; /* Réduit encore les paddings vertical */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 1rem; /* Moins de marge sous le titre */
}

h1 {
  color: #e0e0e0;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.btn-connect {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 3rem;
}

.btn-connect:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-connect:focus-visible {
  outline: 3px solid #e11d48 !important;
  outline-offset: 4px;
}

.btn-revoke {
  display: block;
  width: 100%;
  margin-top: 1rem;
  background: #e74c3c;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-revoke:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(231, 76, 60, 0.3);
}

.btn-revoke:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-revoke:focus-visible {
  outline: 3px solid #e11d48 !important;
  outline-offset: 4px;
}

.sections-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
  align-items: stretch; /* Force les enfants à avoir la même hauteur */
}

.section-left,
.section-right {
  display: flex;
  flex-direction: column;
}

.magic-link-section,
.login-section {
  background: #1a1a2e;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 2.5rem 2rem;
  height: 520px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.magic-link-section h2,
.login-section h2 {
  color: #f8fafc;
  margin: 0 0 1.5rem 0;
  text-align: center;
  font-size: 1.6rem;
}

.header-text-container {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.main-description {
  color: #cbd5e1;
  text-align: center;
  margin: 0;
  line-height: 1.5;
  font-size: 1.05rem;
}

.info-box {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 10px;
  border: 1px solid #475569;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.info-box-header {
  padding: 1rem 1.5rem;
  background: rgba(102, 126, 234, 0.1);
  border-bottom: 1px solid #334155;
}

.info-box-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #818cf8;
  text-align: left;
}

.info-box-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-box ol {
  margin: 0;
  padding-left: 1.2rem;
  color: #94a3b8;
}

.info-box li {
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
  line-height: 1.4;
  color: #cbd5e1;
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

.input-with-button .input {
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
}

.input-with-button .input:focus {
  border-color: #667eea;
}

.input-with-button .btn-connect {
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
  margin: 0; /* Important pour enlever les marges par défaut */
}

.btn-connect:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-revoke {
  width: 100%;
  margin-top: 5rem; /* Pousse vers le bas */
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-revoke:hover {
  background: #ef4444;
  color: white;
}

/* Suppression définitive des anciens styles redondants */
.magic-link-section p, 
.login-section p, 
.info-text, 
.section-description {
  display: none;
}
.main-description {
  display: block !important;
}

.btn-connect:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-connect:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-revoke {
  background: none;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  border-radius: 6px;
  padding: 0.5rem;
  margin-top: 1rem;
  width: 100%;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-revoke:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.label {
  display: block;
  color: #cbd5e1;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 6px;
  background: #0f0f1e;
  color: #e0e0e0;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  background: #1a1a2e;
}

.error-text {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
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

.section-description {
  color: #94a3b8;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.totp-input {
  font-size: 1.5rem;
  letter-spacing: 0.2rem;
  text-align: center;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.info-box {
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 2rem;
  text-align: left;
  max-width: 600px;
  margin-top: auto;
  min-height: 300px;
}

.login-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-box h3 {
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.info-box ol {
  color: #94a3b8;
  padding-left: 1.5rem;
  line-height: 2;
}

.info-box li {
  margin-bottom: 0.5rem;
}

.authenticated-section {
  width: 100%;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.dashboard-card.glass-crystal {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.dashboard-card.glass-crystal:hover {
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.1);
  transform: translateY(-6px);
  background: rgba(255, 255, 255, 0.05);
}

.formations-card {
  grid-column: span 3;
}

.card-header-crystal {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card-header-crystal .card-icon {
  margin-bottom: 0;
}

.card-header-crystal .title-group h2 {
  margin-bottom: 0.25rem;
}

.card-header-crystal .subtitle {
  margin-bottom: 0;
  font-size: 0.95rem;
}

.formations-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.formation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.formation-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 212, 255, 0.2);
  transform: translateX(4px);
}

.formation-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.formation-name {
  color: #fff;
  font-weight: 600;
  font-size: 1.05rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.formation-meta {
  color: #64748b;
  font-size: 0.85rem;
}

.formation-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.svg-icon-small {
  width: 14px;
  height: 14px;
}

.action-btn.launch {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.action-btn.launch:hover {
  background: #22c55e;
  color: #020617;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
}

.action-btn.config {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.config:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #fff;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
}

.dashboard-card h2 {
  color: #fff;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.dashboard-card p {
  color: #94a3b8;
  margin-bottom: 2rem;
  line-height: 1.6;
  flex-grow: 1;
}

.card-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-crystal-primary {
  display: inline-block;
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  border: 1px solid rgba(0, 212, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
}

.btn-crystal-primary:hover {
  background: #00d4ff;
  color: #020617;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
  transform: translateY(-2px);
}

.btn-crystal-secondary {
  display: inline-block;
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-crystal-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-logout-crystal {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  padding: 0.8rem 2rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}

.btn-logout-crystal:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.2);
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.quick-stats {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #333;
  margin-bottom: 2rem;
}

.quick-stats h2 {
  color: #e0e0e0;
  margin-bottom: 2rem;
  font-size: 1.3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.logout-section {
  text-align: center;
  margin-top: 2rem;
}

.btn-logout {
  background: #ef4444;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.btn-logout:focus-visible {
  outline: 3px solid #e11d48 !important;
  outline-offset: 4px;
}

@media (max-width: 768px) {
  .trainer-content {
    padding: 1.5rem 1rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .sections-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
