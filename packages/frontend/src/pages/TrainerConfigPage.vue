<!-- src/pages/TrainerConfigPage.vue -->
<template>
  <div class="trainer-config-layout" v-if="trainerStore.isAuthenticated">
    <header class="config-header">
      <div class="container">
        <div class="header-content">
          <router-link to="/trainer" class="btn-back-crystal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Retour au Dashboard
          </router-link>
          <div class="title-section">
            <h1>Configuration de la formation</h1>
            <p class="subtitle">{{ formationTitle }}</p>
          </div>
          <button @click="saveConfiguration" class="btn-save-crystal" :disabled="isSaving">
            <span v-if="!isSaving">Enregistrer les modifications</span>
            <span v-else>Enregistrement...</span>
          </button>
        </div>
      </div>
    </header>

    <main class="config-main">
      <div class="container grid-container">
        <!-- Bloc Administratif -->
        <section class="config-card glass-crystal admin-section">
          <div class="card-header">
            <div class="icon-badge blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h2>Cadre Administratif</h2>
          </div>

          <div class="card-body">
            <div class="form-group">
              <label for="formationCode">Code de la formation</label>
              <input 
                id="formationCode" 
                v-model="config.code" 
                type="text" 
                placeholder="Ex: A11Y2026"
                class="input-crystal"
              />
            </div>

            <div class="form-group">
              <label for="school">École</label>
              <select id="school" v-model="config.schoolId" class="input-crystal">
                <option value="">Sélectionnez une école</option>
                <option v-for="school in schools" :key="school.id" :value="school.id">
                  {{ school.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Campus éligibles</label>
              <div class="checkbox-grid">
                <label v-for="campus in availableCampus" :key="campus.id" class="checkbox-item-crystal">
                  <input type="checkbox" v-model="config.eligibleCampusIds" :value="campus.id" />
                  <span class="checkbox-label">{{ campus.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <!-- Bloc Assiduité -->
        <section class="config-card glass-crystal rules-section">
          <div class="card-header">
            <div class="icon-badge amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2>Règles d'assiduité</h2>
          </div>

          <div class="card-body">
            <div class="rules-group">
              <h3>Répartition de la note</h3>
              <div class="note-balance">
                <div class="form-group-inline">
                  <label>Assiduité (%)</label>
                  <input v-model.number="config.attendanceWeight" type="number" min="0" max="100" class="input-crystal small" />
                </div>
                <div class="form-group-inline">
                  <label>Quiz / TP (%)</label>
                  <input v-model.number="config.quizWeight" type="number" min="0" max="100" class="input-crystal small" />
                </div>
              </div>
              <p class="hint" :class="{ 'error-text': totalWeight !== 100 }">
                Total : {{ totalWeight }}% (doit être égal à 100%)
              </p>
            </div>

            <div class="rules-group">
              <h3>Tolérance à la distraction</h3>
              <div class="distraction-config">
                <div class="toggle-group">
                  <button 
                    @click="config.distractionUnit = 'minutes'" 
                    :class="{ active: config.distractionUnit === 'minutes' }"
                    class="btn-toggle"
                  >En minutes</button>
                  <button 
                    @click="config.distractionUnit = 'percent'" 
                    :class="{ active: config.distractionUnit === 'percent' }"
                    class="btn-toggle"
                  >En % du temps</button>
                </div>
                
                <div class="form-group">
                  <label>Limite acceptable</label>
                  <div class="input-with-unit">
                    <input v-model.number="config.distractionLimit" type="number" min="0" class="input-crystal" />
                    <span class="unit">{{ config.distractionUnit === 'minutes' ? 'min' : '%' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Notification system -->
    <Transition name="fade">
      <div v-if="notification" class="notification-crystal" :class="notification.type">
        {{ notification.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTrainerStore } from '@/stores/trainerStore'
import { apiClient } from '@/utils/api'

const route = useRoute()
const trainerStore = useTrainerStore()
const isSaving = ref(false)
const notification = ref<{ message: string, type: 'success' | 'error' } | null>(null)

const formationTitle = ref('Chargement...')
const schools = ref<any[]>([])
const availableCampus = ref<any[]>([])
const allSessions = ref<any[]>([])

const config = ref({
  code: '',
  schoolId: '',
  eligibleCampusIds: [] as string[],
  attendanceWeight: 40,
  quizWeight: 60,
  distractionLimit: 15,
  distractionUnit: 'minutes' as 'minutes' | 'percent',
  adminName: '',
  adminEmail: '',
  attendanceMode: 'automated'
})

const totalWeight = computed(() => {
  return (config.value.attendanceWeight || 0) + (config.value.quizWeight || 0)
})

const fetchInitialData = async () => {
  try {
    // 1. Charger les écoles
    const schoolRes = await apiClient.get('/schools')
    if (schoolRes.data?.success) {
      schools.value = schoolRes.data.data
    }

    // 2. Charger les sessions pour récupérer le code
    const sessionRes = await apiClient.get('/sessions')
    const sessions = sessionRes.data?.data || []
    
    if (sessions.length > 0) {
      allSessions.value = sessions
      const formationId = route.query.id
      const currentSession = sessions.find((s: any) => s.id === formationId)
      
      if (currentSession) {
        formationTitle.value = (currentSession.school?.name || 'Inconnue') + ' - ' + currentSession.code
        config.value.code = currentSession.code
        
        // Force l'ID de l'école (FK)
        config.value.schoolId = currentSession.schoolId || ''
        
        // Charger les campus liés à cette session/école
        if (currentSession.schoolId) {
          await fetchCampus(currentSession.schoolId)
        }
        
        // Restaurer les campus sélectionnés
        if (currentSession.campusIds) {
          config.value.eligibleCampusIds = currentSession.campusIds.split(',')
        }

        // Restaurer la config JSON
        if (currentSession.config) {
          const remoteConfig = typeof currentSession.config === 'string' 
            ? JSON.parse(currentSession.config) 
            : currentSession.config
          
          config.value.adminName = remoteConfig.adminName || ''
          config.value.adminEmail = remoteConfig.adminEmail || ''
          config.value.attendanceMode = remoteConfig.attendanceMode || 'automated'
          config.value.attendanceWeight = remoteConfig.attendanceWeight || 40
          config.value.quizWeight = remoteConfig.quizWeight || 60
          config.value.distractionLimit = remoteConfig.distractionLimit || 15
          config.value.distractionUnit = remoteConfig.distractionUnit || 'minutes'
        }
      }
    }
  } catch (err) {
    console.error('Erreur chargement données initiales:', err)
    showNotification('Erreur de connexion serveur', 'error')
  }
}

const fetchCampus = async (schoolId: string) => {
  if (!schoolId) return
  try {
    const campusRes = await apiClient.get(`/campus?schoolId=${encodeURIComponent(schoolId)}`)
    if (campusRes.data?.success) {
      availableCampus.value = campusRes.data.data
    }
  } catch (err) {
    console.error('Erreur chargement campus:', err)
  }
}

// Watcher pour mettre à jour les campus quand l'école change
watch(() => config.value.schoolId, (newId) => {
  if (newId) {
    fetchCampus(newId)
  } else {
    availableCampus.value = []
    config.value.eligibleCampusIds = []
  }
})

const saveConfiguration = async () => {
  if (totalWeight.value !== 100) {
    showNotification('Le total de la note doit être de 100%', 'error')
    return
  }

  const formationId = route.query.id
  if (!formationId) {
    showNotification('Identifiant de formation manquant', 'error')
    return
  }

  isSaving.value = true
  try {
    const payload = {
      id: formationId,
      schoolId: config.value.schoolId, // On envoie maintenant l'ID de l'école (CUID)
      campusIds: config.value.eligibleCampusIds.join(','),
      config: {
        adminName: config.value.adminName,
        adminEmail: config.value.adminEmail,
        attendanceMode: config.value.attendanceMode,
        attendanceWeight: config.value.attendanceWeight,
        quizWeight: config.value.quizWeight,
        distractionLimit: config.value.distractionLimit,
        distractionUnit: config.value.distractionUnit
      }
    }

    const response = await apiClient.post('/sessions', payload)
    
    if (response.data.success) {
      showNotification('Configuration enregistrée en base de données !', 'success')
      
      // Mettre à jour le titre localement avec le nom de l'école
      const selectedSchool = schools.value.find(s => s.id === config.value.schoolId)
      formationTitle.value = (selectedSchool?.name || 'Inconnue') + ' - ' + config.value.code
    } else {
      throw new Error(response.data.error || 'Erreur lors de la sauvegarde')
    }
  } catch (err: any) {
    console.error('Save error:', err)
    showNotification(err.message || "Erreur lors de l'enregistrement", 'error')
  } finally {
    isSaving.value = false
  }
}

const showNotification = (message: string, type: 'success' | 'error') => {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

onMounted(async () => {
  await fetchInitialData()
  const formationId = route.query.id
  if (formationId) {
    // Fetch real data here
    console.log('Loading formation config for:', formationId)
  }
})
</script>

<style scoped>
.trainer-config-layout {
  min-height: 100vh;
  background: radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%);
  color: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.config-header {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.btn-back-crystal {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-back-crystal:hover {
  color: #fff;
  transform: translateX(-4px);
}

.title-section h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.title-section .subtitle {
  color: #00d4ff;
  font-weight: 600;
}

.btn-save-crystal {
  background: #00d4ff;
  color: #020617;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.btn-save-crystal:hover:not(:disabled) {
  transform: scale(1.02) translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
}

.btn-save-crystal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.config-main {
  padding: 3rem 0;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.config-card {
  padding: 2rem;
  border-radius: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.icon-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-badge.blue { background: rgba(0, 212, 255, 0.1); color: #00d4ff; }
.icon-badge.amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.icon-badge svg { width: 24px; height: 24px; }

.card-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #94a3b8;
}

.input-crystal {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.8rem 1rem;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.input-crystal:focus {
  border-color: #00d4ff;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.1);
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.checkbox-item-crystal {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.checkbox-item-crystal:hover {
  background: rgba(255, 255, 255, 0.05);
}

.rules-group {
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.rules-group h3 {
  font-size: 1rem;
  margin-bottom: 1.25rem;
  color: #fff;
}

.note-balance {
  display: flex;
  gap: 2rem;
}

.form-group-inline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.input-crystal.small {
  width: 80px;
}

.hint { font-size: 0.85rem; color: #64748b; margin-top: 1rem; }
.error-text { color: #f87171; font-weight: bold; }

.distraction-config {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.toggle-group {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 10px;
  width: fit-content;
}

.btn-toggle {
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle.active {
  background: #00d4ff;
  color: #020617;
}

.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-unit .input-crystal {
  width: 100%;
}

.input-with-unit .unit {
  position: absolute;
  right: 1rem;
  color: #64748b;
  font-weight: 600;
}

.notification-crystal {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  color: #fff;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.notification-crystal.success { background: rgba(34, 197, 94, 0.9); border: 1px solid #22c55e; }
.notification-crystal.error { background: rgba(239, 68, 68, 0.9); border: 1px solid #ef4444; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.svg-icon { width: 20px; height: 20px; }

@media (max-width: 900px) {
  .grid-container { grid-template-columns: 1fr; }
}
</style>
