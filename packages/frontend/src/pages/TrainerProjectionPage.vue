<template>
  <div class="projection-page">
    <div v-if="currentChapter && !isPaused" class="slide-container" ref="slideContainer">
      <div class="slide-wrapper" :style="{ transform: `scale(${scale})` }">
        <div class="slide-header">
          <h1 v-if="currentSlide">{{ currentSlide.title }}</h1>
          <h1 v-else>{{ currentChapter.title }}</h1>
        </div>
        <div class="slide-content">
          <div v-if="currentSlide" class="slide-real-content" v-html="currentSlide.content"></div>
          <div v-else class="slide-placeholder">
            <p>{{ currentChapter.description }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="isPaused" class="pause-screen">
      <div class="pause-content">
        <div class="pause-icon-large">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h1>SESSION EN PAUSE</h1>
        <div v-if="pauseEndTime" class="resume-time-projection">
          REPRISE À {{ pauseEndTime }}
        </div>
        <p>PAUSE CAFÉ / DÉTENTE - À TOUT DE SUITE</p>
      </div>
    </div>
    <div v-else class="waiting-screen">
      <img src="/logo-header.png" alt="A11Y" class="projection-logo">
      <p>PRÉPARATION DE L'ANIMATION</p>
    </div>

    <!-- Notifications de réactions au centre -->
    <TransitionGroup name="reaction-slide" tag="div" class="reactions-overlay">
      <div v-for="reaction in activeReactions" :key="reaction.key" class="reaction-toast">
        <div class="reaction-icon">💬</div>
        <div class="reaction-text">
          <span class="reaction-user">{{ reaction.userName }}</span>
          <span class="reaction-msg">souhaite réagir</span>
        </div>
      </div>
    </TransitionGroup>

    <!-- Coin (Corner) indicateur persistant en bas à droite -->
    <div 
      v-if="activeHands.length > 0" 
      class="hand-corner" 
      :class="{ 'is-reaction': activeHands[0].type === 'reaction' }"
      :style="{ '--corner-color': activeHands[0].type === 'reaction' ? '#a855f7' : '#f59e0b' }"
    >
      <div class="corner-triangle"></div>
      <div class="corner-icon">
        <svg v-if="activeHands[0].type === 'reaction'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path>
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v11"></path>
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
        </svg>
        <div v-if="activeHands.length > 1" class="corner-badge">{{ activeHands.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { useTrainerStore } from '@/stores/trainerStore'

const trainerStore = useTrainerStore()

const ydoc = new Y.Doc()
let provider: any = null
const sharedActiveState = ydoc.getMap<any>('active_presentation_state')

const currentChapter = ref<any>(null)
const activeSlideIndex = ref(0)
const isPaused = ref(false)
const pauseEndTime = ref<string | null>(null)
const scale = ref(1)
const slideContainer = ref<HTMLElement | null>(null)
const activeReactions = ref<any[]>([])
const activeHands = ref<any[]>([])
const handledReactions = new Set<string>()
let currentSessionId: string | null = null

const currentSlide = computed(() => {
  if (!currentChapter.value || !currentChapter.value.slides) return null
  return currentChapter.value.slides[activeSlideIndex.value] || currentChapter.value.slides[0]
})

const updateScale = () => {
  const containerWidth = window.innerWidth
  const containerHeight = window.innerHeight
  const baseWidth = 1920
  const baseHeight = 1080
  scale.value = Math.min(containerWidth / baseWidth, containerHeight / baseHeight)
}

const handleKeyDown = (e: KeyboardEvent) => {
  // Si on appuie sur Espace ou Entrée dans cette fenêtre, on tente de redonner le focus au parent (formateur)
  if (e.key === ' ' || e.key === 'Enter') {
    if (window.opener && !window.opener.closed) {
      // On envoie un message postMessage pour que le parent sache qu'il doit reprendre la main
      window.opener.postMessage('resume-focus', '*')
      
      // Tentative de focus (souvent bloqué, mais postMessage aidera le parent à s'auto-focus)
      try {
        window.opener.focus()
      } catch (e) {
        console.warn('Focus parental bloqué par le navigateur')
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  // ... reste du code existant ...
  let sessionId = trainerStore.currentTrainer?.sessionId
  if (!sessionId) {
    const storedTrainer = sessionStorage.getItem('trainer')
    if (storedTrainer) {
      try {
        const trainer = JSON.parse(storedTrainer)
        sessionId = trainer.sessionId
      } catch (e) {
        console.error('Projection: Failed to parse trainer from sessionStorage', e)
      }
    }
  }

  if (sessionId) {
    currentSessionId = sessionId
    provider = new WebrtcProvider(`a11y-session-${sessionId}`, ydoc, {
      signaling: ['wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com']
    })

    const syncState = () => {
      const activeId = sharedActiveState.get('activeChapterId')
      const slideIdx = sharedActiveState.get('activeSlideIndex')
      const paused = sharedActiveState.get('isPaused') === 'true'
      const endTime = sharedActiveState.get('pauseEndTime')
      
      isPaused.value = paused
      pauseEndTime.value = endTime || null
      activeSlideIndex.value = slideIdx || 0
      
      if (activeId && !paused) {
        if (!currentChapter.value || currentChapter.value.id !== activeId) {
          fetchChapterDetails(activeId)
        }
      } else {
        currentChapter.value = null
      }
    }

    sharedActiveState.observe(syncState)
    setTimeout(syncState, 500)

    // Surveillance des réactions et mains levées
    provider.awareness.on('change', () => {
      const states = Array.from(provider.awareness.getStates().values())
      
      const currentActiveKeys = new Set()
      
      // 1. D'abord on identifie tout ce qui est actif
      states.forEach((state: any) => {
        if (state.handRaised === true && state.user && state.handRaisedAt) {
          const interactionKey = state.user.id + '-' + state.handRaisedAt
          currentActiveKeys.add(interactionKey)
        }
      })

      // 2. Nettoyage de handledReactions (ce qui n'est plus actif)
      for (const key of handledReactions) {
        if (!currentActiveKeys.has(key)) {
          handledReactions.delete(key)
        }
      }

      // 3. Traitement
      states.forEach((state: any) => {
        if (state.handRaised === true && state.user && state.handRaisedAt) {
          const interactionKey = state.user.id + '-' + state.handRaisedAt
          const isRecent = (Date.now() - state.handRaisedAt) < 2000

          // SI C'EST UNE QUESTION -> ON BLOQUE TOUT MAINTENANT ET POUR L'AVENIR (interactionKey)
          if (state.handRaiseType === 'question' || state.type === 'question') {
            handledReactions.add(interactionKey)
            
            // SÉCURITÉ RADICALE : On retire immédiatement de la liste des toasts si jamais y-webrtc a envoyé une reaction juste avant
            activeReactions.value = activeReactions.value.filter((r: any) => r.key !== interactionKey)
            return
          } 
          
          // SI C'EST UNE REACTION
          if ((state.handRaiseType === 'reaction' || state.type === 'reaction') && isRecent && !handledReactions.has(interactionKey)) {
            // Marquage immédiat pour ne pas répéter le toast
            handledReactions.add(interactionKey)
            
            const newReaction = {
              key: interactionKey,
              userName: state.user.firstname || state.user.name || 'Un apprenant',
              type: 'reaction',
              timestamp: state.handRaisedAt
            }
            
            activeReactions.value.push(newReaction)
            
            setTimeout(() => {
              activeReactions.value = activeReactions.value.filter((r: any) => r.key !== interactionKey)
            }, 4000)
          }
        }
      })

      // 4. CORNERS
      activeHands.value = states
        .filter((state: any) => state.handRaised === true && state.user)
        .map((state: any) => ({
          userId: state.user.id,
          type: state.handRaiseType || 'question',
          at: state.handRaisedAt || Date.now()
        }))
        .sort((a: any, b: any) => b.at - a.at)
    })
  }

  window.addEventListener('resize', updateScale)
  updateScale()
})

const fetchChapterDetails = async (id: string) => {
  try {
    const url = currentSessionId ? `/api/chapters?sessionId=${currentSessionId}` : `/api/chapters`
    const response = await fetch(url)
    const result = await response.json()
    
    // Le serveur renvoie { success: true, data: chapters }
    const chapters = result.data || result
    const chapter = Array.isArray(chapters) ? chapters.find((c: any) => c.id === id) : null
    
    if (chapter) {
      currentChapter.value = chapter
      setTimeout(updateScale, 100)
    }
  } catch (e) {
    console.error('Projection error fetching chapters:', e)
  }
}

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
  if (provider) provider.destroy()
  ydoc.destroy()
})
</script>

<style scoped>
.projection-page {
  width: 100vw;
  height: 100vh;
  background: #000;
  color: #fff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
}

.slide-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.slide-wrapper {
  width: 1920px;
  height: 1080px;
  flex-shrink: 0;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  transform-origin: center center;
}

.slide-header {
  padding: 3rem 4rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
}

.slide-header h1 {
  font-size: 4.5rem;
  color: #fff;
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.slide-content {
  flex: 1;
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-real-content {
  width: 100%;
  height: 100%;
  font-size: 2.2rem;
  line-height: 1.6;
  color: #cbd5e1;
}

.slide-real-content :deep(h2) {
  font-size: 3.5rem;
  color: #38bdf8;
  margin-bottom: 2rem;
}

.slide-real-content :deep(ul) {
  margin-left: 3rem;
  margin-top: 2rem;
}

.slide-real-content :deep(li) {
  margin-bottom: 1.5rem;
}

.slide-placeholder p {
  font-size: 2.8rem;
  color: #94a3b8;
  line-height: 1.4;
  text-align: center;
  max-width: 1400px;
}

.pause-screen, .waiting-screen {
  text-align: center;
}

.projection-logo {
  height: 120px;
  width: auto;
  margin-bottom: 2rem;
  filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.3));
}

.pause-content h1, .waiting-screen .logo-placeholder {
  font-size: 5rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.pause-icon-large {
  color: #6366f1;
  margin-bottom: 2rem;
}

.pause-icon-large svg {
  width: 120px;
  height: 120px;
}

.resume-time-projection {
  font-family: 'Space Mono', monospace, sans-serif;
  color: #6366f1;
  font-size: 6rem;
  font-weight: 900;
  margin: 2rem 0;
  text-shadow: 0 0 40px rgba(99, 102, 241, 0.4);
}

.pause-content p, .waiting-screen p {
  font-size: 1.5rem;
  color: #475569;
  letter-spacing: 0.2em;
}

/* Overlays de réaction */
.reactions-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 10000;
  pointer-events: none;
}

.reaction-toast {
  background: rgba(88, 28, 135, 0.4); /* Pourpre sombre cristal */
  backdrop-filter: blur(20px) saturate(180%);
  padding: 3rem 6rem;
  border-radius: 40px;
  border: 1px solid rgba(192, 132, 252, 0.4);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(168, 85, 247, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 2.5rem;
  animation: pulse-crystal 4s infinite ease-in-out;
  min-width: 700px;
  justify-content: center;
}

.reaction-icon {
  font-size: 5rem;
}

.reaction-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.reaction-user {
  font-size: 3.5rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.02em;
}

.reaction-msg {
  font-size: 2rem;
  color: #e9d5ff; /* Pourpre clair pour contraste RGAA */
  font-weight: 500;
}

/* Animations VUE */
.reaction-slide-enter-active,
.reaction-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.reaction-slide-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(40px);
}

.reaction-slide-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-20px);
}

@keyframes pulse-crystal {
  0% { transform: scale(1); box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.1); }
  50% { transform: scale(1.02); box-shadow: 0 35px 70px rgba(0, 0, 0, 0.6), 0 0 50px rgba(168, 85, 247, 0.2); }
  100% { transform: scale(1); box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.1); }
}

/* Corner Indicateur (Bas à droite) */
.hand-corner {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 120px;
  height: 120px;
  z-index: 10001;
  pointer-events: none;
  animation: corner-in 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.corner-triangle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 120px 120px;
  border-color: transparent transparent var(--corner-color, #f59e0b) transparent;
  filter: drop-shadow(-4px -4px 10px rgba(0,0,0,0.3));
  transition: border-color 0.3s ease;
}

.hand-corner.is-reaction .corner-triangle {
  border-color: transparent transparent #a855f7 transparent; /* Pourpre */
}

.corner-icon {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hand-corner.is-reaction .corner-icon {
  color: #fff;
}

.corner-icon svg {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.corner-badge {
  position: absolute;
  top: -12px;
  left: -12px;
  background: #fff;
  color: #000;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

@keyframes corner-in {
  from { transform: translate(100%, 100%); }
  to { transform: translate(0, 0); }
}
</style>
