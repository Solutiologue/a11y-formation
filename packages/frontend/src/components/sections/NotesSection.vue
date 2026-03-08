<template>
  <div class="content-section">
    <div v-if="loading" class="loading-state">
      <div class="loader-spinner"></div>
      <p>Chargement de vos notes...</p>
    </div>

    <div v-else-if="Object.keys(groupedNotes).length === 0" class="notes-empty">
      <div class="empty-icon">📝</div>
      <p>Vous n'avez pas encore pris de notes.</p>
      <p class="text-muted">Vos notes apparaîtront ici automatiquement dès que vous commencerez à écrire dans le bloc-note d'une session.</p>
    </div>

    <div v-else class="sessions-list">
      <div v-for="(session, sessionId) in groupedNotes" :key="sessionId" class="session-group">
        <div class="session-banner" @click="toggleSession(sessionId)">
          <div class="session-info-group">
            <span class="session-icon">📁</span>
            <div class="session-info">
              <h3>Session {{ session.code || sessionId.substring(0, 8) }}</h3>
              <span class="session-date">Débutée le {{ session.date }}</span>
            </div>
          </div>
          <span class="toggle-icon">{{ expandedSessions.has(sessionId) ? '▼' : '▶' }}</span>
        </div>

        <div v-if="expandedSessions.has(sessionId)" class="chapters-container">
          <div v-for="chapter in session.chapters" :key="chapter.id" class="chapter-block">
            <div class="chapter-title">
              <span class="order">{{ chapter.order + 1 }}.</span>
              <h4>{{ chapter.title }}</h4>
            </div>

            <div class="slides-notes">
              <div v-for="note in chapter.notes" :key="note.id" class="slide-note-card">
                <div class="slide-info">
                  <span class="slide-label">Slide {{ note.slide.order + 1 }}</span>
                  <span class="slide-name">{{ note.slide.title }}</span>
                </div>
                <div class="note-body" v-html="formatNote(note.content)"></div>
                <div class="note-footer">
                  Dernière modification le {{ new Date(note.updatedAt).toLocaleDateString() }} à {{ new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const loading = ref(true)
const rawNotes = ref<any[]>([])
const expandedSessions = ref<Set<string>>(new Set())

const groupedNotes = computed(() => {
  const groups: Record<string, any> = {}
  
  rawNotes.value.forEach(note => {
    const slide = note.slide
    const chapter = slide.chapter
    const session = chapter.session
    
    if (!groups[session.id]) {
      groups[session.id] = {
        code: session.code,
        date: new Date(session.createdAt).toLocaleDateString(),
        chapters: {}
      }
    }
    
    if (!groups[session.id].chapters[chapter.id]) {
      groups[session.id].chapters[chapter.id] = {
        id: chapter.id,
        title: chapter.title,
        order: chapter.order,
        notes: []
      }
    }
    
    groups[session.id].chapters[chapter.id].notes.push(note)
  })

  // Convert chapters object to sorted array
  Object.values(groups).forEach((session: any) => {
    session.chapters = Object.values(session.chapters).sort((a: any, b: any) => a.order - b.order)
    session.chapters.forEach((chapter: any) => {
      chapter.notes.sort((a: any, b: any) => a.slide.order - b.slide.order)
    })
  })
  
  return groups
})

const fetchNotes = async () => {
  if (!userStore.currentUser?.id) return
  
  try {
    loading.value = true
    const response = await fetch(`/api/notes?traineeId=${userStore.currentUser.id}`)
    const result = await response.json()
    if (result.success) {
      rawNotes.value = result.data
      
      if (rawNotes.value.length > 0) {
        // Expand the most recent session
        const latestSessionId = rawNotes.value
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
          .slide.chapter.sessionId
        expandedSessions.value.add(latestSessionId)
      }
    }
  } catch (e) {
    console.error('Failed to fetch account notes:', e)
  } finally {
    loading.value = false
  }
}

const toggleSession = (id: string) => {
  if (expandedSessions.value.has(id)) {
    expandedSessions.value.delete(id)
  } else {
    expandedSessions.value.add(id)
  }
}

const formatNote = (content: string) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

onMounted(fetchNotes)
</script>

<style scoped>
.content-section {
  animation: fadeIn 0.3s ease;
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #94a3b8;
}

.loader-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 212, 255, 0.1);
  border-radius: 50%;
  border-top-color: #00d4ff;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.notes-empty {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 12px;
  border: 1px dashed #334155;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.text-muted {
  color: #64748b !important;
  font-size: 0.9rem !important;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.session-group {
  background: rgba(30, 41, 59, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.session-banner {
  padding: 1.25rem 1.5rem;
  background: rgba(30, 41, 59, 0.6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
}

.session-banner:hover {
  background: rgba(51, 65, 85, 0.6);
}

.session-info-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.session-icon {
  font-size: 1.4rem;
}

.session-info h3 {
  font-size: 1.1rem;
  margin: 0;
  color: #f1f5f9;
}

.session-date {
  font-size: 0.8rem;
  color: #64748b;
}

.chapters-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.chapter-block {
  border-left: 2px solid #334155;
  padding-left: 1.5rem;
}

.chapter-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.chapter-title h4 {
  margin: 0;
  color: #00d4ff;
  font-size: 1.05rem;
}

.chapter-title .order {
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
}

.slides-notes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.slide-note-card {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.slide-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
}

.slide-label {
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.slide-name {
  color: #e2e8f0;
}

.note-body {
  color: #cbd5e1;
  font-size: 0.95rem;
  line-height: 1.6;
}

.note-footer {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #475569;
  font-style: italic;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
