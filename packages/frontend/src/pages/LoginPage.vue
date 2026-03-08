<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Mon compte</h1>
      <p>Accédez à votre espace stagiaire</p>
      
      <div v-if="infoMessage && !error" class="info-message" role="alert" v-html="infoMessage">
      </div>

      <div v-if="error" class="error-message" role="alert">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            ref="passwordInput"
            required
          >
        </div>
        <button type="submit" class="btn btn-primary">Se connecter</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiClient } from '@/utils/api';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const email = ref('');
const password = ref('');
const passwordInput = ref<HTMLInputElement | null>(null);
const infoMessage = ref('');
const error = ref('');

onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email as string;
    infoMessage.value = "Vous êtes déjà inscrit à cette session.<br />Veuillez vous identifier.";
    
    // Positionner le focus sur le password après un court délai pour laisser le DOM s'ajuster
    setTimeout(() => {
      passwordInput.value?.focus();
    }, 100);
  }
});

const handleLogin = async () => {
  error.value = '';
  try {
    const response = await apiClient.post('/auth/login', {
      email: email.value,
      password: password.value
    });

    if (response.data.success) {
      userStore.setUser(response.data.data, response.data.data.token, true)
      // Redirection vers "Mes formations" (UserAccountPage avec section formation par défaut)
      router.push('/account?section=formation');
    } else {
      error.value = response.data.error || 'Email ou mot de passe incorrect';
    }
  } catch (err) {
    error.value = 'Erreur lors de la connexion. Veuillez réessayer.';
    console.error(err);
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem;
}

.login-card {
  background-color: #1a1a2e;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

h1 {
  color: #00d4ff;
  margin-bottom: 0.5rem;
}

p {
  color: #b0b0b0;
  margin-bottom: 2rem;
}

.info-message {
  background-color: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(0, 212, 255, 0.4);
  font-size: 0.95rem;
  text-align: left;
}

.error-message {
  background-color: rgba(225, 29, 72, 0.1);
  color: #fb7185;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e11d48;
  text-align: left;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: white;
}

input {
  width: 100%;
  padding: 0.75rem;
  background: #0f0f1e;
  border: 1px solid #333;
  color: white;
  border-radius: 4px;
}

input:focus {
  outline: 2px solid #e11d48;
  border-color: transparent;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background-color: #00d4ff;
  color: #0f0f1e;
}

.btn-primary:hover {
  background-color: #00e5ff;
  transform: scale(1.05);
}

.btn {
  width: 100%;
}
</style>
