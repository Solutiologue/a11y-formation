<!-- src/pages/SessionCoursePage.vue -->
<template>
  <div class="session-course-layout">
    <!-- Header Ultra Fin (50% de hauteur standard env.) -->
    <header class="session-header">
      <div class="header-left">
        <div class="logo-container">
          <img src="/logo-header.png" alt="A11Y" class="header-logo">
        </div>
        <span class="session-name">Formation Accessibilité Numérique</span>
      </div>
      <div class="header-right">
        <button @click="leaveSession" class="btn-leave">
          <span class="icon">🚪</span> Quitter la salle de cours
        </button>
      </div>
    </header>

    <div class="session-body">
      <!-- Zone 1 : Liste des slides / Menu latéral -->
      <aside class="slides-sidebar" :class="{ 'is-hidden': !isSidebarVisible }">
        <button class="sidebar-toggle-btn left" @click="toggleSidebar" :title="isSidebarVisible ? 'Replier le menu' : 'Déplier le menu'">
          {{ isSidebarVisible ? '◀' : '▶' }}
        </button>
        <div class="sidebar-content" ref="sidebarContent">
          <div v-for="chapter in chapters" :key="chapter.id" class="chapter-group">
            <div class="chapter-header" :class="{ locked: chapter.isLocked }">
              <span class="lock-icon" v-if="chapter.isLocked">🔒</span>
              <h3>{{ chapter.order + 1 }}. {{ chapter.title }}</h3>
            </div>
            <ul class="slides-list" v-if="!chapter.isLocked">
              <!-- Slide Chapô -->
              <li 
                :class="{ active: isActiveSlide(chapter.id, -1) }"
                @click="selectSlide(chapter.id, -1)"
                tabindex="0"
              >
                🏁 Présentation : {{ chapter.title }}
              </li>

              <li 
                v-for="(slide, sIdx) in chapter.slides" 
                :key="slide.id"
                :class="{ active: isActiveSlide(chapter.id, Number(sIdx)), locked: slide.isLocked }"
                @click="!slide.isLocked && selectSlide(chapter.id, Number(sIdx))"
                :tabindex="slide.isLocked ? -1 : 0"
              >
                <span class="lock-mini" v-if="slide.isLocked">🔒 </span>
                {{ slide.title || 'Slide ' + (Number(sIdx) + 1) }}
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- Zone 2 : Tableau / Slide Active 16:9 -->
      <main class="slides-viewport" ref="viewport">
        <div 
          v-if="currentSlide" 
          class="slide-container"
          :class="{ 'clickable-overlay': isUserInactive }"
          @click="isUserInactive && handleInactivityAnswer('ok')"
        >
          <div class="slide-wrapper" ref="slideWrapper" tabindex="-1" :style="{ transform: `scale(${scale})` }">
            <div class="slide-header">
              <h1>{{ currentSlide.title }}</h1>
            </div>
            <div class="slide-content">
              <div class="slide-body-content" v-html="currentSlide.content">
              </div>
            </div>
            <div class="slide-footer">
              <span class="chapter-info">{{ currentChapter?.order + 1 }}. {{ currentChapter?.title }}</span>
              <span class="slide-number">
                <template v-if="activeSlideIndex === -1">Chapô 🏁</template>
                <template v-else>Page {{ activeSlideIndex + 1 }} / {{ currentChapter?.slides?.length }}</template>
              </span>
            </div>
          </div>
        </div>
        <div v-else-if="currentChapter && currentChapter.isLocked" class="waiting-screen">
          <div class="waiting-box glass-crystal">
            <div class="loader-spinner-crystal"></div>
            <h2 class="crystal-title">Chapitre verrouillé</h2>
            <p>Le formateur n'a pas encore ouvert l'accès à ce chapitre.</p>
            <div class="waiting-meta-crystal">
              <span class="badge-crystal">📍 Chapitre : {{ currentChapter.title }}</span>
            </div>
            <div class="waiting-actions-crystal">
              <button @click="leaveSession" class="btn-crystal-secondary">
                🚪 Quitter la salle de cours
              </button>
            </div>
          </div>
        </div>
        <div v-else class="waiting-screen">
          <div class="waiting-box glass-crystal welcome-card">
            <div class="loader-spinner-crystal"></div>
            <h2 class="crystal-title main-welcome">Bienvenue dans votre espace de formation</h2>
            <p class="crystal-subtitle">Veuillez patienter quelques instants, votre formateur va bientôt débloquer la première slide...</p>
            
            <div class="waiting-meta-crystal">
              <div class="meta-item-crystal">
                <span class="icon">📍</span>
                <span class="label">Session :</span>
                <span class="value">{{ route.params.sessionId?.toString().substring(0,8) }}...</span>
              </div>
              <div class="meta-item-crystal">
                <span class="icon">👤</span>
                <span class="value">Connecté en tant que stagiaire</span>
              </div>
            </div>

            <div class="waiting-actions-crystal">
              <button @click="leaveSession" class="btn-crystal-secondary">
                🚪 Quitter la salle de cours
              </button>
            </div>
          </div>
        </div>
        
        <!-- Boutons d'action rapides -->
        <div class="quick-actions-bar">
          <!-- Lever la main -->
          <button 
            @click="toggleHandRaised" 
            class="hand-raise-btn"
            :class="{ 
              'is-active': isHandRaised,
              'is-reaction': handRaiseType === 'reaction'
            }"
            :title="isHandRaised ? 'Baisser la main' : 'Lever la main pour poser une question'"
          >
            <svg v-if="!isHandRaised" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-mini">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path>
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v11"></path>
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" class="svg-icon-mini">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5m-2-1V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v11m-2-4.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8m12-6a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
            {{ isHandRaised ? (handRaiseType === 'reaction' ? 'Réaction' : 'Question') : 'Lever la main' }}
          </button>

          <!-- Indicateur de suivi synchrone -->
          <div 
            @click="!isFollowingTrainer && !showRecallAlert && toggleFollow()" 
            class="sync-toast" 
            :class="{ 
              'is-following': isFollowingTrainer && !showRecallAlert,
              'not-following': !isFollowingTrainer && !showRecallAlert,
              'is-recall': showRecallAlert 
            }"
            :style="{ cursor: isFollowingTrainer && !showRecallAlert ? 'default' : 'pointer' }"
            ref="syncToast"
            tabindex="0"
            @keydown.enter="!isFollowingTrainer && toggleFollow()"
            @keydown.space.prevent="!isFollowingTrainer && toggleFollow()"
          >
            <template v-if="showRecallAlert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-mini">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Le formateur demande votre attention
            </template>
            <template v-else-if="isFollowingTrainer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-mini">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Suivi synchrone activé
            </template>
            <template v-else>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-mini">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Reprendre le direct
            </template>
          </div>
        </div>
      </main>

      <!-- Zone 3 : Prise de note -->
      <aside class="notes-sidebar" :class="{ 'is-hidden': !isNotesVisible }" :style="{ width: isNotesVisible ? notesWidth + 'px' : '0' }">
        <button class="sidebar-toggle-btn right" @click="toggleNotes" :title="isNotesVisible ? 'Fermer le bloc-note' : 'Ouvrir le bloc-note'">
          {{ isNotesVisible ? '▶' : '◀' }}
        </button>
        <div v-if="isNotesVisible" class="resize-handle" @mousedown="startResizing"></div>
        <div class="notes-header">
          <div class="notes-title-group">
            <h3>✍️ Mes notes</h3>
            <span v-if="currentSlide" class="slide-context-title">
              {{ activeSlideIndex === -1 ? 'Présentation' : `Slide ${activeSlideIndex + 1}` }} : {{ currentSlide.title }}
            </span>
          </div>
          <button v-if="activeSlideIndex !== -1" @click="exportNotesMarkdown" class="export-notes-btn" title="Exporter toutes les notes en Markdown">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-tiny">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exporter .md
          </button>
        </div>
        <textarea 
          v-if="activeSlideIndex !== -1"
          v-model="personalNotes" 
          placeholder="Saisissez vos notes pour cette slide..."
          @input="saveNotes"
          class="notes-textarea"
          :disabled="isSaving"
          ref="notesTextarea"
        ></textarea>
        <div v-else class="notes-disabled-msg">
          <p>La prise de notes n'est pas disponible sur la page de présentation du chapitre.</p>
          <p class="small">Ce bloc-note est disponible sur les slides uniquement.</p>
        </div>
      </aside>

      <!-- Modale de levée de main -->
      <HandRaiseModal 
        :show="showHandRaiseModal" 
        @confirm="confirmHandRaise" 
        @cancel="cancelHandRaise"
      />

      <!-- Toast d'Inactivité -->
      <InactivityToast 
        :show="showInactivityToast"
        :is-timeout="isUserInactive"
        :return-time="inactivityReturnTime"
        @answer="handleInactivityAnswer"
        @timeout="handleInactivityTimeout"
      />

      <!-- Overlay de Session Suspendue / Absence Formateur -->
      <div v-if="isPaused || showTrainerAbsentOverlay" class="trainer-absent-overlay">
        <div class="pause-card">
          <div class="pause-icon-container">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <!-- Chronomètre pour suggérer une pause temporelle -->
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h2>Le cours est en pause</h2>
          <div v-if="pauseEndTime" class="pause-resume-time">
            REPRISE À {{ pauseEndTime }}
          </div>
          <p v-if="isPaused">
            Votre formateur a temporairement suspendu la diffusion.<br>
            C'est le moment de faire une pause ! Le cours reprendra dans quelques instants.
          </p>
          <p v-else>Le formateur s'est absenté de la salle. Le cours reprendra dès son retour.</p>
          
          <div class="pause-actions">
            <button @click="leaveSession" class="btn-leave-pause">Quitter la salle</button>
          </div>
        </div>
      </div>

      <!-- Overlay de Session Close / Fin de formation -->
      <div v-if="isSessionClosedByTrainer" class="trainer-absent-overlay">
        <div class="pause-card glass-crystal">
          <div class="pause-icon-container success-border">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>Session terminée</h2>
          <p>Le formateur a clôturé la session de formation. Merci de votre participation !</p>
          
          <div class="pause-actions">
            <button @click="router.push('/login')" class="btn-crystal-primary full-width">Retour à l'accueil</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import HandRaiseModal from '@/components/modals/HandRaiseModal.vue'
