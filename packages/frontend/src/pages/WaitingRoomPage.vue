<!-- src/pages/WaitingRoomPage.vue -->
<template>
  <div class="waiting-room-layout">
    <div class="waiting-card">
      <div class="loader-container">
        <div class="pulse-loader"></div>
        <div class="inner-icon">🚪</div>
      </div>
      
      <h1>Bonjour {{ userStore.currentUser?.firstname }} !</h1>
      <p class="subtitle">Vous êtes bien connecté à votre espace de formation.</p>

      <div class="session-status-box">
        <div class="status-header">
          <template v-if="!isSessionOpened">
            <span class="status-dot pulsing"></span>
            <span class="status-text">Salle de cours en préparation...</span>
          </template>
          <template v-else>
            <span class="status-dot pulsing opened"></span>
            <span class="status-text opened-text">La porte est ouverte !</span>
          </template>
        </div>
        <div class="session-info">
          <p><strong>Session :</strong> {{ userStore.currentUser?.sessionId?.toString().substring(0,8) }}...</p>
          <p><strong>Statut :</strong> {{ !isSessionOpened ? 'Dans le couloir...' : 'Prêt à entrer' }}</p>
        </div>
      </div>

      <div class="actions">
        <button @click="enterCourse" class="btn-enter" :disabled="isEntering || !isSessionOpened">
          <span v-if="!isEntering">Entrer dans la salle de cours</span>
          <span v-else class="loading-inline">Chargement...</span>
        </button>
      </div>

      <p class="waiting-tip">💡 Conseil : Gardez cet onglet ouvert, votre formateur va bientôt démarrer la présentation.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

const router = useRouter()
const userStore = useUserStore()
const isEntering = ref(false)
const isSessionOpened = ref(false)

// Yjs pour écouter l'ouverture de la porte
const ydoc = new Y.Doc()
let provider: any = null

onMounted(() => {
  const sessionId = userStore.currentUser?.sessionId
  if (sessionId) {
    provider = new WebrtcProvider(`a11y-session-${sessionId}`, ydoc, {
      signaling: ['wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com']
    })

    const sharedActiveState = ydoc.getMap<any>('active_presentation_state')
    
    // Observer les changements d'état de la session
    sharedActiveState.observe(() => {
      const status = sharedActiveState.get('sessionStatus')
      isSessionOpened.value = (status === 'opened')
    })

    // Vérification initiale
    const status = sharedActiveState.get('sessionStatus')
    isSessionOpened.value = (status === 'opened')
  }
})

onUnmounted(() => {
  if (provider) {
    provider.disconnect()
    provider.destroy()
  }
  ydoc.destroy()
})

const enterCourse = () => {
  isEntering.value = true
  const sessionId = userStore.currentUser?.sessionId
  if (sessionId) {
    // Petit délai pour l'effet d'entrée
    setTimeout(() => {
      router.push(`/session-cours/${sessionId}`)
    }, 800)
  } else {
    router.push('/account')
  }
}
</script>

<style scoped>
.waiting-room-layout {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
}

.waiting-card {
  max-width: 500px;
  width: 100%;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.loader-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-loader {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}

.inner-icon {
  font-size: 2.5rem;
  z-index: 2;
}

h1 {
  color: #fff;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.session-status-box {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #6366f1;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
}

.status-dot.pulsing {
  animation: blink 1s infinite alternate;
}

@keyframes blink {
  from { opacity: 0.4; }
  to { opacity: 1; }
}

.session-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #e2e8f0;
  font-size: 0.95rem;
}

.btn-enter {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
}

.btn-enter:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.5);
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
}

.status-dot.pulsing.opened {
  background: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
}

.status-text.opened-text {
  color: #22c55e;
}

.btn-enter:disabled {
  opacity: 0.5;
  background: #334155;
  box-shadow: none;
  cursor: not-allowed;
  transform: none !important;
}

.waiting-tip {
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
}
</style>