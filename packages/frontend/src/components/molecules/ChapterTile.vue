<template>
  <div 
    class="chapter-tile" 
    :class="{ 'locked': chapter.isLocked, 'clickable': !chapter.isLocked }"
    @click="!chapter.isLocked && onClick()"
  >
    <div class="chapter-content">
      <h3 class="chapter-title">{{ chapter.title }}</h3>
      <p v-if="chapter.description" class="chapter-description">
        {{ chapter.description }}
      </p>
    </div>
    
    <!-- Cadenas overlay si verrouillé -->
    <div v-if="chapter.isLocked" class="lock-overlay" aria-label="Chapitre verrouillé">
      <span class="lock-icon">🔒</span>
    </div>

    <!-- Indicateur d'activité (Oeil corné) -->
    <div v-if="isActive" class="active-indicator" title="Chapitre en cours de présentation">
      <svg viewBox="0 0 24 24" class="eye-icon">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Chapter {
  id: string
  title: string
  description?: string | null
  isLocked: boolean
  order: number
}

const props = defineProps<{
  chapter: Chapter,
  isActive?: boolean
}>()

const emit = defineEmits<{
  navigate: [id: string]
}>()

const onClick = () => {
  emit('navigate', props.chapter.id)
}
</script>

<style scoped>
.chapter-tile {
  position: relative;
  padding: 1.5rem;
  border: 2px solid #0891b2;
  border-radius: 8px;
  background: rgba(6, 182, 212, 0.05);
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chapter-tile.clickable {
  cursor: pointer;
}

.chapter-tile.clickable:hover {
  background: rgba(6, 182, 212, 0.15);
  border-color: #06b6d4;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
  transform: translateY(-2px);
}

.chapter-tile.locked {
  opacity: 0.7;
  border-color: #64748b;
  background: rgba(100, 116, 139, 0.05);
}

.chapter-content {
  z-index: 1;
  pointer-events: none;
}

.chapter-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #06b6d4;
  margin: 0 0 0.5rem 0;
  text-align: left;
}

.chapter-description {
  font-size: 0.9rem;
  color: #cbd5e1;
  margin: 0;
  text-align: left;
  line-height: 1.4;
}

/* Overlay cadenas */
.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  z-index: 10;
}

.lock-icon {
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Coin corné avec oeil */
.active-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 40px;
  height: 40px;
  background: #06b6d4;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
  border-top-right-radius: 8px;
  z-index: 5;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px;
}

.eye-icon {
  width: 18px;
  height: 18px;
  fill: #0f172a;
}

/* Responsive */
@media (max-width: 768px) {
  .chapter-tile {
    padding: 1rem;
    min-height: 100px;
  }

  .chapter-title {
    font-size: 1rem;
  }

  .chapter-description {
    font-size: 0.85rem;
  }

  .lock-icon {
    font-size: 2rem;
  }
}
</style>
