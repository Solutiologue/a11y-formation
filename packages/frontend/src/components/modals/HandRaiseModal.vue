<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')" role="dialog" aria-labelledby="handraise-title" aria-modal="true">
    <div class="modal-content" ref="modalContent">
      <div class="modal-header">
        <span class="modal-icon" aria-hidden="true">✋</span>
        <h3 id="handraise-title">Souhaitez-vous demander la parole ?</h3>
      </div>
      
      <div class="modal-body">
        <p>Choisissez l'objet de votre intervention pour informer le formateur.</p>
        <div class="action-buttons">
          <button ref="firstBtn" @click="$emit('confirm', 'question')" class="action-btn question">
            <span class="btn-icon">❓</span>
            <div class="btn-text">
              <span class="btn-title">J'ai une question</span>
              <span class="btn-desc">Clarifier un point du cours <kbd class="mini-kbd">Alt</kbd>+<kbd class="mini-kbd">Q</kbd></span>
            </div>
          </button>
          
          <button @click="$emit('confirm', 'reaction')" class="action-btn reaction">
            <span class="btn-icon">💬</span>
            <div class="btn-text">
              <span class="btn-title">Je souhaite réagir</span>
              <span class="btn-desc">Partager un avis ou une expérience <kbd class="mini-kbd">Alt</kbd>+<kbd class="mini-kbd">R</kbd></span>
            </div>
          </button>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('cancel')" class="cancel-btn">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['confirm', 'cancel'])

const modalContent = ref<HTMLElement | null>(null)
const firstBtn = ref<HTMLButtonElement | null>(null)

// Focus trap logic
const handleTab = (e: KeyboardEvent) => {
  if (!modalContent.value) return
  
  const focusableElements = Array.from(modalContent.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ))
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (e.shiftKey) { // Shift + Tab
    if (document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    }
  } else { // Tab
    if (document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.show) return
  
  if (e.key === 'Tab') {
    handleTab(e)
  }
  
  if (e.key === 'Escape') {
    emit('cancel')
  }
}

let lastFocus: HTMLElement | null = null

watch(() => props.show, (isShown) => {
  if (isShown) {
    lastFocus = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    
    setTimeout(() => {
      firstBtn.value?.focus()
    }, 50)
  } else {
    document.body.style.overflow = ''
    lastFocus?.focus()
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.modal-icon {
  font-size: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #f1f5f9;
  font-size: 1.25rem;
}

.modal-body p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #f1f5f9;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.btn-icon {
  font-size: 1.5rem;
}

.btn-text {
  display: flex;
  flex-direction: column;
}

.btn-title {
  font-weight: 600;
  font-size: 1rem;
}

.btn-desc {
  font-size: 0.8rem;
  color: #94a3b8;
}

.mini-kbd {
  background: #334155;
  border: 1px solid #475569;
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 0.75rem;
  font-family: inherit;
  color: #f1f5f9;
  margin-left: 4px;
  box-shadow: 0 1px 0 #0f172a;
}

.action-btn:hover {
  border-color: #38bdf8;
  background: #1e293b;
  transform: translateY(-2px);
}

.action-btn.reaction:hover {
  border-color: #a855f7;
}

.modal-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