import InactivityToast from '@/components/modals/InactivityToast.vue'
import { apiClient } from '@/utils/api'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const chapters = ref<any[]>([])
const activeChapterId = ref<string | null>(null)
const activeSlideIndex = ref(0)
const isPaused = ref(false)
const pauseEndTime = ref<string | null>(null)
const isSessionClosedByTrainer = ref(false)
const showTrainerAbsentOverlay = ref(false)
const allNotes = ref<Record<string, string>>({}) // { "chapterId-slideIdx": "notes content" }
const personalNotes = computed({
  get: () => {
    const key = `${activeChapterId.value}-${activeSlideIndex.value}`
    return allNotes.value[key] || ''
  },
  set: (val: string) => {
    const key = `${activeChapterId.value}-${activeSlideIndex.value}`
    allNotes.value[key] = val
  }
})
const scale = ref(1)
const viewport = ref<HTMLElement | null>(null)
const slideWrapper = ref<HTMLElement | null>(null)
const isFollowingTrainer = ref(true)
const isTypingNotes = ref(false)
const isTabActive = ref(true)
const isWindowFocused = ref(true)
const isSidebarVisible = ref(true)
const isNotesVisible = ref(true)
const notesWidth = ref(320)
const isSaving = ref(false)
const showHandRaiseModal = ref(false)
const handRaiseType = ref<'question' | 'reaction' | null>(null)
const notesTextarea = ref<HTMLTextAreaElement | null>(null)
const showRecallAlert = ref(false)
const isHandRaised = ref(false)
const totalParticipationCount = ref(0)
const totalNotesChars = computed(() => {
  return Object.values(allNotes.value).reduce((acc, note) => acc + (note?.length || 0), 0)
})
let recallTimer: any = null
let noteTypingTimer: any = null

// --- GESTION INACTIVITÉ ---
const showInactivityToast = ref(false)
const isUserInactive = ref(false)
const inactivityReturnTime = ref<string | null>(null)
let inactivityTimer: any = null
let isFirstInactivity = true

const resetInactivityTimer = () => {
  // console.log('[Vigilance] Reset timer triggered')
  
  // SÉCURITÉ PAUSE : On ne déclenche pas de surveillance de vigilance si le cours est en pause
  if (isPaused.value) {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    showInactivityToast.value = false
    isUserInactive.value = false
    return
  }
  
  // On ne réinitialise pas le timer si le toast est actuellement affiché
  // ou si l'utilisateur est déjà en timeout (il doit cliquer sur le toast d'abord)
  if (showInactivityToast.value || isUserInactive.value) return

  // Si l'utilisateur était considéré comme "pas attentif", on logue son retour
  if (isUserInactive.value) {
    inactivityReturnTime.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    isUserInactive.value = false
    
    // Logue le retour et repasse en mode présent (isAttentive: true)
    logActivity('USER_RETURN', { time: inactivityReturnTime.value })
    
    if (provider) {
      provider.awareness.setLocalStateField('isAttentive', true)
      const currentState = provider.awareness.getLocalState()
      if (currentState && currentState.user) {
        provider.awareness.setLocalStateField('user', {
          ...currentState.user,
          isAttentive: true
        })
      }
    }
    
    // On cache le toast après quelques secondes une fois le retour logué
    setTimeout(() => {
      if (!isUserInactive.value) {
        showInactivityToast.value = false
        inactivityReturnTime.value = null
      }
    }, 5000)
  }

  // On cache le toast s'il était juste en attente (avant le timeout de 30s)
  if (showInactivityToast.value && !isUserInactive.value) {
    showInactivityToast.value = false
  }

  clearTimeout(inactivityTimer)
  
  // Calcul du prochain délai d'inactivité
  // La première fois c'est toujours 1 minute
  // Les fois suivantes c'est un délai aléatoire entre 1 et 5 minutes
  let nextDelay = 60000 
  if (!isFirstInactivity) {
    const min = 1 * 60 * 1000 // 1 min
    const max = 5 * 60 * 1000 // 5 min
    nextDelay = Math.floor(Math.random() * (max - min + 1)) + min
  }

  inactivityTimer = setTimeout(() => {
    showInactivityToast.value = true
    isFirstInactivity = false // Les prochaines fois seront aléatoires
    
    // On propage le délai de la prochaine vigilance pour le formateur
    // On calcule déjà le délai suivant ici pour l'afficher
    const min = 1 * 60 * 1000
    const max = 5 * 60 * 1000
    const nextRandom = Math.floor(Math.random() * (max - min + 1)) + min
    const nextVigilanceLabel = `${Math.floor(nextRandom / 60000)} min ${Math.floor((nextRandom % 60000) / 1000)}s`
    
    if (provider) {
      const currentState = provider.awareness.getLocalState()
      if (currentState && currentState.user) {
        provider.awareness.setLocalStateField('user', {
          ...currentState.user,
          nextVigilanceDelay: nextVigilanceLabel
        })
      }
    }
  }, nextDelay)
}

