<!-- src/pages/UsersPage.vue -->
<template>
  <div class="users-page">
    <h1>Users Management</h1>

    <div class="users-container">
      <div class="users-form">
        <UserForm @submit="handleAddUser" />
      </div>

      <div class="users-list">
        <h2>Users List</h2>
        <button @click="loadUsers" class="refresh-btn">Refresh</button>

        <div v-if="userStore.loading" class="loading">Loading...</div>
        <div v-else-if="userStore.users.length === 0" class="empty-state">
          No users yet. Add one using the form!
        </div>
        <ul v-else class="user-items">
          <li v-for="user in userStore.users" :key="user.id" class="user-item">
            <div class="user-info">
              <strong>{{ user.name }}</strong>
              <span>{{ user.email }}</span>
            </div>
            <span class="user-date">{{ formatDate(user.createdAt) }}</span>
          </li>
        </ul>

        <div v-if="userStore.error" class="error-message" role="alert">
          {{ userStore.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import UserForm from '@/components/organisms/UserForm.vue'
import { useUserStore } from '@/stores/userStore'

interface UserData {
  email: string
  name: string
}

const userStore = useUserStore()

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  await userStore.fetchUsers()
}

const handleAddUser = async (data: UserData) => {
  await userStore.addUser(data.email, data.name)
  await loadUsers()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US')
}
</script>

<style scoped>
.users-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.users-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.users-form,
.users-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  width: fit-content;
}

.refresh-btn:hover {
  background-color: #0056b3;
}

.loading,
.empty-state {
  padding: 1rem;
  text-align: center;
  color: #666;
}

.user-items {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-item {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-date {
  font-size: 0.875rem;
  color: #666;
}

.error-message {
  padding: 1rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 0.25rem;
  color: #721c24;
}

@media (max-width: 768px) {
  .users-container {
    grid-template-columns: 1fr;
  }
}
</style>
