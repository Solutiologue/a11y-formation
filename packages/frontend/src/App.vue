<!-- src/App.vue -->
<template>
  <div id="app">
    <nav class="skip-links" aria-label="Liens d'accès rapide">
      <span class="skip-links-title">Accès rapides :</span>
      <a href="#main-content" class="skip-link">Contenu principal</a>
      <a href="#footer" class="skip-link">Pied de page</a>
    </nav>

    <!-- Header principal (public) -->
    <header v-if="!isTrainerRoute && !isAnimationPage" class="navbar" role="banner">
      <router-link to="/" class="navbar-brand">
        <img src="/logo-header.png" alt="Logo A11y Formation" class="logo">
      </router-link>
      <nav>
        <ul>
          <template v-if="userStore.isAuthenticated">
            <li><router-link to="/account">Mon compte</router-link></li>
            <li><a href="#" @click.prevent="handleLogout">Me déconnecter</a></li>
          </template>
          <template v-else>
            <li><router-link to="/">Accueil</router-link></li>
            <li><router-link to="/login">S'identifier</router-link></li>
            <li><router-link to="/tools">Liens Utiles</router-link></li>
          </template>
        </ul>
      </nav>
    </header>

    <!-- Header trainer -->
    <trainer-header v-else-if="isTrainerRoute && trainerStore.isAuthenticated && !isAnimationPage" />
    
    <!-- Header trainer - non authentifié (logo uniquement) -->
    <header v-else-if="isTrainerRoute && !isAnimationPage" class="navbar" role="banner">
      <router-link to="/trainer" class="navbar-brand">
        <img src="/logo-header.png" alt="Logo A11y Formation" class="logo">
      </router-link>
    </header>

    <main id="main-content" role="main" tabindex="-1">
      <router-view />
    </main>

    <!-- Modal des raccourcis clavier -->
    <shortcuts-modal 
      :show="showShortcuts" 
      :role="userRole" 
      @close="showShortcuts = false" 
    />

    <footer id="footer" class="footer" role="contentinfo" v-if="!isAnimationPage">
      <div class="footer-content">
        <p>&copy; 2026 <img src="/logo-header.png" alt="A11y Formation" class="logo-footer"> Tous droits réservés.</p>
        <div class="footer-links">
          <a href="#">Accessibilité</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useTrainerStore } from '@/stores/trainerStore'
import TrainerHeader from '@/components/sections/TrainerHeader.vue'
import ShortcutsModal from '@/components/modals/ShortcutsModal.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const trainerStore = useTrainerStore()

const showShortcuts = ref(false)

const userRole = computed(() => {
  return isTrainerRoute.value ? 'trainer' : 'student'
})

const handleGlobalKeydown = (event: KeyboardEvent) => {
  // Détecter si on est sur Mac
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  // Si Alt (Option sur Mac) est pressé seul
  if (event.key === 'Alt') {
    showShortcuts.value = true
    return
  }

  // Si une autre touche est pressée pendant que Alt/Option est enfoncé
  if (event.altKey && event.key !== 'Alt') {
    showShortcuts.value = false
  }
}

const handleGlobalKeyup = (event: KeyboardEvent) => {
  // Sur Mac, le relâchement de Alt peut parfois être "perdu" si une combinaison a été faite
  if (event.key === 'Alt') {
    showShortcuts.value = false
  }
}

// Clean up old session storage keys on app startup
onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
  window.addEventListener('keyup', handleGlobalKeyup)
  
  // Remove old keys that shouldn't be used anymore
  sessionStorage.removeItem('token')  // Use 'trainerToken' instead
  sessionStorage.removeItem('trainer_token')  // Use 'trainerToken' instead
  sessionStorage.removeItem('trainer_info')  // Use 'trainer' instead
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  window.removeEventListener('keyup', handleGlobalKeyup)
})

const isTrainerRoute = computed(() => {
  return route.path.startsWith('/trainer')
})

const isAnimationPage = computed(() => {
  // On considère comme "page d'animation" toute route qui ne doit PAS avoir de header/footer (ou qui a son propre header)
  return route.path.includes('/animation') || 
         route.path.includes('/projection') ||
         route.path.includes('/session-cours')
})

const handleAccountClick = () => {
  console.log('handleAccountClick called')
  console.log('isAuthenticated:', userStore.isAuthenticated)
  console.log('hasValidSession:', userStore.hasValidSession)
  if (userStore.isAuthenticated && userStore.hasValidSession) {
    console.log('Going to /account')
    router.push('/account')
  } else {
    console.log('Logging out and going to /login')
    userStore.logout()
    router.push('/login')
  }
}

const handleLogout = () => {
  userStore.logout()
  sessionStorage.clear()
  router.push('/login')
}
</script>

<style>
/* Footer Styles */
.footer {
  background-color: #1a1a2e;
  padding: 3rem 2rem;
  border-top: 1px solid #333;
  color: #94a3b8;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer a {
  color: #94a3b8;
  text-decoration: none;
}

.footer a:hover {
  color: #00d4ff;
}