const handleInactivityTimeout = () => {
  isUserInactive.value = true
  logActivity('USER_IDLE_TIMEOUT')
  
  if (provider) {
    provider.awareness.setLocalStateField('isAttentive', false)
    // On met aussi à jour l'objet user s'il existe dans le state local
    const currentState = provider.awareness.getLocalState()
    if (currentState && currentState.user) {
      const newFailedVigilanceCount = (currentState.user.failedVigilanceCount || 0) + 1
      
      provider.awareness.setLocalStateField('user', {
        ...currentState.user,
        isAttentive: false,
        failedVigilanceCount: newFailedVigilanceCount
      })
    }
  }
}

const handleInactivityAnswer = (answer: 'ok' | 'question') => {
  showInactivityToast.value = false
  isUserInactive.value = false
  
  // On force le reset du premier timer pour la prochaine fois
  isFirstInactivity = false

  if (answer === 'question') {
    confirmHandRaise('question')
  } else {
    logActivity('USER_CONFIRM_PRESENCE')
  }

  if (provider) {
    provider.awareness.setLocalStateField('isAttentive', true)
    const currentState = provider.awareness.getLocalState()
    if (currentState && currentState.user) {
      provider.awareness.setLocalStateField('user', {
        ...currentState.user,
        isAttentive: true
      })
    }
  }
  
  resetInactivityTimer()
}
// --------------------------

// Export des notes en Markdown
const exportNotesMarkdown = () => {
  let md = `# Mes Notes de Formation - ${new Date().toLocaleDateString()}\n\n`
  
  chapters.value.forEach(chapter => {
    md += `## Chapitre ${chapter.order} : ${chapter.title}\n\n`
    
    // Note Chapô
    const chapoKey = `${chapter.id}--1`
    if (allNotes.value[chapoKey]) {
      md += `### 🏁 Présentation\n${allNotes.value[chapoKey]}\n\n`
    }
    
    // Notes Slides
    chapter.slides?.forEach((slide: any, idx: number) => {
      const key = `${chapter.id}-${idx}`
      if (allNotes.value[key]) {
        md += `### Slide ${idx + 1} : ${slide.title}\n${allNotes.value[key]}\n\n`
      }
    })
  })

  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notes-formation-${route.params.sessionId}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// Gestion du redimensionnement des notes
const startResizing = (e: MouseEvent) => {
  const startX = e.clientX
  const startWidth = notesWidth.value
  
  const doDrag = (dragEvent: MouseEvent) => {
    const delta = startX - dragEvent.clientX
    const newWidth = startWidth + delta
    if (newWidth > 200 && newWidth < 600) {
      notesWidth.value = newWidth
      setTimeout(updateScale, 10)
    }
  }
  
  const stopDrag = () => {
    document.removeEventListener('mousemove', doDrag)
    document.removeEventListener('mouseup', stopDrag)
  }
  
  document.addEventListener('mousemove', doDrag)
  document.addEventListener('mouseup', stopDrag)
}

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
  setTimeout(updateScale, 300)
}

const toggleNotes = () => {
  isNotesVisible.value = !isNotesVisible.value
  setTimeout(updateScale, 300)
}

const toggleHandRaised = () => {
  if (!isHandRaised.value) {
    showHandRaiseModal.value = true
    return
  }
  
  // Si déjà levée, on la baisse simplement
  isHandRaised.value = false
  handRaiseType.value = null
  
  if (provider) {
    provider.awareness.setLocalStateField('handRaised', false)
    provider.awareness.setLocalStateField('handRaisedAt', null)
    provider.awareness.setLocalStateField('handRaiseType', null)
  }

  logActivity('HAND_DOWN')
}

const confirmHandRaise = (type: 'question' | 'reaction') => {
  showHandRaiseModal.value = false
  isHandRaised.value = true
  handRaiseType.value = type
  totalParticipationCount.value++
  
  // Vibration si réaction
  if (type === 'reaction' && 'vibrate' in navigator) {
    navigator.vibrate([100, 50, 100])
  }
  
  if (provider) {
    provider.awareness.setLocalStateField('handRaised', true)
    provider.awareness.setLocalStateField('handRaisedAt', Date.now())
    provider.awareness.setLocalStateField('handRaiseType', type)

    // Update participation count in awareness user state
    const currentState = provider.awareness.getLocalState()
    if (currentState && currentState.user) {
      provider.awareness.setLocalStateField('user', {
        ...currentState.user,
        participationCount: totalParticipationCount.value
      })
    }
  }

  logActivity('HAND_UP', { interventionType: type })
}

const cancelHandRaise = () => {
  showHandRaiseModal.value = false
}

// Suivi de l'autonomie
watch(isFollowingTrainer, (newVal) => {
  logActivity(newVal ? 'AUTONOMY_END' : 'AUTONOMY_START')
})

// Gestion des logs d'activité
const logActivity = async (type: string, metadata: any = {}) => {
  // console.log(`[logActivity] Attempting to log: ${type}`, metadata) // Commenté pour prod
  try {
    const sessionId = route.params.id || route.params.sessionId || userStore.currentUser?.sessionId
    const traineeId = userStore.currentUser?.id

    if (!sessionId) {
      console.warn('[logActivity] Missing sessionId', route.params)
      return
    }
    if (!traineeId) {
      console.warn('[logActivity] Missing traineeId', userStore.currentUser)
      return
    }

    const payload = {
      type,
      traineeId,
      sessionId,
      metadata: {
        ...metadata,
        chapterId: activeChapterId.value,
        slideIndex: activeSlideIndex.value,
        isFollowingTrainer: isFollowingTrainer.value,
        timestamp: new Date().toISOString()
      }
    }

    console.log('[logActivity] Sending payload:', payload)
    const response = await apiClient.post('/activities', payload)
    console.log('[logActivity] Server response:', response.data)
  } catch (err) {
    console.error(`[logActivity] Failed to log activity ${type}:`, err)
  }
}

// Gestion de la visibilité de l'onglet
const handleVisibilityChange = () => {
  isTabActive.value = document.visibilityState === 'visible'
  logActivity(isTabActive.value ? 'TAB_FOREGROUND' : 'TAB_BACKGROUND')
  
  if (provider) {
    const currentState = provider.awareness.getLocalState()
    if (currentState && currentState.user) {
      let newDistractionCount = currentState.user.distractionCount || 0
      let newTotalDistractionTime = currentState.user.totalDistractionTime || 0
      let newDistractionStartTime = currentState.user.distractionStartTime || null

      if (!isTabActive.value) {
        // Départ : on incrémente le compteur et on note l'heure
        newDistractionCount += 1
        newDistractionStartTime = Date.now()
      } else if (newDistractionStartTime) {
        // Retour : on calcule la durée écoulée
        const duration = Math.floor((Date.now() - newDistractionStartTime) / 1000) // en secondes
        newTotalDistractionTime += duration
        newDistractionStartTime = null
      }

      provider.awareness.setLocalStateField('isVisible', isTabActive.value)
      provider.awareness.setLocalStateField('user', {
        ...currentState.user,
        isVisible: isTabActive.value,
        distractionCount: newDistractionCount,
        distractionStartTime: newDistractionStartTime,
        totalDistractionTime: newTotalDistractionTime
      })
    }
  }
}

