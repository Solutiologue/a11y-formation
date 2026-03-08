<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')" role="dialog" aria-labelledby="shortcuts-title" aria-modal="true">
    <div class="modal-content" ref="modalContent">
      <div class="modal-header">
        <span class="modal-icon" aria-hidden="true">⌨️</span>
        <h3 id="shortcuts-title">Raccourcis de navigation au clavier</h3>
        <button ref="closeBtn" class="close-btn" @click="$emit('close')" aria-label="Fermer la fenêtre">×</button>
      </div>
      
      <div class="modal-body">
        <div v-if="role === 'trainer'" class="shortcut-section">
          <h4>Espace Formateur</h4>
          <ul class="shortcut-list">
            <li>
              <span class="key-combo"><kbd>{{ altKeyLabel }}</kbd> + <kbd>S</kbd></span>
              <span class="shortcut-desc">Démarrer/Arrêter la session</span>
            </li>
            <li>
              <span class="key-combo"><kbd>{{ altKeyLabel }}</kbd> + <kbd>P</kbd></span>
              <span class="shortcut-desc">Lancer la projection</span>
            </li>
            <li>
              <span class="key-combo"><kbd>{{ altKeyLabel }}</kbd> + <kbd>A</kbd></span>
              <span class="shortcut-desc">Passer à l'activité suivante</span>
            </li>
            <li>
              <span class="key-combo"><kbd>{{ altKeyLabel }}</kbd> + <kbd>R</kbd></span>
              <span class="shortcut-desc">Réinitialiser l'activité</span>
            </li>
          </ul>
        </div>

        <div v-else class="shortcut-section">
          <h4>Espace Stagiaire</h4>
          <ul class="shortcut-list">
            <li>
              <span class="key-combo"><kbd>{{ altKeyLabel }}</kbd> + <kbd>S</kbd></span>
              <span class="shortcut-desc">Aller à la liste des slides</span>
            </li>
            <li>
              <span class="key-combo"><kbd>{{ altKeyLabel }}</kbd> + <kbd>P</kbd></span>
              <span class="shortcut-desc">Aller au contenu (Slide active)</span>
            </li>
            <li>
              <span class="key-combo"><kbd>{{ altKeyLabel }}</kbd> + <kbd>N</kbd></span>
              <span class="shortcut-desc">Prendre une note / Bloc-note</span>
            </li>
            <li>
              <span class="key-combo"><kbd>{{ altKeyLabel }}</kbd> + <kbd>H</kbd></span>
              <span class="shortcut-desc">Bouton "Lever la main"</span>
            </li>
            <li>
              <span class="key-combo"><kbd>{{ altKeyLabel }}</kbd> + <kbd>Q</kbd></span>
              <span class="shortcut-desc">Bouton "Quitter la salle"</span>
            </li>
          </ul>
        </div>

        <div class="shortcut-section">
          <h4>Navigation Générale</h4>
          <ul class="shortcut-list">
            <li>
              <span class="key-combo"><kbd>{{ altKeyLabel }}</kbd></span>
              <span class="shortcut-desc">Afficher cette aide (maintenir)</span>
            </li>
            <li>
              <span class="key-combo"><kbd>Tab</kbd></span>
              <span class="shortcut-desc">Naviguer entre les éléments</span>
            </li>
            <li>
              <span class="key-combo"><kbd>Entrée</kbd></span>
              <span class="shortcut-desc">Activer l'élément sélectionné</span>
            </li>
            <li>
              <span class="key-combo"><kbd>Esc</kbd></span>
              <span class="shortcut-desc">Fermer la fenêtre active</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  show: boolean
  role: 'trainer' | 'student'
}>()

const emit = defineEmits(['close'])

const modalContent = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)

const isMac = computed(() => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0
})

const altKeyLabel = computed(() => isMac.value ? 'Option ⌥' : 'Alt')

// Focus trap logic
const handleTab = (e: KeyboardEvent) => {
  if (!modalContent.value) return
  
  const focusableElements = modalContent.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
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
    emit('close')
  }
}

watch(() => props.show, (isShown) => {
  if (isShown) {
    // Save current focus
    const lastFocus = document.activeElement as HTMLElement
    
    // Disable scroll on body
    document.body.style.overflow = 'hidden'
    
    // Focus close button or first element in next tick
    setTimeout(() => {
      closeBtn.value?.focus()
    }, 50)

    onUnmounted(() => {
      document.body.style.overflow = ''
      lastFocus?.focus()
    })
  } else {
    document.body.style.overflow = ''
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
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: #1e293b;
  border: 2px solid #3b82f6;
  border-radius: 16px;
  width: 95%;
  max-width: 900px;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  color: #f1f5f9;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2rem;
  position: relative;
}

.modal-icon {
  font-size: 2rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

.close-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #334155;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #ef4444;
  color: white;
}

.shortcut-section {
  margin-bottom: 2rem;
}

.shortcut-section h4 {
  margin-bottom: 1rem;
  color: #94a3b8;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #334155;
  padding-bottom: 0.5rem;
}

.shortcut-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.shortcut-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.key-combo {
  display: flex;
  gap: 4px;
  align-items: center;
}

kbd {
  background: #334155;
  border: 1px solid #475569;
  border-radius: 4px;
  padding: 2px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  color: #f8fafc;
  box-shadow: 0 2px 0 #0f172a;
}

.shortcut-desc {
  font-size: 0.95rem;
  color: #cbd5e1;
}

.modal-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.close-footer-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.close-footer-btn:hover {
  background: #2563eb;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
