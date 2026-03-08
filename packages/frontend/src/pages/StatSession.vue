<template>
  <div class="stats-page glass-container">
    <div class="container py-5">
      <header class="page-header-crystal mb-5">
        <div class="header-content">
          <div class="badge-crystal">Analytique</div>
          <h1>Performances de Session</h1>
          <p class="subtitle">Analyse de l'engagement et de la progression en temps réel</p>
        </div>
      </header>

      <!-- KPI Overview Crystal -->
      <div class="stats-overview-crystal mb-5">
        <div class="kpi-card-crystal glass-crystal">
          <div class="kpi-icon">👥</div>
          <div class="kpi-data">
            <span class="kpi-value">{{ sessionStats.totalTrainees }}</span>
            <span class="kpi-label">Stagiaires</span>
          </div>
        </div>
        <div class="kpi-card-crystal glass-crystal">
          <div class="kpi-icon">📈</div>
          <div class="kpi-data">
            <span class="kpi-value">{{ sessionStats.progression }}%</span>
            <span class="kpi-label">Progression</span>
          </div>
        </div>
        <div class="kpi-card-crystal glass-crystal">
          <div class="kpi-icon">⭐</div>
          <div class="kpi-data">
            <span class="kpi-value grade-A">{{ sessionStats.engagement }}</span>
            <span class="kpi-label">Engagement</span>
          </div>
        </div>
        <div class="kpi-card-crystal glass-crystal">
          <div class="kpi-icon">📝</div>
          <div class="kpi-data">
            <span class="kpi-value">{{ sessionStats.averageScore }}<small>/20</small></span>
            <span class="kpi-label">Moyenne</span>
          </div>
        </div>
      </div>

      <!-- Graphiques Crystal Grid -->
      <div class="charts-grid mb-5">
        <div class="chart-crystal-container glass-crystal-deep p-4">
          <div class="chart-header mb-4">
            <h3>Activité par Chapitre</h3>
            <div class="chart-legend-simple">
              <span class="dot primary"></span> Temps passé
            </div>
          </div>
          <div class="placeholder-chart bar-chart-crystal">
            <div v-for="i in 5" :key="i" class="bar-crystal-wrapper">
              <div class="bar-crystal" :style="{ height: (40 + i*10) + '%' }">
                <div class="bar-glow"></div>
              </div>
              <span class="bar-label">Ch. {{ i }}</span>
            </div>
          </div>
        </div>

        <div class="chart-crystal-container glass-crystal-deep p-4">
          <div class="chart-header mb-4">
            <h3>Répartition des Scores</h3>
          </div>
          <div class="pie-chart-crystal-wrapper">
            <div class="pie-chart-crystal">
              <div class="pie-segment segment-1"></div>
              <div class="pie-segment segment-2"></div>
              <div class="pie-center"></div>
            </div>
            <div class="pie-legend-crystal">
              <div class="legend-item"><span class="dot success"></span> Excellent (85%+)</div>
              <div class="legend-item"><span class="dot warning"></span> Moyen (60-85%)</div>
              <div class="legend-item"><span class="dot danger"></span> À risque (< 60%)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details List -->
      <div class="details-grid-crystal">
        <section class="card-crystal p-4">
          <div class="card-header-crystal mb-3">
            <div class="icon-circle-crystal primary">🚀</div>
            <h3>Major de Promo</h3>
          </div>
          <div class="stats-list-crystal">
            <div v-for="(trainee, index) in topTrainees" :key="trainee.id" class="list-item-crystal">
              <div class="rank">#{{ index + 1 }}</div>
              <div class="name">{{ trainee.name }}</div>
              <div class="score">{{ trainee.score }}<small>/20</small></div>
              <div class="progress-mini"><div class="fill" :style="{ width: (trainee.score * 5) + '%' }"></div></div>
            </div>
          </div>
        </section>

        <section class="card-crystal p-4">
          <div class="card-header-crystal mb-3">
            <div class="icon-circle-crystal danger">⚠️</div>
            <h3>Points de Vigilance</h3>
          </div>
          <div class="stats-list-crystal">
            <div v-for="chap in difficultChapters" :key="chap.id" class="list-item-crystal warning-style">
              <div class="chapter-info">
                <span class="name">{{ chap.title }}</span>
                <span class="hint">Difficulté détectée</span>
              </div>
              <div class="intensity-badge">{{ chap.difficulty }}%</div>
            </div>
          </div>
          <p class="text-center mt-3 text-muted small italic">Basé sur le taux d'erreur et le temps moyen</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTrainerStore } from '@/stores/trainerStore'
import { apiClient } from '@/utils/api'

const trainerStore = useTrainerStore()

const sessionStats = ref({
  totalTrainees: 24,
  progression: 65,
  engagement: 'A',
  averageScore: 14.5
})

const topTrainees = ref([
  { id: '1', name: 'Alice Martin', score: 18.5 },
  { id: '2', name: 'Jean Dupont', score: 17.2 },
  { id: '3', name: 'Sophie Bernard', score: 16.8 }
])

const difficultChapters = ref([
  { id: 'c3', title: 'Audit Technique RGAA', difficulty: 78 },
  { id: 'c5', title: 'WAI-ARIA Avancé', difficulty: 65 }
])
</script>

<style scoped>
.stats-page {
  min-height: calc(100vh - 80px);
}

.stats-overview-crystal {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.kpi-card-crystal {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border-radius: 24px;
}

.kpi-icon {
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.05);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.kpi-data {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  color: white;
}

.kpi-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 2rem;
}

.chart-header h3 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.bar-chart-crystal {
  height: 250px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 1rem 0;
}

.bar-crystal-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.bar-crystal {
  width: 32px;
  background: linear-gradient(180deg, var(--primary-color) 0%, #1e40af 100%);
  border-radius: 8px 8px 4px 4px;
  position: relative;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bar-glow {
  position: absolute;
  top: 0; left: 0; right: 0; height: 10px;
  background: white;
  opacity: 0.3;
  filter: blur(4px);
  border-radius: 8px;
}

.pie-chart-crystal-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  justify-content: center;
  height: 250px;
}

.pie-chart-crystal {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  position: relative;
  background: rgba(255,255,255,0.05);
  overflow: hidden;
}

.pie-segment {
  position: absolute;
  top: 50%; left: 50%;
  width: 100%; height: 100%;
  transform-origin: 0% 0%;
}

.segment-1 { background: #10b981; transform: rotate(0deg) skewY(-40deg); }
.segment-2 { background: #3b82f6; transform: rotate(140deg) skewY(-50deg); }

.pie-center {
  position: absolute;
  top: 20%; left: 20%; right: 20%; bottom: 20%;
  background: #111;
  border-radius: 50%;
  z-index: 2;
  box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
}

.details-grid-crystal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.list-item-crystal {
  display: grid;
  grid-template-columns: 30px 1fr 60px 80px;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  gap: 1rem;
}

.rank { font-weight: 800; color: var(--primary-color); }
.score { font-weight: 700; text-align: right; }
.progress-mini { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; }
.fill { height: 100%; background: var(--primary-color); border-radius: 2px; }

.warning-style {
  grid-template-columns: 1fr 60px;
}

.intensity-badge {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-weight: 700;
  text-align: center;
}

@media (max-width: 992px) {
  .charts-grid, .details-grid-crystal {
    grid-template-columns: 1fr;
  }
}
</style>
