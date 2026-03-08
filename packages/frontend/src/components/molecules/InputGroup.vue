<!-- src/components/molecules/InputGroup.vue -->
<template>
  <div class="input-group">
    <Input
      :id="id"
      :model-value="modelValue"
      :type="type"
      :label="label"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-describedby="error ? errorId : undefined"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <span v-if="error" :id="errorId" class="error-message" role="alert">
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import Input from '@/components/atoms/Input.vue'
import { computed } from 'vue'

interface Props {
  modelValue: string
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const id = computed(() => props.id || `input-group-${Math.random()}`)
const errorId = computed(() => `${id.value}-error`)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
}
</style>
