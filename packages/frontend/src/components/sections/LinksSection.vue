<template>
  <div class="content-section">
    <div class="links-grid">
      <a href="#" class="link-card" target="_blank" rel="noopener">
        <span class="link-icon">📖</span>
        <h3>Ressources pédagogiques</h3>
        <p>Accédez à l'ensemble des ressources de formation</p>
      </a>
      <a href="#" class="link-card" target="_blank" rel="noopener">
        <span class="link-icon">💬</span>
        <h3>Support</h3>
        <p>Contactez l'équipe de support pour toute question</p>
      </a>
      <a href="#" class="link-card" target="_blank" rel="noopener">
        <span class="link-icon">📅</span>
        <h3>Calendrier</h3>
        <p>Consultez les dates importantes et le Planning</p>
      </a>
      <a href="#" class="link-card" target="_blank" rel="noopener">
        <span class="link-icon">📝</span>
        <h3>Documentation</h3>
        <p>Documentation complète de la plateforme</p>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or emits needed for this section
</script>

<style scoped>
.content-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #00d4ff;
  font-weight: 600;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  background: rgba(51, 51, 51, 0.3);
  border: 1px solid #333;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  cursor: pointer;
}

.link-card:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.2);
}

.link-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.link-card h3 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: #00d4ff;
  font-weight: 600;
}

.link-card p {
  font-size: 0.95rem;
  color: #b0b0b0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.3rem;
  }
}
</style>
