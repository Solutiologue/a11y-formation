<!-- src/pages/HomePage.vue -->
<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section 
      class="hero"
      :style="{ backgroundImage: `linear-gradient(rgba(15, 15, 30, 0.85), rgba(15, 15, 30, 0.85)), url(${heroBg})` }"
    >
      <div class="hero-content">
        <h2>Bienvenue sur votre module de formation "Accessibilité Numérique"</h2>
        <p class="hero-subtitle">
          Apprenez l'accessibilité web et créez des applications inclusives
        </p>
        <div class="hero-buttons">
          <router-link
            to="/session"
            class="btn btn-primary"
          >
            Commencer
          </router-link>
          <a
            href="#features"
            class="btn btn-secondary"
          >En savoir plus</a>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section
      id="features"
      class="features"
    >
      <h2>Contenu de la formation</h2>
      <div class="features-grid">
        <article class="feature-card">
          <div class="feature-icon">
            📚
          </div>
          <h3>Fondamentaux et Enjeux</h3>
          <p>Introduction, définitions, les différents types de handicaps et les impacts sur l'usage du numérique.</p>
        </article>

        <article class="feature-card">
          <div class="feature-icon">
            ⚖️
          </div>
          <h3>Régle et Cadre légal</h3>
          <p>Loi de 2005, obligations concrètes, déclaration d'accessibilité et lien entre le RGAA et les WCAG.</p>
        </article>

        <article class="feature-card">
          <div class="feature-icon">
            🗺️
          </div>
          <h3>Structure du RGAA</h3>
          <p>Exploration des 13 thématiques du RGAA : images, formulaires, navigation et contrastes de couleurs.</p>
        </article>

        <article class="feature-card">
          <div class="feature-icon">
            💻
          </div>
          <h3>Intégrer l'accessibilité en dev.</h3>
          <p>HTML sémantique, attributs ARIA, gestion des images et formulaires conformes aux critères RGAA.</p>
        </article>

        <article class="feature-card">
          <div class="feature-icon">
            🧪
          </div>
          <h3>Tester et auditer</h3>
          <p>Méthodologie d'audit, outils (Axe, Wave) et tests réels avec lecteurs d'écran (NVDA, VoiceOver).</p>
        </article>

        <article class="feature-card">
          <div class="feature-icon">
            🏁
          </div>
          <h3>Bilan et perspectives</h3>
          <p>Accessibilité et UX, comment convaincre ses clients et tour d'horizon des métiers de l'inclusion numérique.</p>
        </article>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <h2>Prêt à commencer votre apprentissage ?</h2>
      <p>Si vous êtes actuellement dans une session de formation, cliquez sur le bouton ci-dessous.</p>
      <router-link
        to="/login"
        class="btn btn-primary btn-large"
      >
        Accéder à la plateforme
      </router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
const heroBg = new URL('../assets/hero-bg.jpg', import.meta.url).href
</script>

<style scoped>
/* Hero Section */
.hero {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 8rem 2rem;
  text-align: center;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  max-width: 800px;
  animation: fadeInUp 0.8s ease-out;
}

.hero-content h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  color: #ffffff; /* Pour le contraste RGAA */
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Features Section */
.features {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #0f0f1e;
}

.features h2 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 3rem;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: #1a1a2e;
  padding: 2rem;
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #333;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.feature-card p {
  color: #a0a0a0;
  line-height: 1.6;
}

/* CTA Section */
.cta {
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.cta h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.cta p {
  font-size: 1.1rem;
  color: #b0b0b0;
  margin-bottom: 2rem;
}

/* Buttons */
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
  background-color: transparent;
  color: #00d4ff;
  border: 2px solid #00d4ff;
}

.btn-secondary:hover {
  background-color: #00d4ff;
  color: #0f0f1e;
}

.btn-large {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content h2 {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero {
    padding: 4rem 1rem;
    min-height: 50vh;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .features h2 {
    font-size: 1.8rem;
  }

  .cta h2 {
    font-size: 1.5rem;
  }
}
</style>