// Gestion du focus de la fenêtre (Actif/Passif)
const handleFocus = () => {
  isWindowFocused.value = true
  logActivity('WINDOW_FOCUS')
  
  if (provider) {
    const currentState = provider.awareness.getLocalState()
    if (currentState && currentState.user) {
      let newTotalDistractionTime = currentState.user.totalDistractionTime || 0
      let newDistractionStartTime = currentState.user.distractionStartTime || null

      if (newDistractionStartTime) {
        const duration = Math.floor((Date.now() - newDistractionStartTime) / 1000)
        newTotalDistractionTime += duration
        newDistractionStartTime = null
      }

      provider.awareness.setLocalStateField('isFocused', true)
      provider.awareness.setLocalStateField('user', {
        ...currentState.user,
        isFocused: true,
        distractionStartTime: newDistractionStartTime,
        totalDistractionTime: newTotalDistractionTime
      })
    }
  }
}

const handleBlur = () => {
  isWindowFocused.value = false
  logActivity('WINDOW_BLUR')
  
  if (provider) {
    const currentState = provider.awareness.getLocalState()
    if (currentState && currentState.user) {
      const newDistractionCount = (currentState.user.distractionCount || 0) + 1
      const newDistractionStartTime = Date.now()
      
      provider.awareness.setLocalStateField('isFocused', false)
      provider.awareness.setLocalStateField('user', {
        ...currentState.user,
        isFocused: false,
        distractionCount: newDistractionCount,
        distractionStartTime: newDistractionStartTime
      })
    }
  }
}

// Référence pour le défilement fluide
const sidebarContent = ref<HTMLElement | null>(null)

const currentChapter = computed(() => {
  return chapters.value.find(c => c.id === activeChapterId.value)
})

const currentSlide = computed(() => {
  if (!currentChapter.value) return null
  
  // Si le chapitre entier est verrouillé, on ne peut rien voir
  if (currentChapter.value.isLocked) return null
  
  // Cas de la slide Chapô (Index -1)
  if (activeSlideIndex.value === -1) {
    return {
      title: currentChapter.value.title,
      content: currentChapter.value.description || 'Début du chapitre...',
      isChapo: true
    }
  }

  const slide = currentChapter.value.slides?.[activeSlideIndex.value]
  if (!slide) return null
  
  // Si la slide spécifique est verrouillée, on ne la renvoie pas
  if (slide.isLocked) return null
  
  return slide
})

// Yjs
const ydoc = new Y.Doc()
let provider: any = null

const updateScale = () => {
  if (!viewport.value) return
  const containerWidth = viewport.value.clientWidth - 60
  const containerHeight = viewport.value.clientHeight - 60
  const baseWidth = 1920
  const baseHeight = 1080
  scale.value = Math.min(containerWidth / baseWidth, containerHeight / baseHeight)
}

const loadData = async () => {
  const sessionId = route.params.sessionId
  try {
    const response = await fetch(`/api/chapters?sessionId=${sessionId}`)
    const result = await response.json()
    if (result.success) {
      chapters.value = result.data
    }
  } catch (e) {
    console.error('Failed to load chapters', e)
  }
}

