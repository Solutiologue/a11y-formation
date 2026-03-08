<template>
  <Transition name="toast">
    <div v-if="show" class="inactivity-toast" role="alert" aria-live="assertive">
      <div class="toast-content">
        <div class="toast-header">
          <span class="timer-icon">⏳</span>
          <span class="timer-text">{{ timeLeft }}s</span>
        </div>
        <p class="toast-question">Tout est clair pour vous ?</p>
        <div class="toast-actions">
          <button @click="$emit('answer', 'ok')" class="btn-ok">Oui, tout va bien</button>
          <button @click="$emit('answer', 'question')" class="btn-question">Non, j'ai une question</button>
        </div>
      </div>
      <div v-if="isTimeout" class="timeout-overlay">
        <span class="status-badge">Restez attentif</span>
        <p class="return-info">Cliquez sur la slide pour fermer cet avertissement</p>
        <p v-if="returnTime" class="return-log">Retour à {{ returnTime }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  show: boolean
  isTimeout: boolean
  returnTime: string | null
}>()

const emit = defineEmits(['answer', 'timeout'])

const timeLeft = ref(30)
let timer: any = null

const startTimer = () => {
  timeLeft.value = 30
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer)
      emit('timeout')
    }
  }, 1000)
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    startTimer()
  } else {
    clearInterval(timer)
  }
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.inactivity-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 300px;
  background: #1e293b;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  color: white;
  overflow: hidden;
}

.toast-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.timer-icon {
  font-size: 1.2rem;
}

.timer-text {
  font-family: monospace;
  font-weight: bold;
  color: #3b82f6;
  font-size: 1.1rem;
}

.toast-question {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.toast-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

button {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ok {
  background: #3b82f6;
  color: white;
}

.btn-ok:hover {
  background: #2563eb;
}

.btn-question {
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
}

.btn-question:hover {
  background: #475569;
  color: white;
}

.timeout-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  backdrop-filter: blur(4px);
}

.status-badge {
  background: #ef4444;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 12px;
}

.return-info {
  font-size: 0.9rem;
  color: #94a3b8;
}

.return-log {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #10b981;
  font-weight: bold;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}
</style>