/* Skip Links - Liquid, Professional & Minimalist */
.skip-links {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  background: #1e293b;
  color: #f8fafc;
  padding: 0.75rem 2rem;
  z-index: 10000;
  border-radius: 0 0 12px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.skip-links:focus-within {
  transform: translateX(-50%) translateY(0);
}

.skip-links-title {
  color: #94a3b8;
  font-weight: 500;
  font-size: 0.9rem;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding-right: 1.25rem;
}

.skip-link {
  color: #f8fafc;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.skip-link:hover {
  color: #e11d48;
}

.skip-link:focus {
  outline: 3px solid #e11d48 !important;
  outline-offset: 4px;
  color: #e11d48;
}

/* Keyboard Focus - Professional RGAA RED Style */
:focus-visible {
  outline: 4px solid #e11d48 !important;
  outline-offset: 4px !important;
  border-radius: 4px;
  box-shadow: 0 0 0 8px rgba(225, 29, 72, 0.3) !important;
}

/* Helper for accessibility (screen readers only) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* --- Professional Crystal Design System (Trainer V2) --- */
:root {
  --primary-color: #3b82f6;
  --primary-glow: rgba(59, 130, 246, 0.4);
  --danger-color: #e11d48;
  --success-color: #10b981;
  --bg-deep: #0a0a14;
  --glass-white: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
}

body {
  background-color: var(--bg-deep) !important;
  color: var(--text-main) !important;
  font-family: 'Inter', -apple-system, sans-serif !important;
  overflow-x: hidden;
}

/* Base Crystal Container */
.glass-container {
  min-height: 100vh !important;
  position: relative !important;
  background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 40%) !important;
}

/* High-End Glass Panel */
.glass-crystal, .card-crystal {
  background: rgba(255, 255, 255, 0.02) !important;
  backdrop-filter: blur(16px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
  border: 1px solid var(--glass-border) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
  border-radius: 24px !important;
}

.glass-crystal-deep {
  background: rgba(0, 0, 0, 0.4) !important;
  backdrop-filter: blur(24px) saturate(200%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.7) !important;
  border-radius: 32px !important;
}

/* Professional Crystal Headers */
.page-header-crystal {
  text-align: center !important;
  margin-bottom: 4rem !important;
  padding-top: 2rem !important;
}

.page-header-crystal h1 {
  font-size: 3.5rem !important;
  font-weight: 900 !important;
  letter-spacing: -0.02em !important;
  background: linear-gradient(to bottom, #ffffff 30%, #94a3b8 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  margin-bottom: 1rem !important;
}

.badge-crystal {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.5rem 1rem !important;
  background: rgba(59, 130, 246, 0.1) !important;
  border: 1px solid rgba(59, 130, 246, 0.2) !important;
  border-radius: 12px !important;
  color: #60a5fa !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  margin-bottom: 1.5rem !important;
}

/* Premium Navigation Links */
.navbar {
  background: rgba(10, 10, 20, 0.8) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid var(--glass-border) !important;
  padding: 0.75rem 3rem !important;
}

.navbar a {
  color: var(--text-muted) !important;
  font-weight: 600 !important;
  font-size: 0.95rem !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.navbar a:hover, .navbar a.router-link-active {
  color: white !important;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3) !important;
}

/* Interactive Components */
.btn-crystal-primary {
  background: var(--primary-color) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 1rem 2.5rem !important;
  border-radius: 16px !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  box-shadow: 0 10px 25px -5px var(--primary-glow) !important;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  cursor: pointer !important;
}

.btn-crystal-primary:hover {
  transform: translateY(-4px) scale(1.02) !important;
  box-shadow: 0 20px 35px -5px var(--primary-glow) !important;
}

/* Crystal Icons & Circles */
.icon-circle-crystal {
  width: 64px !important;
  height: 64px !important;
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 1.75rem !important;
  box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.02) !important;
}

/* --- Support Framework Utils --- */
.container {
  max-width: 1200px !important;
  margin: 0 auto !important;
  padding: 0 1.5rem !important;
}
.py-5 { padding-top: 3rem !important; padding-bottom: 3rem !important; }
.mb-5 { margin-bottom: 3rem !important; }
.mt-auto { margin-top: auto !important; }
.d-flex { display: flex !important; }
.align-items-center { align-items: center !important; }
.justify-content-between { justify-content: space-between !important; }
.w-100 { width: 100% !important; }

/* --- End Professional Crystal Design --- */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica', 'Arial', sans-serif;
  line-height: 1.5;
  color: #e0e0e0;
  background-color: #0f0f1e;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

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
  text-decoration: none;
  color: white;
  display: flex;
  align-items: center;
  border-bottom: none !important;
}

.navbar-brand.router-link-active {
  border-bottom: none !important;
}

.logo {
  height: 65px;
  width: auto;
}

.logo-footer {
  height: 35px;
  vertical-align: middle;
  margin: 0 10px;
}

.navbar h1 {
  display: none;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar ul {
  list-style: none;
  display: flex;
  gap: 2rem;
}

.navbar a {
  color: #b0b0b0;
  text-decoration: none;
  transition: color 0.2s ease;
  font-weight: 500;
}

.nav-link {
  background: none;
  border: none;
  color: #b0b0b0;
  text-decoration: none;
  transition: color 0.2s ease;
  font-weight: 500;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
}

.nav-link:hover {
  color: #00d4ff;
}

.navbar a:hover {
  color: #00d4ff;
}

.navbar a.router-link-active {
  color: #00d4ff;
  border-bottom: 2px solid #00d4ff;
  padding-bottom: 0.2rem;
}

.navbar-brand.router-link-active {
  border-bottom: none !important;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #0f0f1e;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }

  .navbar ul {
    gap: 1rem;
    width: 100%;
    justify-content: center;
  }
}
</style>