onMounted(async () => {
  const sessionId = route.params.sessionId
  if (!sessionId) {
    router.push('/account')
    return
  }

  window.addEventListener('resize', updateScale)
  window.addEventListener('keydown', (e) => {
    handleKeyDown(e)
    // resetInactivityTimer() // Désactivé : seul le mouvement de souris ou clic relance le timer
  })
  // window.addEventListener('mousemove', resetInactivityTimer) // Désactivé pour éviter les faux positifs lors du survol passif
  window.addEventListener('mousedown', resetInactivityTimer)
  window.addEventListener('touchstart', resetInactivityTimer)
  window.addEventListener('wheel', resetInactivityTimer) // Ajouté : le scroll réinitialise la vigilance
  
  window.addEventListener('focus', handleFocus)
  window.addEventListener('blur', handleBlur)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // LOG ENTRÉE
  setTimeout(() => logActivity('ENTER_ROOM'), 1000)
  
  // Démarrer le premier timer
  resetInactivityTimer()

  provider = new WebrtcProvider(`a11y-session-${sessionId}`, ydoc, {
    signaling: ['wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com']
  })

  const sharedActiveState = ydoc.getMap<any>('active_presentation_state')
  const sharedChapters = ydoc.getMap<boolean>('chapters_lock')

  // Initialisation immédiate de l'état (avant l'observe)
  const initSync = () => {
    const status = sharedActiveState.get('sessionStatus')
    const pausedKey = sharedActiveState.get('isPaused')
    const remotePauseEndTime = sharedActiveState.get('pauseEndTime')
    
    console.log('📍 initSync Attempt - status:', status, 'pausedKey:', pausedKey)
    
    isPaused.value = pausedKey === 'true' || status === 'paused'
    pauseEndTime.value = remotePauseEndTime || null
    
    if (status === 'closed') {
      isSessionClosedByTrainer.value = true
    }
    
    const activeId = sharedActiveState.get('activeChapterId')
    const slideIdx = sharedActiveState.get('activeSlideIndex')
    if (activeId !== undefined && slideIdx !== undefined) {
      activeChapterId.value = activeId
      activeSlideIndex.value = slideIdx
    }
  }
  
  // Boucle de synchronisation forcée pendant les 5 premières secondes
  // car WebrtcProvider est asynchrone pour la réception du premier état
  const syncTimer = setInterval(initSync, 500)
  setTimeout(() => clearInterval(syncTimer), 5000)

  // Écouter les demandes du formateur pour baisser la main
  provider.awareness.on('change', () => {
    const states = provider.awareness.getStates()
    
    // Détection de la présence du formateur
    let trainerFound = false
    states.forEach((state: any) => {
      if (state.user && state.user.role === 'trainer') {
        trainerFound = true
      }

      // Note: On utilise userStore.currentUser.id car user n'existe pas dans le store
      if (state.lowerHandRequest && state.lowerHandRequest.traineeId === userStore.currentUser?.id) {
        // Le formateur a cliqué sur son alerte pour ce stagiaire
        if (isHandRaised.value) {
          isHandRaised.value = false
          if (provider) {
            provider.awareness.setLocalStateField('handRaised', false)
            provider.awareness.setLocalStateField('handRaisedAt', null)
          }
        }
      }
    })
    
    // Si la session est ouverte mais qu'aucun formateur n'est présent (awareness)
    const status = sharedActiveState.get('sessionStatus')
    const pausedKey = sharedActiveState.get('isPaused')
    const isActuallyPaused = pausedKey === 'true' || status === 'paused'
    
    // On n'affiche l'overlay "Absent" QUE si le cours n'est PAS en pause
    // Si c'est en pause, c'est normal que le formateur ne soit pas sur l'onglet actif
    showTrainerAbsentOverlay.value = (status === 'opened' && !isActuallyPaused) && !trainerFound
  })

  sharedActiveState.observe((event) => {
    const status = sharedActiveState.get('sessionStatus')
    const pausedKey = sharedActiveState.get('isPaused')
    const remotePauseEndTime = sharedActiveState.get('pauseEndTime')

    // Debug pour la stabilité
    console.log('🔄 Yjs Observe Event:', { status, pausedKey, remotePauseEndTime })

    // Mise à jour réactive forcée
    isPaused.value = (pausedKey === 'true' || status === 'paused')
    pauseEndTime.value = remotePauseEndTime || null

    // Vérifier si la session est fermée globalement
    if (status === 'closed') {
      isSessionClosedByTrainer.value = true
      return
    } else {
      isSessionClosedByTrainer.value = false
    }

    // Gestion du Rappel (Recall) par le formateur - UNIQUEMENT SI LA CLÉ recallTimestamp A CHANGÉ
    if (event.keysChanged.has('recallTimestamp') || event.keysChanged.has('forceSync')) {
      const recallTs = sharedActiveState.get('recallTimestamp') || sharedActiveState.get('forceSync')
      if (recallTs) {
        const isAutoSync = event.keysChanged.has('forceSync')
        
        // La resync forcée n'a lieu QUE pour un Recall manuel (le bouton)
        // La synchro auto des 30s (forceSync) ne doit pas forcer le Follow Mode
        if (!isAutoSync) {
          if (!isFollowingTrainer.value) {
            showRecallAlert.value = true
            if (recallTimer) clearTimeout(recallTimer)
            recallTimer = setTimeout(() => {
              showRecallAlert.value = false
            }, 2000)
          }
          isFollowingTrainer.value = true
        }
        
        // Synchroniser uniquement les verrous locaux avec Yjs (discret, ne change pas la slide de vue)
        chapters.value.forEach(chap => {
          const remoteLock = sharedChapters.get(chap.id)
          if (remoteLock !== undefined) chap.isLocked = remoteLock
          
          const slideLocks = ydoc.getMap<boolean[]>(`slides_lock_${chap.id}`)
          const locks = slideLocks.get('locks')
          if (locks && chap.slides) {
            locks.forEach((lock, idx) => {
              if (chap.slides[idx]) chap.slides[idx].isLocked = lock
            })
          }
        })
        
        // Reset également le timer d'inactivité pour éviter un faux positif immédiat au reset
        if (!isAutoSync) resetInactivityTimer()
      }
    }

    if (isFollowingTrainer.value) {
      const activeId = sharedActiveState.get('activeChapterId')
      const slideIdx = sharedActiveState.get('activeSlideIndex')
      
      if (activeId) {
        activeChapterId.value = activeId
        
        // Synchroniser le lock des slides du chapitre actif
        const slideLocks = ydoc.getMap<boolean[]>(`slides_lock_${activeId}`)
        const currentLocks = slideLocks.get('locks')
        if (currentLocks) {
          const chapter = chapters.value.find(c => c.id === activeId)
          if (chapter && chapter.slides) {
            chapter.slides.forEach((s: any, idx: number) => {
              s.isLocked = currentLocks[idx] === undefined ? true : currentLocks[idx]
            })
          }
        }
      }
      if (typeof slideIdx === 'number') {
        activeSlideIndex.value = slideIdx
      }
    }
  })

  sharedChapters.observe((event) => {
    event.keysChanged.forEach(key => {
      const isLocked = sharedChapters.get(key)
      const chapter = chapters.value.find(c => c.id === key)
      
      // Update the local chapter/slide lock state
      if (chapter) {
        chapter.isLocked = isLocked
      }

      // Handle Slide Locks separately
      if (key.startsWith('slide_lock_')) {
        const slideId = key.replace('slide_lock_', '')
        chapters.value.forEach(c => {
          const slideIndex = c.slides?.findIndex((s: any) => s.id === slideId)
          if (slideIndex !== -1 && c.slides) {
            c.slides[slideIndex].isLocked = isLocked
            
            // Si la slide actuelle de l'utilisateur vient d'être verrouillée
            if (isLocked && activeChapterId.value === c.id && activeSlideIndex.value === slideIndex) {
              // On force le retour au suivi du formateur (Recall implicite car sa slide est verrouillée)
              isFollowingTrainer.value = true
              
              const sharedActiveStateMap = ydoc.getMap<any>('active_presentation_state')
              const trainerChapterId = sharedActiveStateMap.get('activeChapterId')
              const trainerSlideIndex = sharedActiveStateMap.get('activeSlideIndex')
              if (trainerChapterId && typeof trainerSlideIndex === 'number') {
                activeChapterId.value = trainerChapterId
                activeSlideIndex.value = trainerSlideIndex
                
                const trainerChapter = chapters.value.find(chap => chap.id === trainerChapterId)
                if (trainerChapter && !trainerChapter.isLocked && !trainerChapter.slides?.[trainerSlideIndex]?.isLocked) {
                  activeChapterId.value = trainerChapterId
                  activeSlideIndex.value = trainerSlideIndex
                } else {
                  // Sinon on remonte au niveau du chapitre ou d'une slide ouverte
                  activeSlideIndex.value = -1
                }
              } else {
                // Pas en mode "follow", on remonte simplement au chapô
                activeSlideIndex.value = -1
              }

              setTimeout(updateScale, 50)
              scrollToActive()
            }
          }
        })
      }

      // Si le chapitre actuel de l'utilisateur vient d'être verrouillé
      if (isLocked && !key.startsWith('slide_lock_') && activeChapterId.value === key) {
        // On cherche le premier chapitre déverrouillé disponible
        const firstAvailable = chapters.value.find(c => !c.isLocked)
        if (firstAvailable) {
          activeChapterId.value = firstAvailable.id
          activeSlideIndex.value = -1
          setTimeout(updateScale, 50)
          scrollToActive()
        }
      }

      // Logique existante : Jump automatique si déverrouillage pendant le suivi
      if (!isLocked && isFollowingTrainer.value) {
        const sharedActiveState = ydoc.getMap<any>('active_presentation_state')
        const trainerChapterId = sharedActiveState.get('activeChapterId')
        const trainerSlideIndex = sharedActiveState.get('activeSlideIndex')

        if (key.startsWith('slide_lock_')) {
          const slideId = key.replace('slide_lock_', '')
          const c = chapters.value.find(chap => chap.id === trainerChapterId)
          if (c && c.slides?.[trainerSlideIndex]?.id === slideId) {
            activeChapterId.value = trainerChapterId
            activeSlideIndex.value = trainerSlideIndex
            setTimeout(updateScale, 50)
            scrollToActive()
          }
        } else if (trainerChapterId === key) {
          // Si on déverrouille le chapitre où se trouve le formateur
          // ON NE JUMP QUE SI LE FORMATEUR EST DÉJÀ DANS CE CHAPITRE
          // Cela évite que les chapitres 2+ s'ouvrent sur leur slide 1 
          // avant que le formateur n'y soit officiellement.
          activeChapterId.value = trainerChapterId
          activeSlideIndex.value = trainerSlideIndex ?? -1
          setTimeout(updateScale, 50)
          scrollToActive()
        }
      }
    })
  })

  // Charger toutes les notes sauvegardées (par chapitre-slide)
  const savedAll = localStorage.getItem(`notes-${sessionId}-all`)
  if (savedAll) {
    try {
      allNotes.value = JSON.parse(savedAll)
    } catch (e) {
      console.error('Failed to parse allNotes:', e)
    }
  }

  // Charger les notes depuis la DB pour synchronisation/restauration
  if (userStore.currentUser?.id) {
    try {
      const response = await fetch(`/api/notes?traineeId=${userStore.currentUser.id}&sessionId=${sessionId}`)
      const result = await response.json()
      if (result.success && result.data) {
        result.data.forEach((note: any) => {
          // On retrouve l'index de la slide
          const chapter = chapters.value.find(c => c.id === note.slide.chapterId)
          if (chapter) {
            const slideIdx = chapter.slides.findIndex((s: any) => s.id === note.slideId)
            if (slideIdx !== -1) {
              const key = `${note.slide.chapterId}-${slideIdx}`
              // Priorité à la DB si le local est vide ou différent
              if (!allNotes.value[key] || allNotes.value[key].length < (note.content?.length || 0)) {
                allNotes.value[key] = note.content
              }
            }
          }
        })
      }
    } catch (e) {
      console.error('Failed to load notes from DB:', e)
    }
  }

  window.addEventListener('resize', updateScale)
  window.addEventListener('keydown', handleKeyDown)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  loadData().then(updateScale)
  setTimeout(updateScale, 500)

  // Watcher pour mettre à jour l'awareness (présence formateur)
  watch([isFollowingTrainer, isTypingNotes, isTabActive, isWindowFocused, activeChapterId, activeSlideIndex, totalNotesChars], () => {
    provider.awareness.setLocalStateField('user', {
      id: userStore.currentUser?.id,
      firstname: userStore.currentUser?.firstname,
      lastname: userStore.currentUser?.lastname,
      role: 'trainee',
      isOnline: true,
      isVisible: isTabActive.value,
      isFocused: isWindowFocused.value, // Ajout du focus
      isFollowingTrainer: isFollowingTrainer.value,
      isTypingNotes: isTypingNotes.value,
      currentChapterId: activeChapterId.value,
      currentSlideIndex: activeSlideIndex.value,
      notesCharCount: totalNotesChars.value,
      participationCount: totalParticipationCount.value
    })
  }, { immediate: true })
})

