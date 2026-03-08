<template>
  <div class="stat-session-page">
    <div class="session-card">
      <h1>Démarrer une session</h1>
      
      <p v-if="!showRegisterForm">Veuillez saisir votre code de session pour continuer.</p>
      <p v-else>Créez votre compte stagiaire pour ouvrir la session</p>
      
      <div v-if="error" class="error-message" role="alert">
        {{ error }}
      </div>

      <form v-if="!showRegisterForm" @submit.prevent="handleSessionCode">
        <div class="form-group">
          <label for="reg-email-check">Votre Email</label>
          <input 
            type="email" 
            id="reg-email-check" 
            v-model="sessionEmail" 
            placeholder="votre@email.com"
            required
            class="input-large"
          >
        </div>

        <div class="form-group">
          <label for="session-code">Code de session</label>
          <input 
            type="text" 
            id="session-code" 
            v-model="sessionCode" 
            placeholder="Ex: FORM2026"
            maxlength="8"
            minlength="8"
            class="code-input"
            required
            aria-describedby="code-help"
          >
          <p id="code-help" class="help-text">Le code contient exactement 8 caractères.</p>
        </div>
        <button type="submit" class="btn btn-primary btn-large">Entrer dans la session</button>
      </form>

      <!-- Formulaire de création de compte qui s'affiche si le code est correct -->
      <form v-else @submit.prevent="handleRegister" class="register-form-container">
        <div class="session-info-banner">
          <p>Session : <strong>{{ sessionCode.toUpperCase() }}</strong></p>
          <p>Email : <strong>{{ registerForm.email }}</strong></p>
        </div>
        
        <div class="register-grid">
          <div class="form-column">
            <div class="name-grid">
              <div class="form-group">
                <label for="reg-nom">Nom</label>
                <input type="text" id="reg-nom" v-model="registerForm.lastname" autocomplete="family-name" required placeholder="Votre nom">
              </div>
              <div class="form-group">
                <label for="reg-prenom">Prénom</label>
                <input type="text" id="reg-prenom" v-model="registerForm.firstname" autocomplete="given-name" required placeholder="Votre prénom">
              </div>
            </div>

            <div class="form-group">
              <label for="reg-campus">Campus</label>
              <select id="reg-campus" v-model="registerForm.campusId" required class="form-select">
                <option value="" disabled>Sélectionnez votre campus</option>
                <option v-for="campus in campuses" :key="campus.id" :value="campus.id">
                  {{ campus.name }}
                </option>
              </select>
              <p v-if="campuses.length === 0" class="help-text" style="color: #fb7185">
                Aucun campus trouvé pour cette session.
              </p>
            </div>

            <div class="form-group">
              <label for="reg-password">Mot de passe</label>
              <input type="password" id="reg-password" v-model="registerForm.password" required placeholder="Choisissez un mot de passe">
            </div>
          </div>

          <div class="form-column mobile-full-photo">
            <PhotoUpload v-model="registerForm.photo" />
          </div>
        </div>

        <div class="form-footer">
          <div class="button-group-row">
            <button type="submit" class="btn btn-primary">CRÉER MON COMPTE</button>
            <button type="button" @click="showRegisterForm = false" class="btn btn-secondary">RETOUR</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/api';
import { useUserStore } from '@/stores/userStore';
import PhotoUpload from '@/components/molecules/PhotoUpload.vue';

const userStore = useUserStore();
const sessionId = ref('');
const sessionCode = ref('');
const sessionEmail = ref('');
const error = ref('');
const showRegisterForm = ref(false);
const router = useRouter();

const registerForm = reactive({
  lastname: '',
  firstname: '',
  email: '',
  campusId: '',
  photo: '',
  password: ''
});

const campuses = ref<any[]>([]);

const handleSessionCode = async () => {
  error.value = '';
  
  if (sessionCode.value.length === 8 && sessionEmail.value) {
    try {
      const response = await apiClient.post('/sessions/validate', { 
        code: sessionCode.value.toUpperCase(),
        email: sessionEmail.value.toLowerCase()
      });
      
      const { success, data, error: apiError } = response.data;

      if (!success) {
        error.value = apiError || 'Session ou email invalide';
        return;
      }

      if (data.valid) {
        sessionId.value = data.id;
        if (data.alreadyRegistered) {
          router.push({ path: '/login', query: { email: sessionEmail.value } });
        } else {
          registerForm.email = sessionEmail.value;
          
          let campusUrl = `/campus?schoolId=${data.schoolId}`;
          if (data.campusIds) {
            campusUrl = `/campus?ids=${data.campusIds}`;
          }
          
          const campusRes = await apiClient.get(campusUrl);
          if (campusRes.data.success) {
            campuses.value = campusRes.data.data;
          }
          showRegisterForm.value = true;
        }
      } else {
        error.value = 'Ce code de session est invalide';
      }
    } catch (err) {
      error.value = 'Erreur lors de la validation des données';
    }
  }
};

const handleRegister = async () => {
  error.value = '';
  try {
    const response = await apiClient.post('/users', {
      lastname: registerForm.lastname,
      firstname: registerForm.firstname,
      email: registerForm.email.toLowerCase(),
      sessionId: sessionId.value,
      campusId: registerForm.campusId,
      photo: registerForm.photo,
      password: registerForm.password
    });

    if (response.data.success) {
      userStore.setUser(response.data.data, response.data.data.token, true);
      router.push({ path: '/' });
    } else {
      error.value = response.data.error || 'Erreur lors de la création du compte';
    }
  } catch (err) {
    error.value = 'Erreur lors de la création du compte. L\'utilisateur existe peut-être déjà.';
  }
};
</script>

<style scoped>
.stat-session-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.session-card {
  background-color: #1a1a2e;
  padding: 3rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
  transition: all 0.3s ease;
}

/* Elargit la carte quand le formulaire register s'affiche */
.session-card:has(.register-grid) {
  max-width: 900px;
}

.register-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  text-align: left;
  margin-top: 1rem;
}

.form-column {
  display: flex;
  flex-direction: column;
}

.form-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
  width: 100%;
}

.button-group-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 1.5rem;
}

.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

h1 {
  color: #00d4ff;
  margin-bottom: 1.5rem;
  font-weight: 700;
  font-size: 2.2rem;
}

p {
  color: #b0b0b0;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.session-info-banner {
  background: rgba(0, 212, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  color: #00d4ff;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border: 1px dashed rgba(0, 212, 255, 0.3);
}

.session-info-banner p {
  margin-bottom: 0;
  font-size: 0.95rem;
}

.error-message {
  background-color: rgba(225, 29, 72, 0.1);
  color: #fb7185;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #fb7185;
  text-align: left;
}

.form-group {
  margin-bottom: 1.25rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
  font-weight: 500;
}

.form-group input, .form-select {
  width: 100%;
  padding: 0.75rem;
  background-color: #0f0f1e;
  border: 1px solid #334155;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.code-input {
  letter-spacing: 0.5rem;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  text-align: center;
  font-size: 1.5rem !important;
  text-transform: uppercase;
  border: 1px solid #00d4ff !important;
  background-color: rgba(0, 212, 255, 0.05) !important;
}

.help-text {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.readonly-input {
  background-color: rgba(15, 15, 30, 0.5) !important;
  color: #94a3b8 !important;
}

.btn {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
  text-transform: uppercase;
}

.btn-primary {
  background-color: #00d4ff;
  color: #0f0f1e;
}

.btn-large {
  width: 100%;
}

.btn-secondary {
  background-color: #334155;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

@media (max-width: 768px) {
  .register-grid {
    grid-template-columns: 1fr;
  }
}
</style>
