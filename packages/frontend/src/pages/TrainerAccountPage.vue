<template>
  <div class="trainer-account-page glass-container">
    <div class="container py-5">
      <header class="page-header-crystal mb-5">
        <div class="header-content">
          <div class="badge-crystal">Espace Personnel</div>
          <h1>Mon Compte Formateur</h1>
          <p class="subtitle">Gérez vos informations personnelles et sécurisez votre accès</p>
        </div>
      </header>

      <div class="dashboard-grid-crystal">
        <!-- Section Profil -->
        <section class="card-crystal profile-card p-4">
          <div class="card-header-crystal mb-4">
            <div class="icon-circle-crystal primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-medium">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="card-title-group">
              <h2>Informations du Profil</h2>
              <p>Identité et contact professionnel</p>
            </div>
          </div>
          
          <form @submit.prevent="updateProfile" class="form-crystal">
            <div class="form-row-crystal mb-3">
              <div class="input-group-crystal">
                <label for="firstname">Prénom</label>
                <input type="text" id="firstname" v-model="profile.firstname" required placeholder="Votre prénom">
              </div>
              <div class="input-group-crystal">
                <label for="lastname">Nom</label>
                <input type="text" id="lastname" v-model="profile.lastname" required placeholder="Votre nom">
              </div>
            </div>

            <div class="input-group-crystal mb-4">
              <label for="email">Adresse Email (Identifiant)</label>
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input type="email" id="email" :value="profile.email" disabled class="disabled-input">
              </div>
              <small class="form-hint">L'email ne peut pas être modifié pour des raisons de sécurité.</small>
            </div>

            <div class="form-actions mt-auto">
              <button type="submit" :disabled="loading" class="btn-crystal-primary w-100">
                <span v-if="loading" class="spinner"></span>
                {{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </form>
        </section>

        <!-- Section Sécurité / TOTP -->
        <section class="card-crystal security-card p-4">
          <div class="card-header-crystal mb-4">
            <div class="icon-circle-crystal danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-medium">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="card-title-group">
              <h2>Accès & Sécurité</h2>
              <p>Double authentification et sessions</p>
            </div>
          </div>

          <div class="security-status mb-4 p-3 rounded-4 glass-panel">
            <div class="d-flex align-items-center justify-content-between">
              <div class="status-info">
                <p class="mb-0 fw-bold">Authentification TOTP</p>
                <p class="text-muted small mb-0">Protection par application FreeOTP</p>
              </div>
              <span class="badge-status-crystal success">Activé</span>
            </div>
          </div>

          <div class="alert-crystal warning mb-4">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
              <p class="small mb-0">La réinitialisation révoquera votre accès actuel et supprimera le lien avec votre application de sécurité.</p>
            </div>
          </div>

          <div class="security-actions mt-auto">
            <button @click="confirmRevokeTotp" class="btn-crystal-danger w-100 mb-3">
              Révoquer ma clé TOTP
            </button>
            <p class="text-center text-muted smaller">
              Action irréversible nécéssitant une nouvelle configuration.
            </p>
          </div>
        </section>
      </div>

      <!-- Modal Crystal Confirmation -->
      <div v-if="showRevokeModal" class="modal-crystal-overlay">
        <div class="modal-crystal-content glass-crystal-deep p-4 p-md-5">
          <div class="modal-icon danger mb-4">⚠️</div>
          <h2 class="mb-3">Confirmer la révocation ?</h2>
          <p class="text-muted mb-4">
            Vous allez supprimer votre configuration de sécurité actuelle. 
            <strong>Cela vous déconnectera immédiatement</strong> et vous devrez rescanner un nouveau code QR lors de votre prochaine connexion.
          </p>
          <div class="modal-footer-crystal">
            <button @click="processRevokeTotp" class="btn-crystal-danger">Confirmer et déconnecter</button>
            <button @click="showRevokeModal = false" class="btn-crystal-secondary">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTrainerStore } from '@/stores/trainerStore'
import { apiClient } from '@/utils/api'
import { useRouter } from 'vue-router'

const trainerStore = useTrainerStore()
const router = useRouter()
const loading = ref(false)
const showRevokeModal = ref(false)

const profile = ref({
  firstname: '',
  lastname: '',
  email: ''
})

onMounted(() => {
  if (trainerStore.currentTrainer) {
    profile.value = {
      firstname: trainerStore.currentTrainer.firstname || '',
      lastname: trainerStore.currentTrainer.lastname || '',
      email: trainerStore.currentTrainer.email || ''
    }
  }
})

const updateProfile = async () => {
  loading.value = true
  try {
    const response = await apiClient.patch(`/trainer/${trainerStore.currentTrainer?.id}`, {
      firstname: profile.value.firstname,
      lastname: profile.value.lastname
    })
    
    if (response.data.success) {
      trainerStore.setTrainer(response.data.data)
      // Notification simple (on pourrait utiliser un toast system plus tard)
      alert('Profil mis à jour avec succès !')
    }
  } catch (error) {
    console.error('Update profile error:', error)
    alert('Erreur lors de la mise à jour.')
  } finally {
    loading.value = false
  }
}

const confirmRevokeTotp = () => {
  showRevokeModal.value = true
}

const processRevokeTotp = async () => {
  try {
    await apiClient.post('/trainer/revoke-totp', { email: profile.value.email })
    trainerStore.logout()
    router.push('/trainer')
  } catch (error) {
    console.error('Revoke error:', error)
    alert('Erreur lors de la réinitialisation.')
  }
}
</script>

<style scoped>
.trainer-account-page {
  min-height: calc(100vh - 80px);
}

.dashboard-grid-crystal {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

@media (max-width: 576px) {
  .dashboard-grid-crystal {
    grid-template-columns: 1fr;
  }
}

.card-crystal {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.icon-circle-crystal {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--primary-color);
}

.icon-circle-crystal.danger {
  color: #ef4444;
}

.form-crystal .input-group-crystal {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-crystal label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 0.25rem;
}

.form-crystal input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-crystal input:focus {
  background: rgba(255, 255, 255, 0.07);
  border-color: var(--primary-color);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
  outline: none;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.3);
}

.input-with-icon input {
  padding-left: 3rem;
}

.disabled-input {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

.form-hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin-left: 0.25rem;
}

.badge-status-crystal {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.alert-crystal {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.1);
}

.smaller {
  font-size: 0.8rem;
}

.modal-crystal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.modal-crystal-content {
  max-width: 500px;
  width: 100%;
  border-radius: 32px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.modal-footer-crystal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row-crystal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .form-row-crystal {
    grid-template-columns: 1fr;
  }
}

.hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

.btn-outline-danger {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-outline-danger:hover {
  background: #ef4444;
  color: white;
}

.modal-actions.horizontal {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
