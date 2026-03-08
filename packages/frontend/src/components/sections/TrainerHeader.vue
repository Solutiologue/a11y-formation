<!-- src/components/sections/TrainerHeader.vue -->
<template>
  <header class="navbar" role="banner">
    <router-link to="/trainer" class="navbar-brand">
      <img src="/logo-header.png" alt="Logo A11y Formation" class="logo">
    </router-link>
    <nav>
      <ul>
        <li><router-link to="/trainer">Mon Dashboard</router-link></li>
        <li>
          <button @click="handleLogout" class="logout-btn">Déconnexion</button>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTrainerStore } from '@/stores/trainerStore'

const router = useRouter()
const trainerStore = useTrainerStore()

const handleLogout = () => {
  trainerStore.logout()
  router.push('/trainer')
}
</script>

<style scoped>
.navbar {
  background-color: #1a1a2e;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.navbar-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo {
  height: 45px;
  width: auto;
}

nav ul {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
  align-items: center;
}

nav a {
  color: #e0e0e0;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

nav a:hover {
  color: #00d4ff;
}

nav a:focus-visible {
  outline: 3px solid #e11d48 !important;
  outline-offset: 4px;
}

nav a.router-link-active {
  color: #00d4ff;
}

.logout-btn {
  background: none;
  border: none;
  color: #e0e0e0;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s;
}

.logout-btn:hover {
  color: #00d4ff;
}

.logout-btn:focus-visible {
  outline: 3px solid #e11d48 !important;
  outline-offset: 4px;
}
</style>
