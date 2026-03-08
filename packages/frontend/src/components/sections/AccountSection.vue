<template>
  <div class="content-section">
    <div class="profile-header">
      <div class="profile-photo">
        <img v-if="user.photo" :src="user.photo" alt="Photo de profil" class="profile-img" />
        <div v-else class="photo-placeholder">
          {{ user.lastname?.[0] || '' }}
        </div>
      </div>
      <div class="profile-title">
        <h2>{{ user.firstname }} {{ user.lastname }}</h2>
        <div v-if="user.campus" class="profile-subtitle">
          <span class="school-tag">{{ user.campus.school?.name || user.campus.schoolId || 'École' }}</span>
          <span class="campus-tag">{{ user.campus.name }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button @click="emit('logout')" class="btn btn-secondary btn-sm">
          Se déconnecter
        </button>
      </div>
    </div>

    <div class="account-grid">
      <div class="info-section">
        <h2 class="section-title">Informations personnelles</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Email :</label>
            <span>{{ user.email }}</span>
          </div>
          <div class="info-item">
            <label>Date d'inscription :</label>
            <span>{{ formatDate(user.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="session-section">
        <h2 class="section-title">Session de formation</h2>
        <div v-if="hasValidSession && sessionDetails" class="session-status-card">
          <div class="session-meta">
            <span class="session-code">Code: {{ sessionDetails.code }}</span>
            <span :class="['status-indicator', isSessionOpen ? 'open' : 'closed']">
              {{ isSessionOpen ? '● Ouverte' : '● Fermée' }}
            </span>
          </div>
          
          <div class="session-actions">
            <router-link 
              v-if="isSessionOpen" 
              to="/session-cours" 
              class="btn btn-primary btn-block"
            >
              ENTRER DANS LE COURS
            </router-link>
            <router-link 
              v-else 
              to="/waiting-room" 
              class="btn btn-crystal btn-block"
            >
              FILE D'ATTENTE
            </router-link>
          </div>
        </div>
        <div v-else-if="hasValidSession" class="session-valid">
          <p>✅ Session de formation valide.</p>
        </div>
        <div v-else class="session-invalid">
          <p>❌ Aucune session valide.</p>
          <router-link to="/session" class="btn btn-primary btn-sm">
            Valider
          </router-link>
        </div>
      </div>
    </div>

    <div class="actions">
      <div class="profile-settings">
        <h3>Paramètres de compte</h3>
        <div class="settings-grid">
          <button @click="emit('openProfileModal')" class="btn btn-crystal btn-sm">
            Modifier mes coordonnées
          </button>
          <button @click="emit('openPasswordModal')" class="btn btn-crystal btn-sm">
            Modifier le mot de passe
          </button>
          <button @click="emit('openDeleteModal')" class="btn btn-danger btn-sm">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  user: any
  hasValidSession: boolean
  sessionDetails: any | null
}>()

const emit = defineEmits<{
  logout: []
  openProfileModal: []
  openPasswordModal: []
  openDeleteModal: []
}>()

const isSessionOpen = computed(() => {
  if (!props.sessionDetails) return false
  // On considère la session ouverte si elle n'est pas explicitement verrouillée dans sa config
  // Note: dans la structure actuelle, si isLocked n'existe pas, on considère ouvert par défaut (ou selon déduction)
  return props.sessionDetails.config?.isLocked === false || props.sessionDetails.config?.isOpen === true
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.content-section {
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

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.profile-photo {
  flex-shrink: 0;
}

.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #00d4ff;
}

.photo-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.profile-title h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #e0e0e0;
}

.profile-subtitle {
  display: flex;
  gap: 1rem;
}

.school-tag,
.campus-tag {
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
}

.school-tag {
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.1);
}

.campus-tag {
  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.header-actions {
  margin-left: auto;
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-section,
.session-section {
  background: rgba(51, 51, 51, 0.3);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #333;
}

.section-title {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #00d4ff;
  font-weight: 600;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border-left: 3px solid #00d4ff;
}

.info-item label {
  font-weight: 600;
  color: #b0b0b0;
}

.info-item span {
  color: #e0e0e0;
}

.session-valid,
.session-invalid {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.session-valid {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid #22c55e;
  color: #86efac;
}

.session-invalid {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #fca5a5;
}

.actions {
  margin-top: 2rem;
}

.profile-settings {
  background: rgba(51, 51, 51, 0.3);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #333;
}

.profile-settings h3 {
  margin-bottom: 1.5rem;
  color: #00d4ff;
  font-size: 1.05rem;
}

.settings-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background-color: #00d4ff;
  color: #0f0f1e;
}

.btn-primary:hover {
  background-color: #00a8cc;
}

.btn-crystal {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-weight: 600;
  letter-spacing: 0.05rem;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

.btn-crystal:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.2),
    0 4px 6px -2px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

.btn-crystal:active {
  transform: translateY(0);
}

.btn-secondary {
  background-color: #333;
  color: #e0e0e0;
  border: 1px solid #555;
}

.btn-secondary:hover {
  background-color: #444;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-actions {
    margin-left: 0;
    width: 100%;
  }

  .header-actions .btn {
    width: 100%;
  }

  .account-grid {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    flex-direction: column;
  }

  .settings-grid .btn {
    width: 100%;
  }
}
.session-status-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.session-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.session-code {
  font-weight: 600;
  color: #94a3b8;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-indicator {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.status-indicator.open {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.status-indicator.closed {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.session-actions {
  display: flex;
  flex-direction: column;
}

.btn-block {
  width: 100%;
  padding: 0.8rem;
  text-align: center;
  justify-content: center;
}

.btn-secondary.btn-block {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.btn-secondary.btn-block:hover {
  background: rgba(148, 163, 184, 0.2);
}
</style>
