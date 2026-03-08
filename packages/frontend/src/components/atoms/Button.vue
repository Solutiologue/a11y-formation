<!-- src/components/atoms/Button.vue -->
<template>
  <button
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--disabled': disabled },
    ]"
    :disabled="disabled"
    :type="type"
    @click="() => { if (!disabled) $emit('click') }"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
})

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn--primary {
  background-color: #007bff;
  color: white;
}

.btn--primary:hover:not(.btn--disabled) {
  background-color: #0056b3;
}

.btn--secondary {
  background-color: #6c757d;
  color: white;
}

.btn--secondary:hover:not(.btn--disabled) {
  background-color: #545b62;
}

.btn--danger {
  background-color: #dc3545;
  color: white;
}

.btn--danger:hover:not(.btn--disabled) {
  background-color: #bb2d3b;
}

.btn--sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn--lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