const saveNotes = async () => {
  const sessionId = route.params.sessionId
  localStorage.setItem(`notes-${sessionId}-all`, JSON.stringify(allNotes.value))
  
  // LOG PRISE DE NOTE
  logActivity('NOTE_TYPING')
  
  // Persistence DB
  const currentChapter = chapters.value.find(c => c.id === activeChapterId.value)
  let currentSlideId = ''
  
  if (currentChapter) {
    if (activeSlideIndex.value === -1) {
      // Chapô : On ne persiste pas encore en DB (schéma Slide requis)
    } else {
      currentSlideId = currentChapter.slides?.[activeSlideIndex.value]?.id || ''
    }
  }

  if (userStore.currentUser?.id && currentSlideId) {
    try {
      const key = `${activeChapterId.value}-${activeSlideIndex.value}`
      const content = allNotes.value[key] || ''
      
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('traineeToken')}`
        },
        body: JSON.stringify({
          traineeId: userStore.currentUser.id,
          slideId: currentSlideId,
          content: content
        })
      })
    } catch (e) {
      console.error('Failed to sync note to DB:', e)
    }
  }
  
  // Animation de la LED violette
  isTypingNotes.value = true
  if (noteTypingTimer) clearTimeout(noteTypingTimer)
  noteTypingTimer = setTimeout(() => {
    isTypingNotes.value = false
  }, 1000)
}

const leaveSession = () => {
  if (confirm('Voulez-vous vraiment quitter la salle de cours ?')) {
    router.push('/account')
  }
}

const selectSlide = (chapterId: string, index: number) => {
  const sharedActiveState = ydoc.getMap<any>('active_presentation_state')
  const trainerChapterId = sharedActiveState.get('activeChapterId')
  const trainerSlideIndex = sharedActiveState.get('activeSlideIndex')

  // Si le stagiaire clique sur la slide que le formateur est en train de projeter
  if (chapterId === trainerChapterId && index === trainerSlideIndex) {
    if (!isFollowingTrainer.value) {
      isFollowingTrainer.value = true
      logActivity('AUTONOMY_END')
    }
  } else {
    if (isFollowingTrainer.value) {
      isFollowingTrainer.value = false
      logActivity('AUTONOMY_START')
    }
  }
  
  activeChapterId.value = chapterId
  activeSlideIndex.value = index
  setTimeout(updateScale, 50)
  scrollToActive()
}

const scrollToActive = () => {
  nextTick(() => {
    const activeEl = sidebarContent.value?.querySelector('.slides-list li.active, .slides-list li.active')
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

const isActiveSlide = (chapterId: string, index: number) => {
  return activeChapterId.value === chapterId && activeSlideIndex.value === index
}

const toggleFollow = () => {
  isFollowingTrainer.value = !isFollowingTrainer.value
  
  // LOG TRANSITION AUTONOMIE/SYNCHRO
  logActivity(isFollowingTrainer.value ? 'AUTONOMY_END' : 'AUTONOMY_START')

  if (isFollowingTrainer.value) {
    const sharedActiveState = ydoc.getMap<any>('active_presentation_state')
    const activeId = sharedActiveState.get('activeChapterId')
    const slideIdx = sharedActiveState.get('activeSlideIndex')
    if (activeId) activeChapterId.value = activeId
    if (typeof slideIdx === 'number') activeSlideIndex.value = slideIdx
    scrollToActive()
    
    // Focus sur la slide (wrapper) pour permettre la navigation clavier immédiate
    nextTick(() => {
      slideWrapper.value?.focus()
    })
  }
}

// Watcher pour scroller quand la slide change via Yjs (formateur)
watch([activeChapterId, activeSlideIndex], () => {
  if (isFollowingTrainer.value) {
    scrollToActive()
  }
})

const syncToast = ref<HTMLElement | null>(null)

const handleKeyDown = (e: KeyboardEvent) => {
  const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
  
  // ESC : Revenir au direct / Fermer les modales
  if (e.key === 'Escape') {
    if (showHandRaiseModal.value) {
      showHandRaiseModal.value = false
      return
    }
    if (!isFollowingTrainer.value) {
      e.preventDefault()
      toggleFollow()
    }
  }

  // Utilisation de e.code pour les raccourcis Alt/Option afin d'éviter les problèmes
  // de caractères spéciaux générés sur Mac (ex: '˙' pour Opt+H, 'ò' pour Opt+S, etc.)
  if (e.altKey) {
    // Alt+N : Focus le bloc-note
    if (e.code === 'KeyN') {
      e.preventDefault()
      e.stopPropagation()
      if (!isNotesVisible.value) toggleNotes()
      
      // On attend l'animation de dépliage
      setTimeout(() => {
        notesTextarea.value?.focus()
      }, 400)
      return
    }

    // Alt+H : Focus 'Lever la main'
    if (e.code === 'KeyH') {
      e.preventDefault()
      e.stopPropagation()
      const handBtn = document.querySelector('.hand-raise-btn') as HTMLElement
      if (handBtn) {
        handBtn.focus()
      }
      return
    }

    // Alt+Q : Focus le bouton 'Quitter la salle de cours'
    if (e.code === 'KeyQ') {
      e.preventDefault()
      e.stopPropagation()
      const leaveBtn = document.querySelector('.btn-leave') as HTMLElement
      if (leaveBtn) {
        leaveBtn.focus()
      }
      return
    }

    // Alt+P : Focus la slide active (wrapper)
    if (e.code === 'KeyP') {
      e.preventDefault()
      e.stopPropagation()
      if (slideWrapper.value) {
        slideWrapper.value.tabIndex = -1 // S'assurer qu'il est focusable
        slideWrapper.value.focus()
      }
      return
    }

    // Alt+S : Focus l'élément actif dans la barre latérale des slides
    if (e.code === 'KeyS') {
      e.preventDefault()
      e.stopPropagation()
      if (!isSidebarVisible.value) toggleSidebar()
      
      // Un petit délai pour s'assurer que la sidebar est dépliée si elle était fermée
      setTimeout(() => {
        const activeEl = sidebarContent.value?.querySelector('.slides-list li.active') as HTMLElement
        if (activeEl) {
          activeEl.tabIndex = 0
          activeEl.focus()
        }
      }, isSidebarVisible.value ? 50 : 400)
      return
    }
  }

  // Si on est dans un input (hors raccourcis globaux Alt), on ne traite pas la suite
  if (isInput) return

  // Si le focus est sur un élément de la liste des slides
  const isInSidebar = (e.target as HTMLElement)?.closest('.slides-list')
  if (isInSidebar) {
    // ÉCHAP : Reprendre le direct
    if (e.key === 'Escape') {
      e.preventDefault()
      if (!isFollowingTrainer.value) {
        toggleFollow()
        // Focus le bouton "Reprendre le direct" (sync-toast) pour retour visuel
        nextTick(() => {
          syncToast.value?.focus()
        })
      }
      return
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const listItems = Array.from(sidebarContent.value?.querySelectorAll('.slides-list li:not(.locked)') || []) as HTMLElement[]
      const currentIndex = listItems.indexOf(e.target as HTMLElement)
      
      if (e.key === 'ArrowDown' && currentIndex < listItems.length - 1) {
        listItems[currentIndex + 1].tabIndex = 0
        listItems[currentIndex + 1].focus()
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        listItems[currentIndex - 1].tabIndex = 0
        listItems[currentIndex - 1].focus()
      }
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const target = e.target as HTMLElement
      // On simule le clic pour déclencher selectSlide (qui gère la désynchro)
      target.click()
      
      // Focus le bloc-note après le changement de slide
      nextTick(() => {
        if (!isNotesVisible.value) toggleNotes()
        setTimeout(() => {
          notesTextarea.value?.focus()
        }, 350)
      })
      return
    }
  }

  // Ignorer si on tape dans le bloc-notes
  if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

  // Si on est en "suivi formateur", on ne peut pas naviguer manuellement au clavier
  if (isFollowingTrainer.value) return

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault()
      navigateSlide(1)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault()
      navigateSlide(-1)
      break
    case ' ': // Barre espace pour suivant
      e.preventDefault()
      navigateSlide(1)
      break
  }
}

const navigateSlide = (direction: number) => {
  const currentChapterIdx = chapters.value.findIndex(c => c.id === activeChapterId.value)
  if (currentChapterIdx === -1) return

  const chapter = chapters.value[currentChapterIdx]
  
  if (direction > 0) {
    // Suivant
    if (activeSlideIndex.value < (chapter.slides?.length || 0) - 1) {
      // Prochaine slide si non lockée
      const nextSlide = chapter.slides[activeSlideIndex.value + 1]
      if (nextSlide && !nextSlide.isLocked) {
        selectSlide(chapter.id, activeSlideIndex.value + 1)
      }
    } else {
      // Chapitre suivant
      const nextChapter = chapters.value[currentChapterIdx + 1]
      if (nextChapter && !nextChapter.isLocked) {
        selectSlide(nextChapter.id, -1)
      }
    }
  } else {
    // Précédent
    if (activeSlideIndex.value > -1) {
      // Slide précédente du chapitre actuel
      selectSlide(chapter.id, activeSlideIndex.value - 1)
    } else if (currentChapterIdx > 0) {
      // Dernier slide du chapitre précédent
      const prevChapter = chapters.value[currentChapterIdx - 1]
      if (prevChapter) {
        selectSlide(prevChapter.id, (prevChapter.slides?.length || 0) - 1)
      }
    }
  }
}

onUnmounted(() => {
  // LOG SORTIE (Synchrone car la page va être détruite)
  if (route.params.sessionId && userStore.currentUser?.id) {
    apiClient.post('/activities', {
      type: 'LEAVE_ROOM',
      traineeId: userStore.currentUser.id,
      sessionId: route.params.sessionId,
      metadata: { timestamp: new Date().toISOString() }
    }).catch(() => {})
  }

  window.removeEventListener('resize', updateScale)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('mousemove', resetInactivityTimer)
  window.removeEventListener('mousedown', resetInactivityTimer)
  window.removeEventListener('touchstart', resetInactivityTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  
  clearTimeout(inactivityTimer)
  
  if (provider) provider.destroy()
  ydoc.destroy()
})
</script>

<style scoped>
.session-course-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  color: #f1f5f9;
  overflow: hidden;
}

/* Header ultra fin (environ 40px) */
.session-header {
  height: 48px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo-container {
  height: 32px;
  display: flex;
  align-items: center;
}

.header-logo {
  height: 100%;
  width: auto;
  object-fit: contain;
}

.session-name {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

.btn-leave {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-leave:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.session-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Zone 1 : Menu Slides */
.slides-sidebar {
  width: 280px;
  background: #0f172a;
  border-right: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border 0.3s;
  flex-shrink: 0;
}

.slides-sidebar.is-hidden {
  width: 0;
  border-right-color: transparent;
}

.sidebar-toggle-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  background: #1e293b;
  border: 1px solid #334155;
  color: #94a3b8;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s;
  box-shadow: 4px 0 10px rgba(0,0,0,0.3);
}

.sidebar-toggle-btn:hover {
  background: #334155;
  color: white;
}

.sidebar-toggle-btn.left {
  right: -20px;
  border-radius: 0 8px 8px 0;
  border-left: none;
}

.sidebar-toggle-btn.right {
  left: -20px;
  border-radius: 8px 0 0 8px;
  border-right: none;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  min-width: 280px; /* Évite le tassement durant l'animation */
  transition: opacity 0.2s;
}

.is-hidden .sidebar-content {
  opacity: 0;
  pointer-events: none;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.chapter-group {
  margin-bottom: 1.5rem;
}

.chapter-header {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chapter-header.locked {
  opacity: 0.5;
}

.chapter-header h3 {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  margin: 0;
}

.slides-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.slides-list li {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #94a3b8;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 0.25rem;
  transition: all 0.2s;
}

.slides-list li:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
}

.slides-list li.active {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  font-weight: 500;
  border-left: 3px solid #00d4ff;
}

.slides-list li.locked {
  opacity: 0.5;
  cursor: not-allowed;
  font-style: italic;
}

.slides-list li.locked:hover {
  background: transparent;
  color: #94a3b8;
}

.lock-mini {
  font-size: 0.7rem;
}

/* Zone 2 : Viewport Slide */
.slides-viewport {
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.clickable-overlay {
  cursor: pointer;
  z-index: 10000;
}

.slide-wrapper {
  width: 1920px;
  height: 1080px;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  position: relative;
  transform-origin: center center;
  padding: 80px;
  color: #1e293b;
  outline: none; /* Désactive l'outline par défaut du navigateur */
}

.slide-wrapper:focus {
  outline: 10px solid #ef4444; /* Cadre rouge A11Y */
  outline-offset: -10px; /* À l'intérieur pour ne pas déborder */
}

.slide-header {
  padding: 0;
  margin-bottom: 40px;
  border-bottom: 4px solid #3b82f6;
}

.slide-header h1 {
  font-size: 4rem;
  color: #1e293b;
  margin: 0;
  padding-bottom: 20px;
}

.slide-content {
  flex: 1;
  padding: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.slide-body-content {
  font-size: 2.5rem;
  line-height: 1.4;
  color: #334155;
  text-align: left;
}

.slide-footer {
  position: absolute;
  bottom: 0px;
  left: 0;
  right: 0;
  padding: 40px 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid #e2e8f0;
  color: #64748b;
  font-size: 1.5rem;
}

.sync-toast {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.sync-toast.is-following {
  background: rgba(34, 197, 94, 0.25); /* Crystal Vert */
  color: #bbf7d0;
  border-color: rgba(34, 197, 94, 0.4);
}

.sync-toast.is-following:hover {
  background: rgba(34, 197, 94, 0.35);
}

.sync-toast.not-following {
  background: rgba(245, 158, 11, 0.25); /* Crystal Orange (Amber-500) */
  color: #fef3c7;
  border-color: rgba(245, 158, 11, 0.4);
}

.sync-toast.not-following:hover {
  background: rgba(245, 158, 11, 0.35);
}

.sync-toast.is-recall {
  background: rgba(239, 68, 68, 0.35); /* Crystal Rouge */
  color: #fecaca;
  border-color: rgba(239, 68, 68, 0.5);
  animation: recall-shake 0.3s ease-in-out infinite;
  cursor: default;
}

@keyframes recall-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.svg-icon-mini {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.sync-toast .icon {
  font-size: 1.1rem;
}

/* Waiting Screen Improvements */
.waiting-screen {
  width: 100%;
  height: 100vh; /* Force la hauteur complète du viewport */
  position: fixed; /* Utilisation de fixed pour couvrir tout l'écran indépendamment du parent */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(2, 6, 23, 0.85); /* Plus sombre pour une immersion totale */
  backdrop-filter: blur(20px) saturate(180%); /* Flou plus prononcé */
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  z-index: 2147483647; /* Valeur maximale théorique pour passer au-dessus de TOUT */
}

.waiting-box.glass-crystal {
  max-width: 600px;
  padding: 3.5rem 2.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
  position: relative;
  overflow: hidden;
  animation: crystal-entrance 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.waiting-box.glass-crystal::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 180deg at 50% 50%,
    transparent 0deg,
    rgba(0, 212, 255, 0.05) 120deg,
    transparent 240deg
  );
  animation: rotate-crystal 10s linear infinite;
  pointer-events: none;
}

.crystal-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 2rem 0 1rem;
  background: linear-gradient(135deg, #fff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.crystal-subtitle {
  color: #94a3b8;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.loader-spinner-crystal {
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.05);
  border-top: 3px solid #00d4ff;
  border-right: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 50%;
  margin: 0 auto;
  position: relative;
  animation: spin-crystal 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.1);
}

.loader-spinner-crystal::after {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  border-bottom: 2px solid #00d4ff;
  animation: spin-crystal 3s reverse linear infinite;
}

.waiting-meta-crystal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.meta-item-crystal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748b;
  font-size: 0.95rem;
}

.meta-item-crystal .value {
  color: #cbd5e1;
  font-weight: 500;
}

.badge-crystal {
  display: inline-flex;
  padding: 6px 16px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 100px;
  color: #00d4ff;
  font-weight: 600;
}

.waiting-actions-crystal {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-crystal-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 0.8rem 1.8rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
}

.btn-crystal-secondary:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
  transform: translateY(-2px);
}

@keyframes spin-crystal {
  to { transform: rotate(360deg); }
}

@keyframes rotate-crystal {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes crystal-entrance {
  from { opacity: 0; transform: scale(0.95) translateY(30px); filter: blur(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
}

.sync-toast:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 4px;
  background: rgba(34, 197, 94, 0.4);
}

.sync-toast.not-following:focus-visible {
  background: rgba(245, 158, 11, 0.4);
}

.quick-actions-bar {
  position: absolute;
  top: 1.5rem; /* Retour en haut */
  right: 1.5rem; /* Retour à droite */
  left: auto;
  transform: none;
  display: flex;
  gap: 1rem;
  z-index: 1000;
  padding: 0; /* Suppression du groupage */
  background: transparent;
  backdrop-filter: none;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.hand-raise-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
  padding: 10px 18px;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.hand-raise-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.hand-raise-btn.is-active {
  background: #f59e0b;
  color: #000;
  border-color: #fbbf24;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
}

.hand-raise-btn.is-active.is-reaction {
  background: #a855f7;
  color: #fff;
  border-color: #c084fc;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
}

.hand-raise-btn .hand-icon {
  font-size: 1.1rem;
}

.sync-toast {
  position: relative;
  top: auto;
  right: auto;
}

/* Zone 3 : Notes */

.notes-sidebar {
  background: #0f172a;
  border-left: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border 0.3s;
  flex-shrink: 0;
}

.notes-sidebar.is-hidden {
  border-left-color: transparent;
}

.resize-handle {
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
  background: transparent;
  z-index: 1002;
  transition: background 0.2s;
}

.resize-handle:hover {
  background: #00d4ff;
}

.notes-header {
  padding: 1rem;
  border-bottom: 1px solid #334155;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notes-sidebar.is-hidden .notes-header,
.notes-sidebar.is-hidden textarea {
  opacity: 0;
  pointer-events: none;
}

.notes-header h3 {
  font-size: 1rem;
  margin: 0;
  color: #f1f5f9;
}

.notes-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.slide-context-title {
  font-size: 0.7rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.export-notes-btn {
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.export-notes-btn:hover {
  background: rgba(148, 163, 184, 0.2);
  color: white;
  border-color: rgba(148, 163, 184, 0.4);
}

.svg-icon-tiny {
  width: 14px;
  height: 14px;
}

.notes-disabled-msg {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #94a3b8; /* Corrigé pour le contraste RGAA (au lieu de #64748b) */
  gap: 0.5rem;
}

.notes-disabled-msg p {
  margin: 0;
  font-size: 0.95rem;
}

.notes-disabled-msg .small {
  font-size: 0.85rem;
  color: #94a3b8; /* Suppression de l'opacité pour garantir le contraste */
}

.notes-textarea {
  flex: 1;
  background: transparent;
  border: none;
  padding: 1.5rem;
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: none;
  outline: none;
  min-width: 200px;
  transition: opacity 0.3s;
}

.notes-textarea:disabled {
  opacity: 0.7;
  cursor: wait;
}

.notes-textarea::placeholder {
  color: #94a3b8; /* Contraste amélioré pour RGAA (env 4.5:1 sur fond sombre) */
}

.notes-textarea {
  display: block;
}

/* Modale Absence Formateur / Pause */
.trainer-absent-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 99999; /* Priorité maximale */
  display: flex;
  align-items: center;
  justify-content: center;
}

.pause-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: clamp(1.5rem, 5vw, 3rem);
  max-width: 450px;
  width: 95%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.4s ease-out;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 100000;
}

.pause-icon-container {
  width: clamp(60px, 12vw, 100px);
  height: clamp(60px, 12vw, 100px);
  background: rgba(99, 102, 241, 0.1);
  border: 4px solid rgba(99, 102, 241, 0.3);
  color: #6366f1;
  border-radius: 50%;
  margin: 0 auto clamp(1.5rem, 4vw, 2.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
}

.pause-icon-container::after {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  border: 2px solid rgba(99, 102, 241, 0.1);
  animation: pulse-ring 2s infinite ease-in-out;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 0.4; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.pause-icon-container svg {
  width: 50%;
  height: 50%;
}

.pause-card h2 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: clamp(1.4rem, 4vw, 1.8rem);
}

.pause-resume-time {
  font-family: 'Space Mono', monospace, sans-serif;
  color: #6366f1;
  font-weight: 700;
  font-size: clamp(1.1rem, 3.5vw, 1.5rem);
  margin: 1.5rem 0;
  padding: 0.6rem 1.2rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 99px;
  display: inline-block;
}

.pause-card p {
  color: #94a3b8;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  line-height: 1.6;
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
}

.pause-actions {
  display: flex;
  justify-content: center;
}

.btn-crystal-primary {
  padding: 0.8rem 1.8rem;
  background: rgba(0, 212, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  color: #00d4ff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.btn-crystal-primary:hover {
  background: #00d4ff;
  color: #020617;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
  transform: translateY(-2px);
}

.btn-leave-pause {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-leave-pause:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
