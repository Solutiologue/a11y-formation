<!-- src/pages/UserAccountPage.vue -->
<template>
  <div class="user-account-page">
    <!-- Hamburger mobile -->
    <button class="mobile-menu-toggle" @click="isDrawerOpen = !isDrawerOpen" aria-label="Ouvrir le menu de navigation" aria-controls="sidebar-drawer">
      ☰
    </button>

    <!-- Overlay pour fermer le drawer -->
    <div v-if="isDrawerOpen" class="drawer-overlay" @click="isDrawerOpen = false"></div>

    <!-- Sidebar latérale rétractable -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': !isMenuExpanded, 'drawer-open': isDrawerOpen }" id="sidebar-drawer">
      <div class="sidebar-header">
        <button class="sidebar-toggle-btn" @click="toggleMenuExpand" aria-label="Rétracter/Étendre le menu" title="Rétracter/Étendre">
          {{ isMenuExpanded ? '‹' : '›' }}
        </button>
      </div>
      <ul class="sidebar-menu">
        <li class="sidebar-item">
          <button @click="activeSection = 'account'; isDrawerOpen = false" class="sidebar-link" :class="{ active: activeSection === 'account' }" aria-label="Mon profil" :title="isMenuExpanded ? '' : 'Moi'">
            <span class="menu-icon">👤</span>
            <span v-if="isMenuExpanded" class="menu-text">Moi</span>
          </button>
        </li>
        <li class="sidebar-item">
          <button @click="activeSection = 'formation'; isDrawerOpen = false" class="sidebar-link" :class="{ active: activeSection === 'formation' }" aria-label="Ma formation" :title="isMenuExpanded ? '' : 'Mes formations'">
            <span class="menu-icon">📚</span>
            <span v-if="isMenuExpanded" class="menu-text">Mes formations</span>
          </button>
        </li>
        <li class="sidebar-item">
          <button @click="activeSection = 'links'; isDrawerOpen = false" class="sidebar-link" :class="{ active: activeSection === 'links' }" aria-label="Mes liens utiles" :title="isMenuExpanded ? '' : 'Les liens'">
            <span class="menu-icon">🔗</span>
            <span v-if="isMenuExpanded" class="menu-text">Les liens</span>
          </button>
        </li>
        <li class="sidebar-item">
          <button @click="activeSection = 'notes'; isDrawerOpen = false" class="sidebar-link" :class="{ active: activeSection === 'notes' }" aria-label="Mon bloc-note" :title="isMenuExpanded ? '' : 'Mon bloc-note'">
            <span class="menu-icon">📊</span>
            <span v-if="isMenuExpanded" class="menu-text">Mon bloc-note</span>
          </button>
        </li>
      </ul>
    </aside>

    <section class="account-container">
      <h1 class="debug-title">{{ getSectionTitle() }}</h1>
      
      <div v-if="userStore.currentUser" class="user-info">
        <!-- Dynamically render sections -->
        <AccountSection 
          v-if="activeSection === 'account'"
          :user="userStore.currentUser"
          :hasValidSession="userStore.hasValidSession"
          :sessionDetails="sessionDetails"
          @logout="logout"
          @openProfileModal="openProfileModal"
          @openPasswordModal="showPasswordModal = true"
          @openDeleteModal="showDeleteModal = true"
        />

        <FormationSection 
          v-if="activeSection === 'formation'"
          :hasValidSession="userStore.hasValidSession"
          :sessionId="userStore.currentUser?.sessionId"
          @activateSession="activateSession"
          @validateSession="validateSession"
        />

        <LinksSection v-if="activeSection === 'links'" />

        <NotesSection v-if="activeSection === 'notes'" />
      </div>

      <div v-else class="no-user">
        <p>Aucune information utilisateur trouvée.</p>
        <router-link to="/login" class="btn btn-primary">
          Se connecter
        </router-link>
      </div>
    </section>

    <!-- Modal Suppression de Compte -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3 style="color: #fb7185">Supprimer mon compte</h3>
        <p style="color: #e2e8f0; margin-bottom: 1.5rem; text-align: left;">
          Cette action est irréversible. Toutes vos données seront désactivées et vous ne pourrez plus vous connecter.
        </p>
        
        <div class="delete-confirmation-container">
          <label class="custom-checkbox-container">
            <input type="checkbox" v-model="confirmDeleteCheckbox" class="hidden-checkbox" />
            <span class="custom-checkbox"></span>
            <span class="checkbox-label">Je confirme vouloir supprimer définitivement mon compte et toutes mes données de formation.</span>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" @click="showDeleteModal = false; confirmDeleteCheckbox = false" class="btn btn-secondary">Annuler</button>
          <button 
            type="button" 
            @click="handleDeleteAccount" 
            class="btn btn-danger" 
            :disabled="!confirmDeleteCheckbox || isUpdating"
          >
            {{ isUpdating ? 'Suppression...' : 'Supprimer mon compte' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal Changement Mot de Passe -->
    <div v-if="showPasswordModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Changer le mot de passe</h3>
        <form @submit.prevent="updatePassword">
          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <input type="password" v-model="passForm.new" required minlength="6" class="form-input" />
          </div>
          <div class="form-group">
            <label>Confirmer le mot de passe</label>
            <input type="password" v-model="passForm.confirm" required minlength="6" class="form-input" />
          </div>
          <p v-if="passError" class="error-msg">{{ passError }}</p>
          <div class="modal-actions">
            <button type="button" @click="showPasswordModal = false" class="btn btn-secondary">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="isUpdating">
              {{ isUpdating ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Modification Coordonnées -->
    <div v-if="showProfileModal" class="modal-overlay">
      <div class="modal-content modal-lg">
        <h3>Modifier mes coordonnées</h3>
        <form @submit.prevent="updateProfile" class="profile-form-layout">
          <div class="form-column">
            <div class="form-group">
              <label>Prénom</label>
              <input type="text" v-model="profileForm.firstname" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input type="text" v-model="profileForm.lastname" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Campus</label>
              <select v-model="profileForm.campusId" required class="form-input">
                <option value="" disabled>Sélectionnez un campus</option>
                <option v-for="c in campusList" :key="c.id" :value="c.id">
                  {{ c.school?.name ? `${c.school.name} - ${c.name}` : c.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-column">
            <div class="form-group">
              <PhotoUpload v-model="profileForm.photo" />
            </div>
          </div>

          <div class="form-footer">
            <p v-if="profileError" class="error-msg">{{ profileError }}</p>
            <div class="modal-actions">
              <button type="button" @click="showProfileModal = false" class="btn btn-secondary">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="isUpdating">
                {{ isUpdating ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { apiClient } from '@/utils/api'
import PhotoUpload from '@/components/molecules/PhotoUpload.vue'
import AccountSection from '@/components/sections/AccountSection.vue'
import FormationSection from '@/components/sections/FormationSection.vue'
import LinksSection from '@/components/sections/LinksSection.vue'
import NotesSection from '@/components/sections/NotesSection.vue'

const router = useRouter()
const userStore = useUserStore()

const isMenuExpanded = ref(true)
const isDrawerOpen = ref(false)
const activeSection = ref('formation')

const showPasswordModal = ref(false)
const showProfileModal = ref(false)
const showDeleteModal = ref(false)
const confirmDeleteCheckbox = ref(false)
const isUpdating = ref(false)
const passError = ref('')
const profileError = ref('')
const campusList = ref<any[]>([])
const sessionDetails = ref<any>(null)

const passForm = reactive({
  new: '',
  confirm: ''
})

const profileForm = reactive({
  lastname: '',
  firstname: '',
  campusId: '',
  photo: ''
})

onMounted(async () => {
  try {
    const user = userStore.currentUser
    let campusUrl = '/campus'
    
    if (user && user.sessionId) {
      // Utilisation d'un paramètre explicite "id" pour le backend
      const sessionRes = await apiClient.post('/sessions/validate', { 
        id: user.sessionId
      })
      
      console.log('DEBUG Session Data:', sessionRes.data)
      
      if (sessionRes.data.success) {
        sessionDetails.value = sessionRes.data.data
        if (sessionRes.data.data.campusIds) {
          campusUrl = `/campus?ids=${sessionRes.data.data.campusIds}`
        } else if (user.campus?.schoolId) {
          campusUrl = `/campus?schoolId=${user.campus.schoolId}`
        }
      }
    }

    console.log('DEBUG Fetching Campus from:', campusUrl)
    const res = await apiClient.get(campusUrl)
    if (res.data.success) {
      campusList.value = res.data.data
    }
  } catch (err) {
    console.error("Erreur chargement campus spécifique à la session", err)
  }
})

const openProfileModal = () => {
  if (userStore.currentUser) {
    profileForm.lastname = userStore.currentUser.lastname || ''
    profileForm.firstname = userStore.currentUser.firstname || ''
    
    // On extrait l'ID du campus de manière robuste
    const campus = userStore.currentUser.campus;
    let finalCampusId = '';
    
    if (campus && typeof campus === 'object') {
      finalCampusId = (campus as any).id || '';
    } else if (userStore.currentUser.campusId) {
      finalCampusId = userStore.currentUser.campusId;
    } else {
      finalCampusId = campus || '';
    }
    
    profileForm.campusId = finalCampusId;
    profileForm.photo = userStore.currentUser.photo || ''
    showProfileModal.value = true
  }
}

const updateProfile = async () => {
  isUpdating.value = true
  profileError.value = ""
  
  try {
    const payload: any = {
      lastname: profileForm.lastname,
      firstname: profileForm.firstname,
      campusId: profileForm.campusId
    }
    
    if (profileForm.photo) {
      payload.photo = profileForm.photo
    }

    const res = await apiClient.put('/users/profile', payload)
    if (res.data.success) {
      // Mettre à jour le store localement
      if (userStore.currentUser) {
        userStore.currentUser.lastname = profileForm.lastname
        userStore.currentUser.firstname = profileForm.firstname
        if (res.data.data.campus) {
          userStore.currentUser.campus = res.data.data.campus
        }
        if (payload.photo) {
          userStore.currentUser.photo = payload.photo
        }
      }
      alert("Profil mis à jour avec succès")
      showProfileModal.value = false
    }
  } catch (err) {
    profileError.value = "Erreur lors de la mise à jour"
  } finally {
    isUpdating.value = false
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Non disponible'
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

const updatePassword = async () => {
  if (passForm.new !== passForm.confirm) {
    passError.value = "Les mots de passe ne correspondent pas"
    return
  }
  
  passError.value = ""
  isUpdating.value = true
  
  try {
    const res = await apiClient.put('/users/profile', { password: passForm.new })
    if (res.data.success) {
      alert("Mot de passe mis à jour avec succès")
      showPasswordModal.value = false
      passForm.new = ""
      passForm.confirm = ""
    }
  } catch (err) {
    passError.value = "Erreur lors de la mise à jour"
  } finally {
    isUpdating.value = false
  }
}

const handleDeleteAccount = async () => {
  if (!confirmDeleteCheckbox.value) return
  
  isUpdating.value = true
  try {
    // On envoie une mise à jour du profil avec isDeleted: true
    const res = await apiClient.put('/users/profile', { isDeleted: true })
    if (res.data.success) {
      alert("Votre compte a été supprimé. Vous allez être déconnecté.")
      logout()
    }
  } catch (err) {
    alert("Erreur lors de la suppression")
  } finally {
    isUpdating.value = false
    showDeleteModal.value = false
  }
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const toggleMenuExpand = () => {
  isMenuExpanded.value = !isMenuExpanded.value
}

const validateSession = () => {
  router.push('/session')
}

const activateSession = () => {
  router.push('/stat-session')
}

const getSectionTitle = () => {
  const titles: Record<string, string> = {
    'account': 'Moi',
    'formation': 'Mes formations',
    'links': 'Les liens',
    'notes': 'Mon bloc-note'
  }
  return titles[activeSection.value] || 'Moi'
}
</script>

<style scoped>
.user-account-page {
  flex: 1;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  display: flex;
  flex-direction: row;
  height: 100vh;
  overflow: hidden;
  gap: 0;
  position: relative;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background-color: #00d4ff;
  color: #0f0f1e;
  border: none;
  border-radius: 4px;
  font-size: 1.5rem;
  width: 44px;
  height: 44px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.mobile-menu-toggle:hover {
  background-color: #00a8cc;
}

.mobile-menu-toggle:focus-visible {
  outline: 3px solid #e11d48;
  outline-offset: 2px;
}

.drawer-overlay {
  display: none;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background-color: #0f0f1e;
  border-right: 1px solid #333;
  padding: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s ease;
  max-height: 100%;
}

.sidebar-collapsed {
  width: 90px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #333;
  gap: 0.5rem;
}

.sidebar-toggle-btn {
  background: transparent;
  border: 1px solid #333;
  color: #00d4ff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  align-self: flex-end;
  margin-right: 0.5rem;
}

.sidebar-toggle-btn:hover {
  background-color: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
}

.sidebar-menu {
  list-style: none;
  background-color: transparent !important;
  padding: 1rem 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.sidebar-item {
  padding: 0;
}

.sidebar-link {
  width: 100%;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  white-space: nowrap;
  margin: 0;
}

.sidebar-collapsed .sidebar-link {
  padding: 1rem;
  justify-content: center;
  margin: 0;
}

.sidebar-link:hover {
  color: #00d4ff;
  background-color: rgba(0, 212, 255, 0.1);
  border-left-color: #00d4ff;
}

.sidebar-collapsed .sidebar-link:hover {
  border-left-color: transparent;
  background-color: rgba(0, 212, 255, 0.1);
}

.sidebar-link.active {
  color: #00d4ff;
  background-color: rgba(0, 212, 255, 0.1);
  border-left-color: #00d4ff;
  font-weight: 600;
}

.sidebar-collapsed .sidebar-link.active {
  background-color: rgba(0, 212, 255, 0.1);
  border-left-color: transparent;
  border-bottom: 2px solid #00d4ff;
}

.menu-icon {
  font-size: 1.25rem;
  display: inline-block;
  flex-shrink: 0;
}

.menu-text {
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: transparent !important;
  border: none !important;
}

.sidebar-close-btn {
  display: none;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
}

.hamburger-btn {
  display: none;
}

.sidebar-overlay {
  display: none;
}

.account-container {
  flex: 1;
  max-width: none;
  background-color: transparent;
  padding: 2rem;
  border-radius: 0;
  box-shadow: none;
  overflow-y: auto;
}

.debug-title {
  color: #00d4ff;
  text-align: left;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  border: none;
  outline: none;
  box-shadow: none;
}

.content-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-title {
  color: #00d4ff;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-section, .session-section {
  padding: 1rem;
  background-color: rgba(15, 15, 30, 0.5);
  border-radius: 8px;
  border: 1px solid #333;
  margin-bottom: 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem 0 1.5rem 0;
  border-bottom: 1px solid #333;
}

.header-actions {
  margin-left: auto;
}

.profile-title h2 {
  margin: 0;
  font-size: 1.8rem;
}

.profile-subtitle {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.school-tag, .campus-tag {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.school-tag {
  background: #00d4ff;
  color: #0f0f1e;
}

.campus-tag {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  border: 1px solid #00d4ff;
}

.profile-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #00d4ff;
  background-color: #0f0f1e;
  flex-shrink: 0;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #00d4ff;
}

.btn-sm {
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
}

/* Styles pour les sections additionnelles */
.session-info {
  padding: 1.5rem;
  background-color: rgba(15, 15, 30, 0.5);
  border-radius: 8px;
  border: 1px solid #333;
}

.session-details {
  margin-top: 1rem;
}

.session-details p {
  color: #94a3b8;
  margin-bottom: 1rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.link-card {
  padding: 1.5rem;
  background-color: rgba(15, 15, 30, 0.5);
  border: 1px solid #333;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
}

.link-card:hover {
  background-color: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
  transform: translateY(-4px);
}

.link-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.link-card h3 {
  color: #00d4ff;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.link-card p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.9rem;
}

.notes-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.notes-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.5rem;
  background-color: rgba(15, 15, 30, 0.5);
  border: 1px solid #333;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  color: #00d4ff;
  font-size: 2rem;
  font-weight: bold;
}

.notes-empty {
  padding: 2rem;
  text-align: center;
  background-color: rgba(15, 15, 30, 0.5);
  border: 1px solid #333;
  border-radius: 8px;
  color: #94a3b8;
}

.text-muted {
  color: #64748b !important;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .user-account-page {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    width: 280px;
    border-right: 1px solid #333;
    border-bottom: none;
    z-index: 999;
    transition: left 0.3s ease;
    max-height: none;
  }

  .sidebar.drawer-open {
    left: 0;
  }

  .sidebar-collapsed {
    width: 280px;
  }

  .drawer-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }

  .account-container {
    padding: 1.5rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .header-actions {
    margin-left: 0;
    width: 100%;
  }
  
  .header-actions .btn {
    width: 100%;
  }

  .account-grid {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    flex-direction: column;
  }

  .settings-grid .btn {
    min-width: auto;
  }
}

.campus-badge {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid #00d4ff;
  font-size: 0.9rem;
  display: inline-block;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #94a3b8;
  font-size: 0.9rem;
}

span {
  color: white;
  background-color: #0f0f1e;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #333;
}

.session-valid {
  color: #10b981;
  font-weight: 600;
}

.session-invalid {
  color: #fb7185;
  font-weight: 600;
}

.actions {
  text-align: center;
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-settings {
  text-align: left;
  border-top: 1px solid #333;
  padding-top: 1rem;
}

.profile-settings h3 {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.settings-grid .btn {
  flex: 1;
  min-width: 180px;
  justify-content: center;
  display: flex;
  align-items: center;
  height: 42px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  width: 95%;
  max-width: 500px;
  border: 1px solid #333;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.modal-lg {
  max-width: 800px;
}

.profile-form-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-footer {
  grid-column: span 2;
  margin-top: 1rem;
  border-top: 1px solid #333;
  padding-top: 1.5rem;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.photo-preview-small {
  margin-top: 0.5rem;
  color: #10b981;
  font-size: 0.85rem;
  font-weight: 600;
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.form-group {
  margin-bottom: 1.25rem;
  text-align: left;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  background: #0f0f1e;
  border: 1px solid #333;
  border-radius: 6px;
  color: white;
  margin-top: 0.4rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.error-msg {
  color: #fb7185;
  font-size: 0.85rem;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  text-align: left;
}

.btn-outline {
  background: transparent;
  border: 1px solid #00d4ff;
  color: #00d4ff;
}

.btn-danger-outline {
  background: transparent;
  border: 1px solid #fb7185;
  color: #fb7185;
}

.btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
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

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
  transform: scale(1.05);
}

.btn-danger {
  background-color: #800000;
  color: white;
}

.btn-danger:hover {
  background-color: #a00000;
  transform: scale(1.05);
}

.no-user {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.no-user p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.no-user p {
  margin-bottom: 1rem;
}

/* Styles pour la checkbox de suppression personnalisée */
.delete-confirmation-container {
  margin: 1.5rem 0 2rem 0;
  text-align: left;
}

.custom-checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  position: relative;
  user-select: none;
}

.hidden-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-checkbox {
  min-width: 22px;
  height: 22px;
  background-color: #1a1a2e;
  border: 2px solid #334155;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 2px;
}

.custom-checkbox-container:hover .custom-checkbox {
  border-color: #fb7185;
  background-color: rgba(251, 113, 133, 0.05);
}

.hidden-checkbox:checked ~ .custom-checkbox {
  background-color: #fb7185;
  border-color: #fb7185;
  box-shadow: 0 0 8px rgba(251, 113, 133, 0.4);
}

.custom-checkbox::after {
  content: "";
  display: none;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.hidden-checkbox:checked ~ .custom-checkbox::after {
  display: block;
}

.checkbox-label {
  color: #fb7185;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.4;
}

.hidden-checkbox:focus-visible ~ .custom-checkbox {
  outline: 2px solid #00d4ff;
  outline-offset: 2px;
}
</style>