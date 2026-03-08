<template>
  <div class="library-page glass-container">
    <div class="container py-5">
      <header class="page-header-crystal mb-5">
        <div class="header-content">
          <div class="badge-crystal">Contenus Pédagogiques</div>
          <h1>Bibliothèques de Supports</h1>
          <p class="subtitle">Accédez à l'ensemble de vos ressources et modules de formation</p>
        </div>
      </header>

      <!-- Barre de recherche Crystal -->
      <div class="library-tools-crystal glass-crystal mb-5 p-3 p-md-4">
        <div class="search-box-crystal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" v-model="searchQuery" placeholder="Rechercher par titre ou mot-clé...">
        </div>
        <div class="filter-group-crystal">
          <label class="d-none d-md-block">Filtrer :</label>
          <select v-model="filterType" class="select-crystal">
            <option value="all">Tous les supports</option>
            <option value="formation">Cursus complets</option>
            <option value="module">Modules thématiques</option>
          </select>
        </div>
      </div>

      <!-- Grille de contenus Crystal -->
      <div class="library-grid-crystal">
        <div v-for="item in filteredItems" :key="item.id" class="content-card-crystal glass-crystal">
          <div class="card-thumb-crystal" :style="{ background: `linear-gradient(135deg, ${item.color}44 0%, ${item.color}11 100%)` }">
            <div class="type-badge-crystal">{{ item.type }}</div>
            <div class="card-icon-crystal" :style="{ color: item.color }">{{ item.icon }}</div>
            <div class="thumb-decoration" :style="{ backgroundColor: item.color }"></div>
          </div>
          
          <div class="card-body-crystal p-4">
            <div class="card-meta-top mb-2">
              <span class="chapters-count">{{ item.chaptersCount }} chapitres</span>
              <span class="update-date">Mis à jour le {{ item.updatedAt }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            
            <div class="card-actions-crystal mt-4">
              <button class="btn-crystal-secondary sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-xs me-2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Aperçu
              </button>
              <button class="btn-crystal-primary sm">
                Lancer
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon-xs ms-2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State Crystal -->
      <div v-if="filteredItems.length === 0" class="empty-state-crystal py-5">
        <div class="empty-icon mb-3">🔍</div>
        <h3>Aucun résultat</h3>
        <p class="text-muted">Essayez d'ajuster vos critères de recherche ou de filtrage.</p>
        <button @click="searchQuery = ''; filterType = 'all'" class="btn-crystal-secondary mt-3">Voir tout le catalogue</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')
const filterType = ref('all')

const libraryItems = ref([
  {
    id: '1',
    title: 'Accessibilité Web : Fondamentaux',
    description: 'Introduction complète aux normes WCAG et au RGAA 4.1 pour tous les métiers du web.',
    type: 'formation',
    chaptersCount: 12,
    updatedAt: '15/02/2026',
    icon: '♿',
    color: '#3b82f6'
  },
  {
    id: '2',
    title: 'Audit RGAA : Méthodologie',
    description: 'Guide pratique pour réaliser un audit de conformité exhaustif et fiable.',
    type: 'module',
    chaptersCount: 5,
    updatedAt: '01/03/2026',
    icon: '📋',
    color: '#10b981'
  },
  {
    id: '3',
    title: 'WAI-ARIA pour Développeurs',
    description: 'Implémentation des patterns de conception complexes avec les attributs ARIA.',
    type: 'formation',
    chaptersCount: 8,
    updatedAt: '20/01/2026',
    icon: '💻',
    color: '#8b5cf6'
  }
])

const filteredItems = computed(() => {
  return libraryItems.value.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = filterType.value === 'all' || item.type === filterType.value
    return matchesSearch && matchesType
  })
})
</script>

<style scoped>
.library-page {
  min-height: calc(100vh - 80px);
}

.library-tools-crystal {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.search-box-crystal {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.3);
}

.search-box-crystal input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: white;
  transition: all 0.3s ease;
}

.search-box-crystal input:focus {
  background: rgba(0, 0, 0, 0.4);
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
}

.filter-group-crystal {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-group-crystal label {
  white-space: nowrap;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
}

.select-crystal {
  padding: 0.75rem 2.5rem 0.75rem 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.library-grid-crystal {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2.5rem;
}

.content-card-crystal {
  display: flex;
  flex-direction: column;
  border-radius: 32px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.content-card-crystal:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
}

.card-thumb-crystal {
  height: 180px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.thumb-decoration {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  z-index: 0;
  transition: all 0.5s ease;
}

.content-card-crystal:hover .thumb-decoration {
  opacity: 0.3;
  transform: scale(1.2);
}

.card-icon-crystal {
  font-size: 5rem;
  z-index: 1;
  filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.4));
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.content-card-crystal:hover .card-icon-crystal {
  transform: scale(1.1) rotate(5deg);
}

.type-badge-crystal {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  padding: 0.4rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2;
  color: white;
}

.card-body-crystal {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-body-crystal h3 {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: white;
}

.card-body-crystal p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.card-meta-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.update-date {
  color: rgba(255, 255, 255, 0.2);
  font-weight: 400;
}

.card-actions-crystal {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.btn-crystal-primary.sm, .btn-crystal-secondary.sm {
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  border-radius: 14px;
  flex: 1;
}

.empty-state-crystal {
  text-align: center;
  max-width: 400px;
  margin: 10rem auto;
}

.empty-icon {
  font-size: 5rem;
  opacity: 0.1;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .library-tools-crystal {
    flex-direction: column;
    align-items: stretch;
    padding: 1.5rem;
  }
}
</style>
