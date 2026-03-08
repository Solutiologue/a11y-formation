<template>
  <div class="tools-page container">
    <header class="tools-header">
      <h1>Liens Utiles</h1>
      <p>Ressources et outils pour votre parcours en accessibilité.</p>
    </header>

    <div class="features-grid">
      <article v-for="(tool, index) in tools" :key="index" class="feature-card">
        <div class="feature-icon">{{ tool.icon }}</div>
        <h3>{{ tool.title }}</h3>
        <p>{{ tool.description }}</p>
        <a :href="tool.url" target="_blank" class="tool-link" rel="noopener noreferrer">
          Visiter le site <span class="sr-only">({{ tool.title }}, nouvelle fenêtre)</span>
        </a>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
const tools = [
  {
    title: 'RGAA 4.1.2',
    description: 'Référentiel Général d\'Amélioration de l\'Accessibilité.',
    url: 'https://www.numerique.gouv.fr/publications/rgaa-accessibilite/',
    icon: '📜'
  },
  {
    title: 'W3C WAI',
    description: 'Directives d\'accessibilité aux contenus web (WCAG).',
    url: 'https://www.w3.org/WAI/',
    icon: '🌐'
  },
  {
    title: 'Color Contrast Analyzer',
    description: 'Outil pour vérifier le contraste des couleurs.',
    url: 'https://www.tpgi.com/color-contrast-checker/',
    icon: '🎨'
  },
  {
    title: 'Wave Web Accessibility',
    description: 'Outil d\'évaluation de l\'accessibilité en ligne.',
    url: 'https://wave.webaim.org/',
    icon: '🧬'
  },
  {
    title: 'NVDA Screen Reader',
    description: 'Lecteur d\'écran libre pour Windows.',
    url: 'https://www.nvaccess.org/',
    icon: '🔊'
  }
];
</script>

<style scoped>
.tools-page {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tools-header {
  text-align: center;
  margin-bottom: 4rem;
}

.tools-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tools-header p {
  color: #b0b0b0;
  font-size: 1.2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: #1a1a2e;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #333;
  transition: transform 0.3s ease, border-color 0.3s ease;
  display: flex;
  flex-direction: column;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: #00d4ff;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

h3 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

p {
  color: #a0a0a0;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
}

.tool-link {
  display: inline-block;
  color: #00d4ff;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.tool-link:hover {
  border-color: #00d4ff;
}

.tool-link:focus {
  outline: 4px solid #e11d48 !important;
  outline-offset: 4px;
}
</style>
