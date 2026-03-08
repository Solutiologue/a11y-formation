<!-- src/components/organisms/UserForm.vue -->
<template>
  <form class="user-form" @submit.prevent="handleSubmit" novalidate>
    <h2 id="form-title">{{ title }}</h2>

    <InputGroup
      v-model="form.email"
      type="email"
      label="Email"
      placeholder="user@example.com"
      required
      :error="errors.email"
    />

    <InputGroup
      v-model="form.name"
      label="Name"
      placeholder="John Doe"
      required
      :error="errors.name"
    />

    <div class="form-actions">
      <Button variant="primary" type="submit">
        {{ submitLabel }}
      </Button>
      <Button variant="secondary" type="button" @click="$emit('cancel')">
        {{ cancelLabel }}
      </Button>
    </div>

    <div v-if="successMessage" class="success-message" role="status">
      {{ successMessage }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import Button from '@/components/atoms/Button.vue'
import InputGroup from '@/components/molecules/InputGroup.vue'

interface Props {
  title?: string
  submitLabel?: string
  cancelLabel?: string
}

withDefaults(defineProps<Props>(), {
  title: 'User Form',
  submitLabel: 'Submit',
  cancelLabel: 'Cancel',
})

const emit = defineEmits<{
  submit: [data: { email: string; name: string }]
  cancel: []
}>()

const form = reactive({
  email: '',
  name: '',
})

const errors = reactive({
  email: '',
  name: '',
})

const successMessage = ref('')

const validateForm = () => {
  errors.email = form.email ? '' : 'Email is required'
  errors.name = form.name ? '' : 'Name is required'
  return !errors.email && !errors.name
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', { email: form.email, name: form.name })
    form.email = ''
    form.name = ''
    successMessage.value = 'Form submitted successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}
</script>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  max-width: 500px;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.success-message {
  padding: 1rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 0.25rem;
  color: #155724;
}
</style>
