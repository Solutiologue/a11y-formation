<!-- src/components/atoms/Input.vue -->
<template>
  <div class="input-wrapper">
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
      <span v-if="required" aria-label="required">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-label="label"
      :aria-describedby="ariaDescribedby"
      :aria-required="ariaRequired"
      class="input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  id?: string
  ariaDescribedby?: string
  ariaRequired?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  ariaDescribedby: undefined,
  ariaRequired: undefined,
})

const id = computed(() => props.id || `input-${Math.random()}`)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-weight: 500;
  font-size: 0.875rem;
}

.input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  font-size: 1rem;
}

.input:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}
</style>
