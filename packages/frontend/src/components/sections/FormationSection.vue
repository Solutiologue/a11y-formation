<template>
  <div class="content-section">
    <div v-if="hasValidSession && sessionId">
      <div class="sessions-grid-container">
        <h2 class="section-title">Mes formations en cours</h2>
        <div class="sessions-grid">
          <div class="session-card crystal-card-v3">
            <div class="card-header-v3">
              <span :class="['status-badge', isSessionOpen ? 'open' : 'closed']">
                {{ isSessionOpen ? 'OUVERTE' : 'FERMÉE' }}
              </span>
              <span class="date-v3">{{ sessionDateRange }}</span>
            </div>
            <div class="card-body-v3">
              <h3 class="session-title-text">Accessibilité Numérique (A11y)</h3>
              <p class="school-v3 text-turquoise">{{ userStore.currentUser?.campus?.school?.name || 'Mon École' }}</p>
              <div class="status-panel-v3">
                <div class="status-row-v3">
                  <span class="label">Statut salle :</span>
                  <span :class="isSessionOpen ? 'text-success' : 'text-danger'" class="value">
                    {{ isSessionOpen ? 'Porte Ouverte' : 'Porte Fermée' }}
                  </span>
                </div>
                <div class="status-row-v3">
                  <span class="label">Code :</span>
                  <span class="value text-muted">{{ sessionCode }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer-v3">
              <button v-if="isSessionOpen" @click="enterCourse" class="btn-v3 btn-primary-v3">ENTRER DANS LA SALLE</button>
              <button v-else @click="goToWaitingRoom" class="btn-v3 btn-crystal-v3">FILE D'ATTENTE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="session-invalid-v3">
      <p>❌ Aucune session active trouvée.</p>
      <button @click="emit('validateSession')" class="btn-v3 btn-primary-v3" style="width: auto; padding: 0.75rem 2rem;">REJOINDRE UNE FORMATION</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { apiClient } from '@/utils/api'

const props = defineProps<{
  hasValidSession: boolean
  sessionId?: string
}>()

const emit = defineEmits<{
  validateSession: []
}>()

const router = useRouter()
const userStore = useUserStore()
const sessionDetails = ref<any>(null)

const isSessionOpen = computed(() => {
  if (!sessionDetails.value) return false
  return sessionDetails.value.config?.isLocked === false || sessionDetails.value.config?.isOpen === true
})

const sessionCode = computed(() => sessionDetails.value?.code || '...' 
)

const sessionDateRange = computed(() => {
  if (!sessionDetails.value?.startDate) return 'En cours'
  const start = new Date(sessionDetails.value.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return `Depuis le ${start}`
})

const loadSession = async (sid: string) => {
  try {
    const res = await apiClient.post('/sessions/validate', { id: sid })
    if (res.data.success) sessionDetails.value = res.data.data
  } catch (e) { console.error('Erreur API Session:', e) }
}

const enterCourse = () => {
  if (props.sessionId) router.push({ name: 'session-course', params: { sessionId: props.sessionId } })
}

const goToWaitingRoom = () => router.push('/waiting-room')

onMounted(() => { if (props.sessionId) loadSession(props.sessionId) })
watch(() => props.sessionId, (newId) => { if (newId) loadSession(newId) })
</script>

<style scoped>
.crystal-card-v3 { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 20px; width: 100%; max-width: 420px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
.card-header-v3 { padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.3); }
.status-badge { font-size: 0.75rem; font-weight: 800; padding: 0.3rem 0.8rem; border-radius: 6px; letter-spacing: 0.05em; }
.status-badge.open { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); }
.status-badge.closed { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); }
.date-v3 { color: #94a3b8; font-size: 0.85rem; font-weight: 500; }
.card-body-v3 { padding: 2rem; }
.session-title-text { font-size: 1.4rem; color: #fff; margin-bottom: 0.5rem; font-weight: 700; }
.text-turquoise { color: #00d4ff; font-weight: 600; font-size: 1rem; }
.status-panel-v3 { margin-top: 1.5rem; background: rgba(0, 0, 0, 0.3); padding: 1.25rem; border-radius: 12px; display: flex; flex-direction: column; gap: 1rem; }
.status-row-v3 { display: flex; justify-content: space-between; font-size: 0.95rem; }
.label { color: #64748b; }
.value { font-weight: 600; }
.text-success { color: #10b981; }
.text-danger { color: #f43f5e; }
.text-muted { color: #94a3b8; }
.card-footer-v3 { padding: 1.5rem 2rem 2rem; }
.btn-v3 { width: 100%; padding: 1rem; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em; }
.btn-primary-v3 { background: #00d4ff; color: #080816; }
.btn-primary-v3:hover { background: #00b8e6; transform: translateY(-2px); }
.btn-crystal-v3 { background: rgba(0, 212, 255, 0.1); color: #00d4ff; border: 1px solid rgba(0, 212, 255, 0.3); }
.btn-crystal-v3:hover { background: rgba(0, 212, 255, 0.2); }
.session-invalid-v3 { padding: 3rem; text-align: center; background: rgba(255, 255, 255, 0.02); border-radius: 16px; border: 1px dashed rgba(255, 255, 255, 0.1); }
.section-title { color: #00d4ff; font-size: 1.6rem; margin-bottom: 2.5rem; font-weight: 700; }
</style>
