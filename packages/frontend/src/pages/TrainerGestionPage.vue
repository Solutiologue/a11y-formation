<!-- src/pages/TrainerGestionPage.vue -->
<template>
  <div class="trainer-layout" v-if="trainerStore.isAuthenticated">
    <main class="trainer-content" role="main" tabindex="-1">
      <div class="container">
        <h1>Gestion des sessions et stagiaires</h1>
        <p class="subtitle">Administration des sessions de formation</p>

        <section class="trainees-section">
          <h2>Stagiaires inscrits</h2>
          <div class="controls">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un stagiaire..."
              class="search-input"
            />
            <button @click="exportData" class="btn-secondary">Exporter les données</button>
          </div>

          <div class="table-wrapper" v-if="trainees.length > 0">
            <table class="trainees-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Campus</th>
                  <th>Session</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="trainee in filteredTrainees" :key="trainee.id">
                  <td>{{ trainee.email }}</td>
                  <td>{{ trainee.lastname }}</td>
                  <td>{{ trainee.firstname }}</td>
                  <td>{{ trainee.campus?.name || '-' }}</td>
                  <td>{{ trainee.session?.code || '-' }}</td>
                  <td>
                    <span :class="['status-badge', trainee.isLocked ? 'locked' : 'active']">
                      {{ trainee.isLocked ? 'Verrouillé' : 'Actif' }}
                    </span>
                  </td>
                  <td>
                    <button @click="editTrainee(trainee)" class="btn-icon">✏️</button>
                    <button @click="deleteTrainee(trainee.id)" class="btn-icon danger">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-state">
            <p>Aucun stagiaire inscrit pour le moment</p>
          </div>
        </section>

        <section class="chapters-section">
          <h2>Chapitres de formation</h2>
          <div class="chapters-grid">
            <div v-for="chapter in chapters" :key="chapter.id" class="chapter-card">
              <h3>{{ chapter.title }}</h3>
              <p>{{ chapter.description }}</p>
              <div class="chapter-meta">
                <span class="order">Chapitre {{ chapter.order + 1 }}</span>
                <span :class="['lock-status', chapter.isLocked ? 'locked' : 'unlocked']">
                  {{ chapter.isLocked ? '🔒 Verrouillé' : '🔓 Déverrouillé' }}
                </span>
              </div>
              <button @click="editChapter(chapter)" class="btn-secondary">Modifier</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
  <div v-else class="unauthorized">
    <p>Vous devez être connecté pour accéder à cette page.</p>
    <router-link to="/trainer" class="btn-primary">Retour à l'accueil</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTrainerStore } from '@/stores/trainerStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const trainerStore = useTrainerStore()

const trainees = ref<any[]>([])
const chapters = ref<any[]>([])
const searchQuery = ref('')

const filteredTrainees = computed(() => {
  if (!searchQuery.value) return trainees.value
  const query = searchQuery.value.toLowerCase()
  return trainees.value.filter(
    (t) =>
      t.email.toLowerCase().includes(query) ||
      t.firstname.toLowerCase().includes(query) ||
      t.lastname.toLowerCase().includes(query)
  )
})

onMounted(() => {
  if (!trainerStore.isAuthenticated) {
    router.push('/trainer')
    return
  }
  loadTraineesAndChapters()
})

const loadTraineesAndChapters = async () => {
  // TODO: API calls to fetch trainees and chapters
  trainees.value = []
  chapters.value = []
}

const editTrainee = (trainee: any) => {
  console.log('Editing trainee:', trainee)
  // TODO: Implement trainee editing
}

const deleteTrainee = (traineeId: string) => {
  console.log('Deleting trainee:', traineeId)
  // TODO: Implement trainee deletion with confirmation
}

const editChapter = (chapter: any) => {
  console.log('Editing chapter:', chapter)
  // TODO: Implement chapter editing
}

const exportData = () => {
  console.log('Exporting data...')
  // TODO: Implement data export (CSV or JSON)
}
</script>

<style scoped>
.trainer-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0f0f1e;
}

.trainer-content {
  flex: 1;
  padding: 3rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #e0e0e0;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.subtitle {
  color: #94a3b8;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

section {
  margin-bottom: 3rem;
}

h2 {
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 0.75rem;
  border: 2px solid #333;
  border-radius: 8px;
  font-size: 1rem;
  background: #1a1a2e;
  color: #e0e0e0;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: #64748b;
}

.table-wrapper {
  overflow-x: auto;
  background: #1a1a2e;
  border-radius: 12px;
  border: 1px solid #333;
}

.trainees-table {
  width: 100%;
  border-collapse: collapse;
}

.trainees-table thead {
  background: #0f0f1e;
  border-bottom: 2px solid #333;
}

.trainees-table th {
  padding: 1rem;
  text-align: left;
  color: #e0e0e0;
  font-weight: 600;
}

.trainees-table td {
  padding: 1rem;
  border-bottom: 1px solid #333;
  color: #94a3b8;
}

.trainees-table tbody tr:hover {
  background: #0f0f1e;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.locked {
  background: #fee2e2;
  color: #991b1b;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  margin: 0 0.25rem;
  transition: transform 0.2s;
  color: #e0e0e0;
}

.btn-icon:hover {
  transform: scale(1.2);
}

.btn-icon.danger:hover {
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  background: #1a1a2e;
  border-radius: 12px;
  border: 1px solid #333;
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.chapter-card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #333;
  transition: all 0.3s;
}

.chapter-card:hover {
  border-color: #667eea;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
}

.chapter-card h3 {
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

.chapter-card p {
  color: #94a3b8;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.chapter-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.order,
.lock-status {
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.order {
  background: #e0e7ff;
  color: #3730a3;
}

.lock-status.locked {
  background: #fee2e2;
  color: #991b1b;
}

.lock-status.unlocked {
  background: #dcfce7;
  color: #166534;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: auto;
  display: inline-block;
  padding: 0.75rem 1.5rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  width: 100%;
  background: #333;
  color: #e0e0e0;
}

.btn-secondary:hover {
  background: #444;
}

.unauthorized {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0f0f1e;
  color: #94a3b8;
}

.unauthorized .btn-primary {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .trainer-content {
    padding: 1.5rem 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .controls {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .trainees-table {
    font-size: 0.85rem;
  }

  .trainees-table th,
  .trainees-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
