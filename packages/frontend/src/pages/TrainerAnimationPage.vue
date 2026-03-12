<!-- src/pages/TrainerAnimationPage.vue -->
<template>
  <div class="trainer-animation-layout" v-if="trainerStore.isAuthenticated">
    <!-- Header Ultra Fin (Mini-Header) -->
    <header class="session-header">
      <div class="header-left">
        <div class="logo-container">
          <img src="/logo-header.png" alt="A11Y" class="header-logo">
        </div>
        <span class="session-name">Console d'Animation Formateur</span>
      </div>
      <div class="header-right">
        <button @click="handleLogout" class="btn-leave">
          <span class="icon">🚪</span> Quitter la session
        </button>
      </div>
    </header>

    <div class="animation-container">
      <!-- Aside Gauche : Déroulement des chapitres -->
      <aside :class="['chapters-aside', { 'is-collapsed': !isSidebarVisible }]" role="complementary" aria-label="Support de cours">
      <div class="aside-header">
        <div class="aside-header-content">
          <h2>📚 Support de cours</h2>
        </div>
      </div>
      <div class="chapters-list">
        <div 
          v-for="chapter in chapters" 
          :key="chapter.id" 
          :class="['chapter-tile', { active: currentChapter?.id === chapter.id, locked: chapter.isLocked }]"
          @click="selectChapter(chapter)"
        >
          <div class="chapter-info">
            <span class="chapter-order">{{ chapter.order + 1 }}.</span>
            <span class="chapter-title">{{ chapter.title }}</span>
          </div>
          <button 
            class="lock-toggle" 
            :title="chapter.isLocked ? 'Déverrouiller pour les stagiaires' : 'Verrouiller pour les stagiaires'"
            @click.stop="toggleChapterLock(chapter)"
          >
            {{ chapter.isLocked ? '🔒' : '🔓' }}
          </button>
        </div>
      </div>
      
      <!-- Onglet pour rétracter/ouvrir -->
      <button 
        class="sidebar-toggle-tab" 
        @click="isSidebarVisible = !isSidebarVisible"
        :aria-label="isSidebarVisible ? 'Fermer le support de cours' : 'Ouvrir le support de cours'"
        :title="isSidebarVisible ? 'Fermer (Alt+S)' : 'Ouvrir (Alt+S)'"
      >
        <svg v-if="isSidebarVisible" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </aside>

    <!-- Modale : Mode Projection Activé (Focus Helper) --odale : Mode Projection Activé (Focus Helper) -->
    <div 
      v-if="showProjectionActiveModal" 
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="projection-title"
      @keydown="handleModalFocus($event, 'projection')"
    >
      <div class="modal-content glass-crystal projection-active-card">
        <div class="badge-projection">Mode Présentation</div>
        <h2 id="projection-title">La fenêtre de projection est ouverte</h2>
        <p>Le contrôle au clavier s'est probablement déplacé vers la nouvelle fenêtre.</p>
        <p class="hint">Cliquez sur le bouton ci-dessous pour ramener le focus ici et continuer à piloter la formation.</p>
        
        <div class="modal-actions horizontal">
          <button 
            @click="showProjectionActiveModal = false" 
            class="btn-resume-focus"
            aria-label="Reprendre le contrôle ici"
          >
            Reprendre le contrôle
          </button>
        </div>
      </div>
    </div>

    <!-- Main Central : Tableau (Slides) -->
    <main class="slides-main" role="main" ref="slideContainer">
      <!-- Toolbar Animation -->
      <div class="animation-toolbar">
        <div class="toolbar-group">
          <!-- Prev Slide -->
          <button 
            @click="goToPrevSlide" 
            class="toolbar-btn icon-only"
            :disabled="isFirstSlideOverall"
            aria-label="Slide précédente"
            title="Slide précédente"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>

          <!-- Pause / Play -->
          <button 
            @click="togglePause" 
            class="toolbar-btn icon-only"
            :class="{ 'is-active': isPaused }"
            :aria-label="isPaused ? 'Reprendre la session' : 'Mettre la session en pause'"
            :title="isPaused ? 'Reprendre' : 'Pause'"
          >
            <svg v-if="!isPaused" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>

          <!-- Next Slide -->
          <button 
            @click="goToNextSlide" 
            class="toolbar-btn icon-only primary"
            :disabled="isLastSlideOverall"
            aria-label="Slide suivante"
            title="Slide suivante"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>
        </div>

        <div class="toolbar-separator" role="presentation"></div>

        <div class="toolbar-group">
          <!-- Recall Trainees (One-shot) -->
          <button 
            @click="recallTrainees" 
            class="toolbar-btn icon-only"
            :class="{ 'is-active-recall': isRecallActive }"
            aria-label="Rappeler l'attention (force une fois la slide actuelle chez les stagiaires)"
            title="Rappeler tous les stagiaires"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>

          <!-- Double Lock : Verrouiller TOUT -->
          <button 
            @click="confirmLockAll($event)" 
            class="toolbar-btn icon-only danger"
            aria-label="Verrouiller toutes les diapositives"
            title="Verrouiller toutes les diapo."
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon large">
              <!-- Fond : Carré empilé -->
              <rect x="8" y="4" width="12" height="12" rx="2" stroke-opacity="0.3" />
              <!-- Premier plan : Corps du cadenas (le carré devient le corps) -->
              <rect x="5" y="11" width="10" height="8" rx="1.5" stroke-width="2.5" />
              <!-- Anse Fermée -->
              <path d="M6 11V8a4 4 0 0 1 8 0v3" stroke-width="2.5" />
              <!-- Point central -->
              <circle cx="10" cy="15" r="1" fill="currentColor" />
            </svg>
          </button>

          <!-- Double Unlock : Déverrouiller TOUT -->
          <button 
            @click="confirmUnlockAll($event)" 
            class="toolbar-btn icon-only success"
            aria-label="Déverrouiller toutes les diapositives"
            title="Déverrouiller toutes les diapo."
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon large">
              <!-- Fond : Carré empilé -->
              <rect x="8" y="4" width="12" height="12" rx="2" stroke-opacity="0.3" />
              <!-- Premier plan : Corps du cadenas -->
              <rect x="5" y="11" width="10" height="8" rx="1.5" stroke-width="2.5" />
              <!-- Anse Ouverte -->
              <path d="M6 7V5a4 4 0 0 1 4-4h2" stroke-width="2.5" />
              <!-- Point central -->
              <circle cx="10" cy="15" r="1" fill="currentColor" />
            </svg>
          </button>

          <!-- Projection / Dual Screen -->
          <button 
            @click="openProjection" 
            class="toolbar-btn icon-only"
            :class="{ 'is-active': isProjectionOpen }"
            aria-label="Ouvrir la vue projection sur un autre écran"
            title="Mode Projection"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="currentChapter && !isPaused" class="slide-wrapper-container">
        <div class="slide-wrapper" :style="{ transform: `scale(${scale})` }">
          <div class="slide-header">
            <h1 v-if="activeSlideIndex >= 0 && currentChapter.slides?.[activeSlideIndex]">
              {{ currentChapter.slides[activeSlideIndex].title }}
            </h1>
            <h1 v-else>{{ currentChapter.title }}</h1>
          </div>
          <div class="slide-content" ref="slideContent">
            <div v-if="activeSlideIndex >= 0 && currentChapter.slides?.[activeSlideIndex]" 
                 class="slide-real-content" 
                 v-html="currentChapter.slides[activeSlideIndex].content">
            </div>
            <div v-else class="slide-placeholder">
              <p>{{ currentChapter.description || 'Contenu de la slide en cours de chargement...' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay de Pause pour le Formateur -->
      <div v-else-if="isPaused" class="trainer-pause-overlay">
        <div class="pause-status-card">
          <div class="pause-pulse-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h2>Session en pause</h2>
          <div class="pause-timers">
            <div class="timer-countdown main-timer">
              <span class="timer-value large-timer">{{ formatPauseTime(pauseRemainingTime) }}</span>
              <div v-if="pauseEndTime" class="timer-resume-sub">
                Reprise prévue à {{ pauseEndTime }}
              </div>
            </div>
          </div>
          <p>La diffusion est actuellement suspendue pour tous les stagiaires.</p>
          <button @click="stopPause" class="btn-resume-session">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; margin-right: 8px;">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Reprendre la diffusion
          </button>
        </div>
      </div>

      <!-- Modale de réglage de la pause -->
      <div v-if="showPauseSettingsModal" class="modal-overlay">
        <div class="modal-content pause-settings-modal">
          <h2>Configurer la pause</h2>
          <p>Choisissez la durée de la pause à annoncer aux stagiaires.</p>
          
          <div class="duration-selector">
            <div 
              v-for="mins in [5, 10, 15, 45, 60, 90]" 
              :key="mins" 
              class="duration-chip"
              :class="{ active: pauseDuration === mins }"
              @click="pauseDuration = mins"
            >
              {{ mins }} min
            </div>
          </div>

          <div class="custom-duration">
            <label for="pause-input">Durée personnalisée (min) :</label>
            <input 
              id="pause-input"
              type="number" 
              v-model.number="pauseDuration" 
              min="1" 
              max="120"
              class="duration-input"
            />
          </div>

          <div class="modal-actions">
            <button @click="showPauseSettingsModal = false" class="btn-cancel">Annuler</button>
            <button @click="confirmPauseAction" class="btn-confirm">Démarrer la pause</button>
          </div>
        </div>
      </div>

      <div v-if="currentChapter" class="slider-wrapper-fixed-bottom">
        <!-- Slider de navigation en bas -->
        <nav class="presentation-slider" aria-label="Navigation des slides" :class="{ 'is-paused-slider': isPaused }">
          <button 
            @click="goToPrevSlide" 
            class="slider-nav-btn prev" 
            :disabled="isFirstSlideOverall || isPaused"
            title="Précédent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          
          <div class="slider-pages-container" :class="{ 'locked-opacity': isPaused }">
            <!-- Chapô 🏁 toujours au début -->
            <div 
              class="page-box chapo"
              :class="{ 
                active: activeSlideIndex === -1,
                locked: currentChapter.isLocked
              }"
              @click="updateActiveStateInYjs(currentChapter.id, -1)"
            >
              🏁
            </div>

            <!-- Indicateur "Avant" : Nombre de slides masquées avant les 3 slots -->
            <div 
              v-if="activeSlideIndex >= 3" 
              class="slider-more-indicator mini"
              title="Slides précédentes"
            >
              +{{ activeSlideIndex - 2 }}
            </div>

            <!-- Affichage dynamique des 3 slots -->
            <template v-if="activeSlideIndex < 3">
              <!-- Mode Standard : 1, 2, 3 -->
              <div 
                v-for="n in 3" 
                :key="'std-' + n"
                class="page-box-wrapper"
              >
                <div 
                  v-if="currentChapter.slides && currentChapter.slides[n-1]"
                  class="page-box"
                  :class="{ 
                    active: activeSlideIndex === n-1,
                    locked: currentChapter.slides[n-1].isLocked || currentChapter.isLocked
                  }"
                  @click="updateActiveStateInYjs(currentChapter.id, n-1)"
                >
                  {{ n }}
                </div>
                <div v-else class="page-box-spacer"></div>
              </div>
            </template>

            <template v-else>
              <!-- Mode Glissant : On finit par la slide active (ex: sur 4, on montre 2, 3, 4) -->
              <div 
                v-for="idx in [activeSlideIndex - 2, activeSlideIndex - 1, activeSlideIndex]" 
                :key="'slide-' + idx"
                class="page-box-wrapper"
              >
                <div 
                  v-if="currentChapter.slides && currentChapter.slides[idx]"
                  class="page-box"
                  :class="{ 
                    active: activeSlideIndex === idx,
                    locked: currentChapter.slides[idx].isLocked || currentChapter.isLocked
                  }"
                  @click="updateActiveStateInYjs(currentChapter.id, idx)"
                >
                  {{ idx + 1 }}
                </div>
              </div>
            </template>

            <!-- Indicateur "Après" : Nombre de slides restantes ou Chapitre/Session Suivant -->
            <template v-if="currentChapter.slides && activeSlideIndex < currentChapter.slides.length - 1">
              <!-- Si > 3 slides ET qu'il en reste à découvrir hors champ -->
              <template v-if="currentChapter.slides.length > 3 && (activeSlideIndex < 3 ? 3 : activeSlideIndex + 1) < currentChapter.slides.length">
                <div 
                  class="slider-more-indicator mini"
                  title="Slides suivantes"
                >
                  +{{ currentChapter.slides.length - (activeSlideIndex < 3 ? 3 : activeSlideIndex + 1) }}
                </div>
              </template>
              <!-- Si 2 ou 3 slides (ou si on voit tout le reste du chapitre actuel), on affiche déjà l'invitation au chapitre suivant ou à la fin -->
              <template v-else>
                <div 
                  v-if="chapters.findIndex(c => c.id === currentChapter.id) < chapters.length - 1"
                  class="next-chapter-indicator-nu"
                  title="Chapitre Suivant"
                  @click="goToNextSlide"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-chevron-double">
                    <polyline points="13 17 18 12 13 7"></polyline>
                    <polyline points="6 17 11 12 6 7"></polyline>
                  </svg>
                </div>
                <div 
                  v-else
                  class="next-chapter-indicator-nu finish-icon"
                  title="Clôturer la session"
                  @click="handleLogout"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-finish" style="width: 38px; height: 38px;">
                     <!-- Le cercle décalé à droite (cx=15) -->
                     <circle cx="15" cy="12" r="8.5" />
                     <!-- La flèche qui commence bien à gauche (x=1) et entre dans le cercle (s'arrête à x=18) -->
                     <line x1="1" y1="12" x2="18" y2="12" />
                     <polyline points="13 7 18 12 13 17" />
                  </svg>
                </div>
              </template>
            </template>
            <template v-else>
              <!-- Fin de chapitre réelle -->
              <div 
                v-if="chapters.findIndex(c => c.id === currentChapter.id) < chapters.length - 1"
                class="next-chapter-indicator-nu"
                title="Chapitre Suivant"
                @click="goToNextSlide"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-chevron-double">
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </div>
              <!-- FIN DE FORMATION (Dernier chapitre : règle 2-3 slides ou fin de slides) -->
              <div 
                v-else
                class="next-chapter-indicator-nu finish-icon"
                title="Clôturer la session"
                @click="handleLogout"
              >
                <!-- SVG Flèche entrant dans un cercle encore plus gros et décalé -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-finish" style="width: 38px; height: 38px;">
                     <circle cx="15" cy="12" r="8.5" />
                     <line x1="1" y1="12" x2="18" y2="12" />
                     <polyline points="13 7 18 12 13 17" />
                </svg>
              </div>
            </template>
          </div>

          <button 
            @click="goToNextSlide" 
            class="slider-nav-btn next" 
            :disabled="isLastSlideOverall"
            title="Suivant"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </nav>

        <!-- Alerte Main Levée en bas à droite -->
        <Transition name="fade-up">
          <div 
            v-if="traineeRaisingHand" 
            class="hand-raised-alert clickable" 
            :class="{ 'is-reaction': traineeRaisingHand.handRaiseType === 'reaction' }"
            @click="dismissCurrentHand"
          >
            <div class="alert-content">
              <div class="alert-icon-wrapper">
                <svg v-if="traineeRaisingHand.handRaiseType === 'reaction'" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5m-2-1V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v11m-2-4.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8m12-6a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
                </svg>
                <div v-if="totalHandsRaised > 1" class="hands-counter">{{ totalHandsRaised }}</div>
              </div>
              <div class="alert-text-group">
                <div class="alert-text">
                  <span class="trainee-highlight">{{ traineeRaisingHand.firstname }}</span> 
                  {{ traineeRaisingHand.handRaiseType === 'reaction' ? 'souhaite réagir' : 'demande la parole' }}
                </div>
                <div class="alert-hint">cliquez quand vous donnez la parole</div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      <div v-else class="no-chapter-selected">
        <p>Sélectionnez un chapitre pour commencer l'animation.</p>
      </div>
    </main>

    <!-- Aside Droit : Liste des stagiaires actifs -->
    <aside class="trainees-aside" role="complementary" aria-label="Stagiaires connectés">
      <div class="aside-header">
        <h2>👥 Stagiaires ({{ activeTrainees.length }})</h2>
      </div>
      <div class="trainees-list">
        <div 
          v-for="trainee in activeTrainees" 
          :key="trainee.id" 
          class="active-trainee-card"
          :class="{ 'has-hand-raised': trainee.handRaised }"
        >
          <!-- Tooltip Riche au Hover -->
          <div class="trainee-tooltip">
            <div class="tooltip-header">
              <strong>{{ trainee.firstname }} {{ trainee.lastname }}</strong>
              <span class="score-badge">{{ trainee.stats.score20 }}/20</span>
            </div>
            <div class="tooltip-body">
              <div class="stat-row">
                <span>Vigilance (Suivante : <strong>{{ trainee.nextVigilanceDelay }}</strong>)</span>
                <span :class="'grade-' + trainee.stats.vigilance">{{ trainee.stats.vigilance }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-row">
                <span>Assiduité (Synchro vs Autonomie)</span>
                <span :class="'grade-' + trainee.stats.synchro">{{ trainee.stats.synchro }}</span>
              </div>
              <div class="stat-row">
                <span>Engagement Prise de notes</span>
                <span :class="'grade-' + trainee.stats.notes">{{ trainee.stats.notes }}</span>
              </div>
              <div class="stat-row">
                <span>Participation (Questions/Réactions)</span>
                <span :class="'grade-' + trainee.stats.participation">{{ trainee.stats.participation }}</span>
              </div>
            </div>
          </div>

          <div v-if="trainee.handRaised" class="hand-raised-indicator" title="A levé la main">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px;">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5m-2-1V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v11m-2-4.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8m12-6a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
          </div>
          <div class="led-group">
            <div 
              class="led-indicator main" 
              :class="{ 
                'led-green': trainee.isFollowingTrainer && trainee.isVisible && trainee.isFocused && trainee.isAttentive, 
                'led-orange': (!trainee.isFollowingTrainer || !trainee.isVisible || !trainee.isFocused || !trainee.isAttentive) && trainee.isOnline,
                'led-red': !trainee.isOnline
              }"
              :title="trainee.isFollowingTrainer && trainee.isVisible && trainee.isFocused && trainee.isAttentive ? 'Suivi synchrone' : (!trainee.isAttentive ? 'Stagiaire inactif' : (!trainee.isVisible ? 'Onglet inactif' : (!trainee.isFocused ? 'Application en arrière-plan' : 'En autonomie')))"
            ></div>
            <div 
              class="led-indicator secondary" 
              :class="{ 'led-purple': trainee.isTypingNotes, 'led-off': !trainee.isTypingNotes }"
              :title="trainee.isTypingNotes ? 'Écrit dans le bloc-note' : 'Inactif'"
            ></div>
          </div>
          <div class="trainee-info">
            <span class="trainee-name">{{ trainee.firstname }} {{ trainee.lastname }}</span>
            <span class="trainee-status">
              {{ trainee.handRaised ? 'Pose une question' : (!trainee.isAttentive ? 'Stagiaire inactif ⏳' : (!trainee.isVisible ? 'Onglet caché (Passif) 💤' : (!trainee.isFocused ? 'A quitté le navigateur (Distrait) 🔍' : (trainee.isFollowingTrainer ? 'Suivi synchrone' : 'En autonomie')))) }}
            </span>
          </div>
        </div>
        <div v-if="activeTrainees.length === 0" class="no-trainees">
          <p>Aucun stagiaire connecté</p>
        </div>
      </div>
    </aside>
  </div>
</div>
  <div v-else class="unauthorized">
    <p>Vous devez être connecté pour accéder à cette page.</p>
    <router-link to="/trainer" class="btn-primary">Retour à l'accueil</router-link>
  </div>

  <!-- Modal Confirmation Verrouillage Global -->
  <div v-if="showGlobalLockModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="lock-modal-title" @keydown="handleModalFocus($event, 'lock')">
    <div class="modal-content">
      <h2 id="lock-modal-title" class="text-danger">🔒 Tout verrouiller ?</h2>
      <p>Cette action va verrouiller tous les chapitres et toutes les slides pour les stagiaires.</p>
      <p class="hint">Vous serez automatiquement redirigé vers le Chapitre 1 (Chapô).</p>
      <div class="modal-actions horizontal">
        <button @click="processLockAll" class="btn-danger">Confirmer le verrouillage</button>
        <button @click="showGlobalLockModal = false" class="btn-cancel">Annuler</button>
      </div>
    </div>
  </div>

  <!-- Modal Confirmation Déverrouillage Global -->
  <div v-if="showGlobalUnlockModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="unlock-modal-title" @keydown="handleModalFocus($event, 'unlock')">
    <div class="modal-content">
      <h2 id="unlock-modal-title" class="text-success">🔓 Tout déverrouiller ?</h2>
      <p>Cette action va rendre l'intégralité du support de cours accessible en autonomie pour tous les stagiaires.</p>
      <div class="modal-actions horizontal">
        <button @click="processUnlockAll" class="btn-success">Confirmer l'ouverture</button>
        <button @click="showGlobalUnlockModal = false" class="btn-cancel">Annuler</button>
      </div>
    </div>
  </div>

  <!-- Modal Choix de Reprise (Session Avancée ou En Pause) -->
  <div v-if="showResumeChoiceModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="resume-modal-title">
    <div class="modal-content overflow-visible">
      <h2 id="resume-modal-title">🔄 Reprise du cours</h2>
      <p>La session est actuellement en pause au chapitre <strong>{{ chapters.find(c => c.id === pendingResumeState?.chapterId)?.title || '...' }}</strong>.</p>
      <div class="session-info">
        <p>Souhaitez-vous reprendre le cours là où vous vous êtes arrêté ou recommencer depuis le début ?</p>
      </div>
      <div class="modal-actions column center">
        <button @click="resumeAtLastActive" class="btn-primary full-width" autofocus>Reprendre le cours</button>
        <div class="modal-actions horizontal full-width no-margin">
          <button @click="resumeAtStart" class="btn-cancel">Reprendre du début</button>
          <button @click="router.push('/trainer/gestion')" class="btn-cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Confirmation de Sortie -->
  <div v-if="showExitConfirmModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="exit-modal-title">
    <div class="modal-content overflow-visible">
      <h2 id="exit-modal-title">🚪 Quitter la salle ?</h2>
      <p>Voulez-vous mettre la session en pause (les stagiaires resteront connectés mais tout sera verrouillé) ou fermer définitivement la salle ?</p>
      <div class="modal-actions column center">
        <button @click="pauseAndExit" class="btn-primary full-width">Mettre en pause et sortir</button>
        <div class="modal-actions horizontal full-width no-margin">
          <button @click="closeGlobalSession" class="btn-danger">Fermer la salle</button>
          <button @click="showExitConfirmModal = false" class="btn-cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Session Dupliquée (Sécurité) -->
  <div v-if="showSessionDuplicateModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="duplicate-modal-title">
    <div class="modal-content">
      <h2 id="duplicate-modal-title" class="text-danger">⚠️ Une seule fenêtre d'animation autorisée</h2>
      <p>Vous avez déjà ouvert la console de contrôle de la formation dans un autre onglet ou une autre fenêtre.</p>
      <div class="session-info">
        <p>Pour éviter les conflits de navigation et de synchronisation, veuillez n'utiliser qu'un seul onglet pour animer la session.</p>
      </div>
      <div class="modal-actions">
        <button @click="router.push('/trainer/gestion')" class="btn-primary">Retour à la gestion</button>
      </div>
    </div>
  </div>

  <!-- Modal Ouverture de Session -->
  <div v-if="showStartSessionModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="session-modal-title">
    <div class="modal-content overflow-visible">
      <h2 id="session-modal-title">🚀 Prêt à démarrer ?</h2>
      <p>Bienvenue Thierry ! Votre session <strong>A11Y2026</strong> est configurée.</p>
      <div class="session-info">
        <p>Lors de l'ouverture :</p>
        <ul>
          <li>Tous les chapitres seront initialement verrouillés.</li>
          <li>Ils se déverrouilleront automatiquement au fur et à mesure de votre progression.</li>
          <li>Les stagiaires connectés seront notifiés en temps réel.</li>
        </ul>
      </div>
      <div class="modal-actions">
        <button @click="startSession" class="btn-primary" autofocus>Ouvrir la session aux stagiaires</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTrainerStore } from '@/stores/trainerStore'
import { apiClient } from '@/utils/api'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

const router = useRouter()
const trainerStore = useTrainerStore()

// Yjs Collaboration State
const ydoc = new Y.Doc()
let provider: WebrtcProvider | null = null
let syncInterval: any = null
const sharedChapters = ydoc.getMap<boolean>('chapters_lock') // chapterId -> isLocked
const sharedActiveState = ydoc.getMap<any>('active_presentation_state') // { activeChapterId: string, activeSlideIndex: number }

// Synchronisation périodique de l'état des verrous (toutes les 30s)
const startSyncInterval = () => {
  if (syncInterval) clearInterval(syncInterval)
  syncInterval = setInterval(() => {
    if (sharedActiveState && chapters.value) {
      // Émettre un signal de synchronisation forcée
      sharedActiveState.set('forceSync', Date.now())
      
      // S'assurer que tous les verrous de chapitres sont à jour
      chapters.value.forEach(chap => {
        sharedChapters.set(chap.id, !!chap.isLocked)
        
        // S'assurer que les verrous de slides sont à jour
        const slideLocks = ydoc.getMap<boolean[]>(`slides_lock_${chap.id}`)
        if (chap.slides) {
          slideLocks.set('locks', chap.slides.map((s: any) => !!s.isLocked))
        }
      })
      console.log('🔄 Synchronisation périodique des verrous envoyée aux stagiaires')
    }
  }, 30000)
}

// State
const chapters = ref<any[]>([])
const activeChapterId = ref<string | null>(null)
const activeSlideIndex = ref(0)
const isPaused = ref(false)
const pauseDuration = ref(15) // Par défaut 15 min
const showPauseSettingsModal = ref(false)
const pauseRemainingTime = ref(0)
const pauseEndTime = ref<string | null>(null)
let pauseCountdownInterval: any = null

const togglePause = () => {
  if (!isPaused.value) {
    // On veut mettre en pause : ouvrir la modale de réglage
    showPauseSettingsModal.value = true
  } else {
    // On veut arrêter la pause
    stopPause()
  }
}

const confirmPause = () => {
  const durationMs = pauseDuration.value * 60 * 1000
  const endTs = Date.now() + durationMs
  const endStr = new Date(endTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  isPaused.value = true
  pauseEndTime.value = endStr
  pauseRemainingTime.value = durationMs
  showPauseSettingsModal.value = false
  
  // Sync Yjs
  sharedActiveState.set('isPaused', 'true')
  sharedActiveState.set('pauseEndTime', endStr)
  
  startPauseCountdown()
}

const stopPause = () => {
  isPaused.value = false
  pauseEndTime.value = null
  pauseRemainingTime.value = 0
  if (pauseCountdownInterval) clearInterval(pauseCountdownInterval)
  
  // Sync Yjs
  sharedActiveState.set('isPaused', 'false')
  sharedActiveState.set('pauseEndTime', null)
}

const startPauseCountdown = () => {
  if (pauseCountdownInterval) clearInterval(pauseCountdownInterval)
  pauseCountdownInterval = setInterval(() => {
    if (pauseRemainingTime.value > 0) {
      pauseRemainingTime.value -= 1000
    } else {
      // Fin du décompte mais on ne relance pas auto comme demandé
      pauseRemainingTime.value = 0
    }
  }, 1000)
}

const formatPauseTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}' ${secs.toString().padStart(2, '0')}''`
}

const isRecallActive = ref(false)
const isProjectionOpen = ref(false)
let recallTimer: any = null
const slideContainer = ref<HTMLElement | null>(null)
const slideContent = ref<HTMLElement | null>(null)
const scale = ref(1)
const showStartSessionModal = ref(false)
const isSessionStarted = ref(false)
const isSidebarVisible = ref(true)

// Modales Global Lock/Unlock
const showGlobalLockModal = ref(false)
const showGlobalUnlockModal = ref(false)
const showProjectionActiveModal = ref(false)
const showSessionDuplicateModal = ref(false)
const showResumeChoiceModal = ref(false)
const showExitConfirmModal = ref(false)
const pendingResumeState = ref<{ chapterId: string | null, slideIndex: number } | null>(null)
const lastFocusedElement = ref<HTMLElement | null>(null)

const confirmLockAll = (event: MouseEvent) => {
  lastFocusedElement.value = event.currentTarget as HTMLElement
  showGlobalLockModal.value = true
}

const confirmUnlockAll = (event: MouseEvent) => {
  lastFocusedElement.value = event.currentTarget as HTMLElement
  showGlobalUnlockModal.value = true
}

// Gestion du Focus Trap pour l'accessibilité
const handleModalFocus = (e: KeyboardEvent, modalRef: string) => {
  if (e.key === 'Escape') {
    if (modalRef === 'lock') showGlobalLockModal.value = false
    if (modalRef === 'unlock') showGlobalUnlockModal.value = false
    if (modalRef === 'projection') showProjectionActiveModal.value = false
    return
  }

  // Navigation aux flèches (Gauche/Droite) simulant le Tab pour une meilleure ergonomie
  const isArrowKey = e.key === 'ArrowRight' || e.key === 'ArrowLeft'
  if (e.key !== 'Tab' && !isArrowKey) return

  const modal = document.querySelector('.modal-overlay[aria-modal="true"]')
  if (!modal) return

  const focusableElements = Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')) as HTMLElement[]
  const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  // Logique de navigation circulaire
  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  } else if (isArrowKey) {
    e.preventDefault() // Empêche le scroll éventuel
    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % focusableElements.length
      focusableElements[nextIndex].focus()
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length
      focusableElements[prevIndex].focus()
    }
  }
}

watch(showStartSessionModal, (val) => {
  if (val) {
    nextTick(() => {
      // Pour la modale de démarrage, on cible le bouton de confirmation
      const startBtn = document.querySelector('.btn-success-glass, .btn-primary') as HTMLElement
      startBtn?.focus()
    })
  } else {
    lastFocusedElement.value?.focus()
  }
})

watch(showGlobalLockModal, (val) => {
  if (val) {
    nextTick(() => {
      const cancelBtn = document.querySelector('.btn-cancel') as HTMLElement
      cancelBtn?.focus()
    })
  } else {
    lastFocusedElement.value?.focus()
  }
})

watch(showGlobalUnlockModal, (val) => {
  if (val) {
    nextTick(() => {
      const cancelBtn = document.querySelector('.btn-cancel') as HTMLElement
      cancelBtn?.focus()
    })
  } else {
    lastFocusedElement.value?.focus()
  }
})

watch(showProjectionActiveModal, (val) => {
  if (val) {
    nextTick(() => {
      const resumeBtn = document.querySelector('.btn-resume-focus') as HTMLElement
      resumeBtn?.focus()
    })
  } else {
    lastFocusedElement.value?.focus()
  }
})

const processLockAll = async () => {
  showGlobalLockModal.value = false
  
  // 1. Verrouiller tout en local
  for (const chapter of chapters.value) {
    chapter.isLocked = true
    sharedChapters.set(chapter.id, true)
    apiClient.patch(`/chapters/${chapter.id}`, { isLocked: true }).catch(console.error)
    
    if (chapter.slides) {
      const slideLocksKey = `slides_lock_${chapter.id}`
      const slideLocks = ydoc.getMap<boolean[]>(slideLocksKey)
      const locks = chapter.slides.map(() => true)
      slideLocks.set('locks', locks)

      for (const slide of chapter.slides) {
        slide.isLocked = true
        sharedChapters.set(`slide_lock_${slide.id}`, true)
        apiClient.patch(`/chapters/slides/${slide.id}`, { isLocked: true }).catch(console.error)
      }
    }
  }

  // 2. Revenir au Chapitre 1 (Chapô)
  if (chapters.value.length > 0) {
    updateActiveStateInYjs(chapters.value[0].id, -1)
  }
}

const processUnlockAll = async () => {
  showGlobalUnlockModal.value = false
  
  for (const chapter of chapters.value) {
    chapter.isLocked = false
    sharedChapters.set(chapter.id, false)
    apiClient.patch(`/chapters/${chapter.id}`, { isLocked: false }).catch(console.error)
    
    if (chapter.slides) {
      const slideLocksKey = `slides_lock_${chapter.id}`
      const slideLocks = ydoc.getMap<boolean[]>(slideLocksKey)
      const locks = chapter.slides.map(() => false)
      slideLocks.set('locks', locks)

      for (const slide of chapter.slides) {
        slide.isLocked = false
        sharedChapters.set(`slide_lock_${slide.id}`, false)
        apiClient.patch(`/chapters/slides/${slide.id}`, { isLocked: false }).catch(console.error)
      }
    }
  }
}

// Observer les changements de visibilité de la sidebar pour recalculer le zoom
watch(isSidebarVisible, () => {
  setTimeout(updateScale, 450) // Attendre la fin de l'animation CSS du panel (400ms)
})

// Surveillance du verrouillage accidentel du chapitre/slide actuel
watch([chapters, activeChapterId, activeSlideIndex], () => {
  if (!activeChapterId.value || !chapters.value.length) return
  
  const currentChapter = chapters.value.find(c => c.id === activeChapterId.value)
  if (!currentChapter) return

  let isCurrentLocked = false
  
  // 1. Si le chapitre actuel est verrouillé
  if (currentChapter.isLocked) {
    isCurrentLocked = true
  } 
  // 2. Ou si la slide actuelle est verrouillée
  else if (activeSlideIndex.value >= 0) {
    const currentSlide = currentChapter.slides?.[activeSlideIndex.value]
    if (currentSlide?.isLocked) {
      isCurrentLocked = true
    }
  }

  // Si verrouillé d'un coup (ex: changement Yjs externe), on redirige vers le dernier élément débloqué
  if (isCurrentLocked) {
    console.warn('Chapitre ou slide actuel verrouillé ! Redirection vers le dernier élément déverrouillé...')
    
    let lastUnlockedChapterId = null
    let lastUnlockedSlideIndex = -1

    // Parcourir pour trouver le PK (dernier chapitre déverrouillé et sa dernière slide déverrouillée)
    let foundChapterId = null
    let foundSlideIndex = -1

    for (const chapter of chapters.value) {
      if (chapter.isLocked) break
      
      foundChapterId = chapter.id
      foundSlideIndex = -1 // On commence par le chapô du chapitre

      if (chapter.slides && chapter.slides.length > 0) {
        for (let i = 0; i < chapter.slides.length; i++) {
          if (chapter.slides[i].isLocked) break
          foundSlideIndex = i // On avance jusqu'à la dernière slide déverrouillée
        }
      }
    }

    if (foundChapterId !== null) {
      // On force la navigation vers la position de repli la plus avancée
      updateActiveStateInYjs(foundChapterId, foundSlideIndex)
    }
  }
}, { deep: true })

const allChaptersLocked = computed(() => {
  // On ne déclenche plus la modale de fin de session automatiquement au chargement
  if (showResumeChoiceModal.value || showStartSessionModal.value || !isSessionStarted.value) return false
  return chapters.value.length > 0 && chapters.value.every(c => !!c.isLocked)
})

const currentChapter = computed(() => {
  return chapters.value.find(c => c.id === activeChapterId.value)
})

const isFirstSlideOverall = computed(() => {
  if (!chapters.value.length || !activeChapterId.value) return true
  const firstChapter = chapters.value[0]
  return activeChapterId.value === firstChapter.id && activeSlideIndex.value === -1
})

const isLastSlideOverall = computed(() => {
  if (!chapters.value.length || !activeChapterId.value) return true
  const lastChapter = chapters.value[chapters.value.length - 1]
  const lastSlideIdx = (lastChapter.slides?.length || 0) - 1
  return activeChapterId.value === lastChapter.id && activeSlideIndex.value === lastSlideIdx
})

const updateActiveStateInYjs = async (chapterId: string | null, slideIndex: number) => {
  activeChapterId.value = chapterId
  activeSlideIndex.value = slideIndex
  
  sharedActiveState.set('activeChapterId', chapterId)
  sharedActiveState.set('activeSlideIndex', slideIndex)

  // Déverrouillage en cascade : libère tout ce qui précède la slide cliquée (chapitres et slides)
  if (chapterId) {
    for (const chapter of chapters.value) {
      const isCurrentChapter = chapter.id === chapterId
      
      // 1. Déverrouiller le chapitre s'il est encore verrouillé
      if (chapter.isLocked) {
        chapter.isLocked = false
        sharedChapters.set(chapter.id, false)
        apiClient.patch(`/chapters/${chapter.id}`, { isLocked: false }).catch(e => console.error('Error auto-unlock chapter:', e))
      }

      // 2. Déverrouiller les slides en cascade
      if (chapter.slides) {
        // Logique spécifique : soit on débloque toutes les slides si chapitre passé, soit jusqu'à l'actuelle
        const slideLocksKey = `slides_lock_${chapter.id}`
        const slideLocks = ydoc.getMap<boolean[]>(slideLocksKey)
        const currentLocksArray = slideLocks.get('locks') || (chapter.slides || []).map(() => true)
        let changed = false

        for (let i = 0; i < currentLocksArray.length; i++) {
          // MODIFICATION : On ne déverrouille que si on est sur une slide (index >= 0)
          // Si on est sur le chapô (index -1), i <= slideIndex sera toujours faux, donc pas de déblocage de slide 1.
          const shouldUnlock = !isCurrentChapter || (slideIndex >= 0 && i <= slideIndex)
          
          if (shouldUnlock && currentLocksArray[i] !== false) {
            currentLocksArray[i] = false
            // Mise à jour locale immédiate pour le slider (important pour le look)
            const slide = chapter.slides[i]
            if (slide) {
              slide.isLocked = false
              sharedChapters.set(`slide_lock_${slide.id}`, false)
              apiClient.patch(`/chapters/slides/${slide.id}`, { isLocked: false }).catch(e => console.error(`Error auto-unlock slide ${slide.id}:`, e))
            }
            changed = true
          }
        }

        if (changed) {
          slideLocks.set('locks', [...currentLocksArray])
        }
      }

      // Si on a atteint le chapitre cible, on s'arrête là (on ne déverrouille pas l'avenir)
      if (isCurrentChapter) break
    }
  }
  
  nextTick(() => {
    updateScale()
  })
}

const goToNextSlide = async () => {
  if (!currentChapter.value) return
  
  if (activeSlideIndex.value === -1) {
    // On passe de la chapô à la première vraie slide
    updateActiveStateInYjs(activeChapterId.value!, 0)
  } else if (currentChapter.value.slides && activeSlideIndex.value < currentChapter.value.slides.length - 1) {
    // On passe à la slide suivante dans le chapitre actuel
    updateActiveStateInYjs(activeChapterId.value!, activeSlideIndex.value + 1)
  } else {
    // Passer au chapitre suivant
    const currentIndex = chapters.value.findIndex(c => c.id === activeChapterId.value)
    if (currentIndex < chapters.value.length - 1) {
      const nextChapter = chapters.value[currentIndex + 1]
      
      // Si le chapitre suivant est locké, on le délocke (ce qui délockera aussi sa 1ère slide via toggleChapterLock)
      if (nextChapter.isLocked) {
        await toggleChapterLock(nextChapter)
      } else {
        // Sinon on y va simplement (sur sa chapô)
        updateActiveStateInYjs(nextChapter.id, -1)
      }
    }
  }
}

const goToPrevSlide = () => {
  if (!currentChapter.value) return
  
  if (activeSlideIndex.value > 0) {
    updateActiveStateInYjs(activeChapterId.value!, activeSlideIndex.value - 1)
  } else if (activeSlideIndex.value === 0) {
    // Retour à la chapô
    updateActiveStateInYjs(activeChapterId.value!, -1)
  } else {
    // Revenir au chapitre précédent, dernière slide
    const currentIndex = chapters.value.findIndex(c => c.id === activeChapterId.value)
    if (currentIndex > 0) {
      const prevChapter = chapters.value[currentIndex - 1]
      const lastSlideIndex = (prevChapter.slides?.length || 1) - 1
      updateActiveStateInYjs(prevChapter.id, lastSlideIndex)
    }
  }
}

const unpauseSession = () => {
  isPaused.value = false
  sharedActiveState.set('isPaused', 'false')
  sharedActiveState.set('sessionStatus', 'opened')
}

const resetSession = async () => {
  // 1. Verrouiller tous les chapitres
  for (const chapter of chapters.value) {
    if (!chapter.isLocked) {
      chapter.isLocked = true
      sharedChapters.set(chapter.id, true)
      apiClient.patch(`/chapters/${chapter.id}`, { isLocked: true }).catch(() => {})
      
      // Verrouiller toutes les slides du chapitre
      const slideLocks = ydoc.getMap<boolean[]>(`slides_lock_${chapter.id}`)
      const locks = (chapter.slides || []).map(() => true)
      slideLocks.set('locks', locks)
    }
  }

  // 2. Remettre l'état actif au début
  if (chapters.value.length > 0) {
    updateActiveStateInYjs(chapters.value[0].id, -1)
  }

  // 3. FORCER LA SYNCHRONISATION de tous les stagiaires
  // On envoie un signal fort via Yjs qui sera intercepté par les stagiaires
  sharedActiveState.set('forceSync', Date.now())
  
  // Petit message de confirmation (optionnel si on utilise déjà confirm avant l'appel)
  console.log('Session réinitialisée et synchronisation forcée.')
}

const closeGlobalSession = async () => {
  // 1. Notifier via Yjs (les stagiaires recevront ce statut via awareness/sharedActiveState)
  sharedActiveState.set('sessionStatus', 'closed')
  
  // 2. Attendre un court instant pour que le message Yjs soit propagé avant de couper le provider
  setTimeout(async () => {
    // 3. Déconnecter proprement Yjs
    if (provider) {
      provider.disconnect()
    }
    
    // 4. Rediriger le formateur vers son tableau de bord
    router.push('/trainer')
  }, 500)
}

const trainees = ref<any[]>([])
const activeTrainees = ref<any[]>([])
const dismissedHands = ref<Set<string>>(new Set())

const traineeRaisingHand = computed(() => {
  // Filtrer les stagiaires qui ont la main levée ET n'ont pas encore été "cliqués" (dismissed)
  const raising = activeTrainees.value
    .filter(t => t.handRaised && !dismissedHands.value.has(t.id))
    .sort((a, b) => (a.handRaisedAt || 0) - (b.handRaisedAt || 0)) // Ordre d'arrivée
  
  return raising[0] || null
})

const totalHandsRaised = computed(() => {
  return activeTrainees.value.filter(t => t.handRaised && !dismissedHands.value.has(t.id)).length
})

const dismissCurrentHand = async () => {
  const current = traineeRaisingHand.value
  if (current) {
    // 1. Ajouter à la liste locale des mains ignorées pour passer à la suivante
    dismissedHands.value.add(current.id)

    // 2. LOG ACTIVITÉ : Prise de parole accordée
    try {
      apiClient.post('/activities', {
        type: 'SPEAKING_GRANTED',
        traineeId: current.id,
        sessionId: route.params.sessionId,
        metadata: {
          chapterId: activeChapterId.value,
          slideIndex: activeSlideIndex.value,
          trainerId: trainerStore.trainer?.id
        }
      })
    } catch (err) {
      console.error('Failed to log speaking granted:', err)
    }

    // 3. Envoyer un signal au stagiaire spécifique pour baisser sa main via awareness
    if (provider) {
      // On utilise un champ spécifique 'lowerHandRequest' pour cibler le stagiaire
      provider.awareness.setLocalStateField('lowerHandRequest', {
        traineeId: current.id,
        timestamp: Date.now()
      })

      // Réinitialiser après un court délai pour permettre un futur signal identique
      setTimeout(() => {
        if (provider) {
          provider.awareness.setLocalStateField('lowerHandRequest', null)
        }
      }, 1000)
    }
  }
}

// Yjs Awareness pour la présence en temps réel
const setupAwareness = () => {
  if (!provider) return

  // Signaler la présence du formateur avec un identifiant de client unique pour cette fenêtre
  provider.awareness.setLocalStateField('user', {
    id: trainerStore.currentTrainer?.id,
    firstname: trainerStore.currentTrainer?.firstname,
    lastname: trainerStore.currentTrainer?.lastname,
    role: 'trainer',
    isOnline: true,
    clientId: ydoc.clientID // On utilise le clientID unique de cette session Yjs
  })

  provider.awareness.on('change', () => {
    const states = provider.awareness.getStates()
    const activeList: any[] = []
    
    // Vérification de duplication de session formateur
    let trainerCount = 0
    let firstTrainerClientId: number | null = null

    states.forEach((state: any, clientIDSource: number) => {
      if (state.user && state.user.role === 'trainer') {
        trainerCount++
        if (firstTrainerClientId === null || clientIDSource < firstTrainerClientId) {
          firstTrainerClientId = clientIDSource
        }
      }
    })

    // Si on détecte plus d'un formateur et qu'on n'est pas le "premier" (celui avec le plus petit clientID)
    if (trainerCount > 1 && ydoc.clientID !== firstTrainerClientId) {
      showSessionDuplicateModal.value = true
    } else {
      showSessionDuplicateModal.value = false
    }

    // Nettoyer les dismissedHands si le stagiaire baisse la main ou se déconnecte
    const currentTraineeIds = new Set<string>()

    states.forEach((state: any, clientID: number) => {
      if (state.user && state.user.role === 'trainee') {
        const id = state.user.id || `anon-${clientID}`
        currentTraineeIds.add(id)
        
        // Si le stagiaire a baissé sa main (handRaised === false), on le retire des ignorés
        if (!state.handRaised && dismissedHands.value.has(id)) {
          dismissedHands.value.delete(id)
        }

        activeList.push({
          id,
          clientID,
          firstname: state.user.firstname || 'Anonyme',
          lastname: state.user.lastname || '',
          isOnline: true,
          isVisible: state.user.isVisible !== false,
          isFocused: state.user.isFocused !== false,
          isAttentive: state.user.isAttentive !== false,
          isFollowingTrainer: state.user.isFollowingTrainer,
          isTypingNotes: state.user.isTypingNotes,
          handRaised: state.handRaised === true,
          handRaisedAt: state.handRaisedAt || 0,
          handRaiseType: state.handRaiseType || 'question',
          currentChapterId: state.user.currentChapterId,
          currentSlideIndex: state.user.currentSlideIndex,
          // Données de vigilance et stats (simulées ou réelles via awareness)
          nextVigilanceDelay: state.user.nextVigilanceDelay || '1 min',
          stats: calculateTraineeStats(state)
        })
      }
    })

    // Nettoyer les IDs de stagiaires déconnectés
    dismissedHands.value.forEach(id => {
      if (!currentTraineeIds.has(id)) {
        dismissedHands.value.delete(id)
      }
    })

    activeTrainees.value = activeList
  })
}

// Algorithme de calcul des statistiques et de la note sur 20
const calculateTraineeStats = (state: any) => {
  const s = state.user || {}
  
  // 1. Note Synchro (Pondération 25%)
  const synchroScore = (s.syncRatio || 0.8) * 100
  const getSynchroGrade = (score: number) => score > 80 ? 'A' : score > 60 ? 'B' : score > 40 ? 'C' : 'D'
  
  // 2. Note Vigilance Avancée (Pondération 35%)
  // Base : 100 points
  // Malus par toast inactivité manqué : -20 points
  // Malus par perte de focus ou onglet caché (si prolongé/répété) : -5 points par événement
  const failedToastsMalus = (s.failedVigilanceCount || 0) * 20
  const distractionsCount = (s.distractionCount || 0)
  
  // Prise en compte de la durée totale de distraction (en secondes)
  // Pénalité de -1 point par minute de distraction (60s)
  const totalDistractionTime = (s.totalDistractionTime || 0)
  const durationMalus = Math.floor(totalDistractionTime / 60)
  
  const isCurrentlyDistracted = (!s.isVisible || !s.isFocused) ? 10 : 0 // Pénalité temporaire si distrait en direct
  
  const vigilanceScore = Math.max(0, 100 - failedToastsMalus - (distractionsCount * 5) - durationMalus - isCurrentlyDistracted)
  const getVigilanceGrade = (score: number) => score > 85 ? 'A' : score > 70 ? 'B' : score > 50 ? 'C' : 'D'
  
  // 3. Note Prise de Notes (Pondération 20%)
  const notesCharCount = s.notesCharCount || 0
  const notesScore = Math.min(notesCharCount / 10, 100)
  const getNotesGrade = (score: number) => {
    if (notesCharCount === 0) return 'E'
    return score > 80 ? 'A' : score > 50 ? 'B' : score > 20 ? 'C' : 'D'
  }
  
  // 4. Note Participation (Pondération 20%)
  const participationCount = s.participationCount || 0
  const participationScore = Math.min(participationCount * 25, 100)
  const getParticipationGrade = (score: number) => {
    if (participationCount === 0) return 'E'
    return score > 75 ? 'A' : score > 50 ? 'B' : score > 25 ? 'C' : 'D'
  }
  
  // Algorithme de note finale sur 20
  // Nouvelle répartition : (Synchro*0.25 + Vigilance*0.35 + Notes*0.2 + Participation*0.2) / 5
  const finalScoreRaw = (synchroScore * 0.25) + (vigilanceScore * 0.35) + (notesScore * 0.2) + (participationScore * 0.2)
  const finalGrade20 = (finalScoreRaw / 5).toFixed(1)
  
  return {
    synchro: getSynchroGrade(synchroScore),
    vigilance: getVigilanceGrade(vigilanceScore),
    notes: getNotesGrade(notesScore),
    participation: getParticipationGrade(participationScore),
    score20: finalGrade20
  }
}

const updateScale = () => {
  if (!slideContainer.value) return

  // On prend les dimensions réelles du parent .slides-main
  const containerWidth = slideContainer.value.clientWidth - 40 // Réduction des marges
  const containerHeight = slideContainer.value.clientHeight - 40
  
  // Format standard slide 16/9
  const baseWidth = 1920
  const baseHeight = 1080

  const scaleX = containerWidth / baseWidth
  const scaleY = containerHeight / baseHeight
  
  // On force le ratio le plus petit pour que TOUT soit visible sans scroll
  scale.value = Math.min(scaleX, scaleY)
}

const isModalOpen = computed(() => {
  return showGlobalLockModal.value || 
         showGlobalUnlockModal.value || 
         showStartSessionModal.value || 
         showProjectionActiveModal.value ||
         showSessionDuplicateModal.value ||
         showResumeChoiceModal.value ||
         showExitConfirmModal.value ||
         (isSessionStarted.value && allChaptersLocked.value)
})

const handleLogout = () => {
  showExitConfirmModal.value = true
}

const pauseAndExit = () => {
  // On met en pause la session (verrouille tout pour les stagiaires)
  isPaused.value = true
  sharedActiveState.set('isPaused', 'true')
  sharedActiveState.set('sessionStatus', 'paused')
  
  // On quitte
  router.push('/trainer')
}

const handleKeyDown = (e: KeyboardEvent) => {
  // Désactiver les raccourcis de navigation si une modale est ouverte (accessibilité RGAA)
  if (isModalOpen.value) return

  // Ignorer si on tape dans un champ de saisie (si on en ajoute un plus tard)
  if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

  // Alt+S : Démarrer/Arrêter la session (Toggle Pause dans cette vue)
  if (e.altKey && (e.key === 's' || e.key === 'S')) {
    e.preventDefault()
    togglePause()
    return
  }

  // Alt+P : Lancer la projection
  if (e.altKey && (e.key === 'p' || e.key === 'P')) {
    e.preventDefault()
    openProjection()
    return
  }

  // Alt+A : Activité suivante (Slide suivante)
  if (e.altKey && (e.key === 'a' || e.key === 'A')) {
    e.preventDefault()
    goToNextSlide()
    return
  }

  // Alt+R : Réinitialiser la session (Remise à zéro)
  if (e.altKey && (e.key === 'r' || e.key === 'R')) {
    e.preventDefault()
    if (confirm('Voulez-vous vraiment réinitialiser la session ? Cela verrouillera tous les chapitres et ramènera tout le monde au début.')) {
      resetSession()
    }
    return
  }

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault()
      goToNextSlide()
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault()
      goToPrevSlide()
      break
    case ' ': // Barre espace pour suivant
      e.preventDefault()
      goToNextSlide()
      break
  }
}

const handleMessage = (event: MessageEvent) => {
  if (event.data === 'resume-focus') {
    // On ferme la modale
    showProjectionActiveModal.value = false
    
    // On force un refocus global sur la fenêtre
    window.focus()
    
    // On attend un cycle de rendu pour être sûr que la modale est partie
    nextTick(() => {
      if (lastFocusedElement.value) {
        lastFocusedElement.value.focus()
      } else {
        // Fallback sur le body pour capturer les événements clavier
        document.body.focus()
      }
    })
  }
}

onMounted(async () => {
  if (!trainerStore.isAuthenticated) {
    router.push('/trainer')
    return
  }

  // Écouteurs globaux
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('message', handleMessage)

  // Initialiser Yjs pour la collaboration
  const sessionId = trainerStore.currentTrainer?.sessionId
  if (sessionId) {
    provider = new WebrtcProvider(`a11y-session-${sessionId}`, ydoc, {
      signaling: ['wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com']
    })
    
    // Observer les changements de verrouillage partagés
    sharedChapters.observe((event) => {
      event.keysChanged.forEach(key => {
        const isLocked = sharedChapters.get(key)
        
        // 1. Verrouillage de chapitre
        const chapter = chapters.value.find(c => c.id === key)
        if (chapter) {
          chapter.isLocked = isLocked
        }

        // 2. Verrouillage de slide spécifique (format slide_lock_ID)
        if (key.startsWith('slide_lock_')) {
          const slideId = key.replace('slide_lock_', '')
          chapters.value.forEach(chap => {
            const slide = chap.slides?.find((s: any) => s.id === slideId)
            if (slide) {
              slide.isLocked = isLocked
            }
          })
        }
      })
    })

    // Observer les changements dans les Maps de slides par chapitre
    ydoc.on('update', () => {
      chapters.value.forEach(chap => {
        const slideLocks = ydoc.getMap<boolean[]>(`slides_lock_${chap.id}`)
        const locks = slideLocks.get('locks')
        if (locks && chap.slides) {
          locks.forEach((isLocked, idx) => {
            if (chap.slides[idx]) {
              chap.slides[idx].isLocked = isLocked
            }
          })
        }
      })
    })

    // S'assurer que le formateur est reconnu comme tel pour la présence
    provider.awareness.setLocalStateField('user', {
      id: trainerStore.currentTrainer?.id,
      name: trainerStore.currentTrainer?.name,
      role: 'trainer',
      isOnline: true
    })

    setupAwareness()

    // Synchronisation de l'état local avec Yjs au chargement
    const syncState = () => {
      const activeId = sharedActiveState.get('activeChapterId')
      const slideIdx = sharedActiveState.get('activeSlideIndex')
      const paused = sharedActiveState.get('isPaused') === 'true'
      const status = sharedActiveState.get('sessionStatus')
      
      // Si la session est déjà marquée comme 'opened' ou 'paused' dans Yjs
      if (status === 'opened' || status === 'paused') {
        showStartSessionModal.value = false
        isSessionStarted.value = true
        isPaused.value = paused

        // Détecter si on est au-delà du début du chapitre 1
        const isAdvanced = activeId !== chapters.value[0]?.id || slideIdx > 0

        if (status === 'paused' && !activeChapterId.value) {
          // Si on revient d'une pause, on demande toujours
          pendingResumeState.value = { chapterId: activeId, slideIndex: slideIdx }
          showResumeChoiceModal.value = true
        } else if (isAdvanced && !activeChapterId.value) {
          // On propose le choix uniquement au premier chargement si on est avancé
          pendingResumeState.value = { chapterId: activeId, slideIndex: slideIdx }
          showResumeChoiceModal.value = true
        } else if (!activeChapterId.value) {
          // Au début, on synchronise normalement
          if (activeId !== undefined) activeChapterId.value = activeId
          if (slideIdx !== undefined) activeSlideIndex.value = slideIdx
        } else {
          // Déjà initialisé, on suit les changements normalement
          if (activeId !== undefined) activeChapterId.value = activeId
          if (slideIdx !== undefined) activeSlideIndex.value = slideIdx
        }
      } else {
        showStartSessionModal.value = true
        isSessionStarted.value = false
        isPaused.value = paused
      }
    }

    sharedActiveState.observe(syncState)
    syncState()

    // Démarrer la synchronisation périodique des verrous
    startSyncInterval()
  }

  window.addEventListener('resize', updateScale)
  await loadData()
  
  // Masquer les chapitres par défaut (visuellement bloqués)
  chapters.value = chapters.value.map(c => ({ ...c, isLocked: true }))
  
  // Note: La modale showStartSessionModal est maintenant gérée par syncState()
  // via l'état sharedActiveState de Yjs.

  // Forcer le focus sur la modale de démarrage au chargement initial
  nextTick(() => {
    const startBtn = document.querySelector('.btn-success-glass, .btn-primary') as HTMLElement
    startBtn?.focus()
  })

  // Laisser le temps au DOM de se rendre avant de calculer le scale
  setTimeout(updateScale, 100)
})

    const resumeAtLastActive = async () => {
      showResumeChoiceModal.value = false
      if (pendingResumeState.value) {
        const targetChapterId = pendingResumeState.value.chapterId
        const targetSlideIndex = pendingResumeState.value.slideIndex

        // Si la cible est le tout début (Chapitre 1, Chapô), on délègue à resumeAtStart
        if (chapters.value.length > 0 && targetChapterId === chapters.value[0].id && targetSlideIndex === -1) {
          console.log('Cible de reprise = début de formation. Redirection vers resumeAtStart...')
          resumeAtStart()
          return
        }

        // On déverrouille les chapitres jusqu'à celui-ci pour ne pas tomber sur la modale "Session suspendue"
        if (targetChapterId) {
          const targetIndex = chapters.value.findIndex(c => c.id === targetChapterId)
          if (targetIndex !== -1) {
            for (let i = 0; i <= targetIndex; i++) {
              if (chapters.value[i].isLocked) {
                chapters.value[i].isLocked = false
                sharedChapters.set(chapters.value[i].id, false)
                apiClient.patch(`/chapters/${chapters.value[i].id}`, { isLocked: false }).catch(() => {})
              }
            }
          }
        }

        activeChapterId.value = targetChapterId
        activeSlideIndex.value = targetSlideIndex
        
        // Si la session était en pause, on la débloque
        unpauseSession()
      }
      pendingResumeState.value = null
    }

    const resumeAtStart = async () => {
      showResumeChoiceModal.value = false
      
      // 1. Verrouiller TOUT par sécurité avant de repartir à zéro
      for (const chapter of chapters.value) {
        chapter.isLocked = true
        sharedChapters.set(chapter.id, true)
        apiClient.patch(`/chapters/${chapter.id}`, { isLocked: true }).catch(() => {})
        
        // Verrouiller aussi les slides du chapitre
        if (chapter.slides) {
          const slideLocksKey = `slides_lock_${chapter.id}`
          const slideLocks = ydoc.getMap<boolean[]>(slideLocksKey)
          const locks = chapter.slides.map(() => true)
          slideLocks.set('locks', locks)
          
          for (const slide of chapter.slides) {
            slide.isLocked = true
            sharedChapters.set(`slide_lock_${slide.id}`, true)
          }
        }
      }

      // 2. Déverrouiller uniquement le premier chapitre
      const firstChapter = chapters.value[0]
      if (firstChapter) {
        firstChapter.isLocked = false
        sharedChapters.set(firstChapter.id, false)
        apiClient.patch(`/chapters/${firstChapter.id}`, { isLocked: false }).catch(() => {})
        
        // On se place sur le premier chapitre (Chapô)
        selectChapter(firstChapter, -1)
        
        // Si la session était en pause, on la débloque
        unpauseSession()
      }
      pendingResumeState.value = null
    }

const startSession = async () => {
  showStartSessionModal.value = false
  
  // 1. Verrouiller TOUT en base et en local par sécurité pour un démarrage propre
  const sessionId = trainerStore.currentTrainer?.sessionId
  if (sessionId) {
    // Charger d'abord les chapitres pour être sûr d'avoir la liste à jour
    const response = await apiClient.get(`/chapters?sessionId=${sessionId}`)
    if (response.data && response.data.success) {
      chapters.value = response.data.data

      // Verrouiller chaque chapitre et ses slides en base et Yjs
      for (const chapter of chapters.value) {
        chapter.isLocked = true
        sharedChapters.set(chapter.id, true)
        await apiClient.patch(`/chapters/${chapter.id}`, { isLocked: true }).catch(console.error)
        
        if (chapter.slides) {
          const slideLocksKey = `slides_lock_${chapter.id}`
          const slideLocks = ydoc.getMap<boolean[]>(slideLocksKey)
          const locks = chapter.slides.map(() => true)
          slideLocks.set('locks', locks)

          for (const slide of chapter.slides) {
            slide.isLocked = true
            sharedChapters.set(`slide_lock_${slide.id}`, true)
            await apiClient.patch(`/chapters/slides/${slide.id}`, { isLocked: true }).catch(console.error)
          }
        }
      }

      // 2. Déverrouiller UNIQUEMENT le premier chapitre et sa première slide (chapô)
      const firstChapter = chapters.value[0]
      if (firstChapter) {
        firstChapter.isLocked = false
        sharedChapters.set(firstChapter.id, false)
        await apiClient.patch(`/chapters/${firstChapter.id}`, { isLocked: false }).catch(console.error)
        
        // On se positionne sur le premier chapitre
        activeChapterId.value = firstChapter.id
        activeSlideIndex.value = -1
        sharedActiveState.set('activeChapterId', firstChapter.id)
        sharedActiveState.set('activeSlideIndex', -1)
      }

      // 3. Notifier l'ouverture officielle de la session (les stagiaires quittent la salle d'attente)
      isSessionStarted.value = true
      sharedActiveState.set('sessionStatus', 'opened')
      sharedActiveState.set('isPaused', 'false')
      isPaused.value = false
      
      console.log('🚀 Session réinitialisée et ouverte aux stagiaires.')
    }
  }
}

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval)
  window.removeEventListener('resize', updateScale)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('message', handleMessage)
  if (provider) {
    provider.disconnect()
    provider.destroy()
  }
  ydoc.destroy()
})

const loadData = async () => {
  try {
    const sessionId = trainerStore.currentTrainer?.sessionId
    console.log('Current Trainer from Store:', trainerStore.currentTrainer)
    console.log('Session ID:', sessionId)
    
    if (!sessionId) {
      console.warn('No sessionId found for trainer, showing fallbacks')
      // Fallback test si pas de session (dev mode)
      chapters.value = Array.from({ length: 5 }, (_, i) => ({
        id: `${i+1}`,
        order: i + 1,
        title: `Chapitre ${i + 1} (Exemple)`,
        description: `Contenu du chapitre ${i + 1} (Session non définie dans votre profil formateur)`,
        isLocked: i > 0
      }))
      return
    }

    // On charge les chapitres filtrés par sessionId
    const url = `/chapters?sessionId=${sessionId}`
    console.log('Fetching chapters from:', url)
    const response = await apiClient.get(url)
    console.log('API Response:', response.data)

    if (response.data && response.data.success) {
      const dbChapters = response.data.data || []
      console.log('Chapters from DB:', dbChapters)

      if (dbChapters.length > 0) {
        chapters.value = dbChapters
      } else {
        console.warn('DB returned 0 chapters for this session, showing fallbacks')
        chapters.value = [
          { id: 'empty', order: 1, title: 'Aucun chapitre en base', description: 'La session est vide.', isLocked: false }
        ]
      }
    } else {
      console.error('Failed to load chapters:', response.data.error)
    }
  } catch (error) {
    console.error('Error loading animation data:', error)
  }
}

const selectChapter = async (chapter: any) => {
  updateActiveStateInYjs(chapter.id, -1) // On commence toujours par la chapô
}

const toggleChapterLock = async (chapter: any) => {
  const chapterIndex = chapters.value.findIndex(c => c.id === chapter.id)
  if (chapterIndex === -1) return

  const isLocking = !chapter.isLocked

  // Si on déverrouille, on s'assure que la pause est levée
  if (!isLocking && isPaused.value) {
    togglePause()
  }

  // REGLE : Pour déverrouiller, le précédent doit être déverrouillé
  if (!isLocking && chapterIndex > 0) {
    const previousChapter = chapters.value[chapterIndex - 1]
    if (previousChapter.isLocked) {
      alert(`Impossible : Vous devez d'abord déverrouiller "${previousChapter.title}".`)
      return
    }
  }

  // Liste des chapitres à mettre à jour
  const chaptersToUpdate: any[] = []

  if (isLocking) {
    // REGLE : Si on lock, tous les suivants doivent se lock aussi
    for (let i = chapterIndex; i < chapters.value.length; i++) {
      if (!chapters.value[i].isLocked || i === chapterIndex) {
        chapters.value[i].isLocked = true
        chaptersToUpdate.push(chapters.value[i])
        
        // RELOCK toutes les slides du chapitre (Yjs)
        const slideLocks = ydoc.getMap<boolean[]>(`slides_lock_${chapters.value[i].id}`)
        const locks = (chapters.value[i].slides || []).map(() => true)
        slideLocks.set('locks', locks)
      }
    }
    
    // REGLE : Si on vient de locker le chapitre actuellement affiché,
    // on doit changer pour le chapitre précédent (s'il existe)
    if (currentChapter.value && currentChapter.value.id === chapter.id) {
      if (chapterIndex > 0) {
        // Sélectionner le chapitre précédent qui est forcément déverrouillé
        selectChapter(chapters.value[chapterIndex - 1])
      } else {
        // Si c'est le premier chapitre qu'on lock, on vide la slide
        activeChapterId.value = null
        activeSlideIndex.value = 0
        sharedActiveState.set('activeChapterId', null)
        sharedActiveState.set('activeSlideIndex', 0)
      }
    }
  } else {
    // Déverrouillage d'un seul chapitre
    chapter.isLocked = false
    chaptersToUpdate.push(chapter)
    
    // DELOCK uniquement la PREMIERE slide du chapitre (Yjs)
    // S'assurer que le contenu est accessible aux stagiaires dès le déverrouillage du chapitre
    const slideLocks = ydoc.getMap<boolean[]>(`slides_lock_${chapter.id}`)
    const locks = (chapter.slides || []).map(() => true) // TOUT VERROUILLER par défaut au déverrouillage du chapitre
    slideLocks.set('locks', locks)

    // Sélectionner automatiquement le chapitre qu'on vient de déverrouiller sur sa chapô
    updateActiveStateInYjs(chapter.id, -1)
  }

  // Application des changements (Yjs + API)
  for (const c of chaptersToUpdate) {
    sharedChapters.set(c.id, c.isLocked)

    try {
      await apiClient.patch(`/chapters/${c.id}`, { isLocked: c.isLocked })
    } catch (error) {
      console.error(`Erreur persistance chapitre ${c.id}:`, error)
    }
  }
}

const unfreezeSession = () => {
  unpauseSession()
}

const confirmPauseAction = () => {
  const durationMs = pauseDuration.value * 60 * 1000
  const endTs = Date.now() + durationMs
  const endStr = new Date(endTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  isPaused.value = true
  pauseRemainingTime.value = durationMs
  pauseEndTime.value = endStr
  showPauseSettingsModal.value = false
  
  // Sync
  sharedActiveState.set('isPaused', 'true')
  sharedActiveState.set('pauseEndTime', endStr)
  
  startPauseCountdown()
}

const recallTrainees = () => {
  // On envoie un timestamp unique pour forcer un changement d'état chez les stagiaires
  sharedActiveState.set('recallTimestamp', Date.now())
  
  // Allumer le bouton pendant 2 secondes pour le formateur
  isRecallActive.value = true
  if (recallTimer) clearTimeout(recallTimer)
  recallTimer = setTimeout(() => {
    isRecallActive.value = false
  }, 2000)
}

const goToNext = async () => {
  if (!currentChapter.value) {
    if (chapters.value.length > 0) {
      await selectChapter(chapters.value[0])
    }
    return
  }
  
  const currentIndex = chapters.value.findIndex(c => c.id === currentChapter.value.id)
  if (currentIndex < chapters.value.length - 1) {
    const nextChapter = chapters.value[currentIndex + 1]
    await selectChapter(nextChapter)
  }
}

const openProjection = () => {
  showProjectionActiveModal.value = true
  isProjectionOpen.value = true
  const url = router.resolve({ name: 'trainer-projection' }).href
  const win = window.open(url, 'A11Y_Projection', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no')
  
  if (win) {
    const checkWindow = setInterval(() => {
      if (win.closed) {
        isProjectionOpen.value = false
        clearInterval(checkWindow)
      }
    }, 1000)
  }
}
</script>

<style scoped>
.trainer-animation-layout {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: #0f0f1e;
  color: #e2e8f0;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

.animation-container {
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
  position: relative;
}

/* Mini-Header Animation Styles */
.session-header {
  height: 48px;
  background: #1a1a2e;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  z-index: 1000;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-logo {
  height: 24px;
  width: auto;
}

.session-name {
  color: #00d4ff;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.btn-leave {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.3);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-leave:hover {
  background: rgba(244, 63, 94, 0.2);
  transform: translateY(-1px);
}

.aside-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #334155;
  background: rgba(30, 41, 59, 0.5);
}

.aside-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.aside-header h2 {
  font-size: 1.1rem;
  margin: 0;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-session-btn {
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.logout-session-btn:hover {
  background: #dc2626;
  border-color: #ef4444;
  color: white;
}

.logout-session-btn svg {
  width: 18px;
  height: 18px;
}

/* Aside Gauche - Chapitres */
.chapters-aside {
  width: 300px;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  background: #1e293b;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.chapters-aside.is-collapsed {
  width: 0;
  border-right-width: 0;
}

.chapters-aside.is-collapsed .aside-header,
.chapters-aside.is-collapsed .chapters-list {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

.sidebar-toggle-tab {
  position: absolute;
  top: 50%;
  right: -32px;
  transform: translateY(-50%);
  width: 32px;
  height: 64px;
  background: #1e293b;
  border: 1px solid #334155;
  border-left: none;
  border-radius: 0 12px 12px 0;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 101;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.2);
}

.sidebar-toggle-tab:hover {
  color: #fff;
  background: #334155;
}

.sidebar-toggle-tab svg {
  width: 20px;
  height: 20px;
}

.chapters-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scrollbar-gutter: stable;
}

.chapter-tile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.chapter-tile:hover {
  border-color: #6366f1;
  transform: translateX(4px);
}

.chapter-tile.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
}

.chapter-tile.locked {
  opacity: 0.7;
  cursor: not-allowed;
  position: relative;
  overflow: hidden;
  background: #111827;
  border-color: #1f2937;
}

.chapter-tile.locked::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.2) 10px,
    rgba(255, 255, 255, 0.05) 10px,
    rgba(255, 255, 255, 0.05) 20px
  );
  pointer-events: none;
  z-index: 1;
}

.chapter-tile.locked .chapter-info,
.chapter-tile.locked .lock-toggle {
  position: relative;
  z-index: 2;
}

.chapter-info {
  display: flex;
  gap: 0.5rem;
  font-weight: 500;
}

.chapter-title {
  color: #cbd5e1;
}

.lock-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background 0.2s;
}

.lock-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Main Central - Slides */
.slides-main {
  flex: 1;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* Empêche tout scroll */
  position: relative;
  padding: 0;
  height: 100vh; /* Force la hauteur de la fenêtre */
}

/* Toolbar Animation */
.toolbar-btn.is-active-recall {
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.4);
  animation: bg-pulse-red 2s infinite ease-in-out;
}

@keyframes bg-pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.toolbar-btn.success:hover {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.1);
}

.toolbar-btn.danger:hover {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.1);
}

.svg-icon.double-lock {
  width: 26px;
  height: 26px;
}

.text-danger {
  color: #ef4444 !important;
}

.text-success {
  color: #10b981 !important;
}

.modal-actions.horizontal {
  flex-direction: row;
  justify-content: center;
  margin-top: 2.5rem;
  gap: 1.5rem;
}

.btn-danger:focus-visible, 
.btn-success:focus-visible, 
.btn-cancel:focus-visible {
  outline: 3px solid #6366f1;
  outline-offset: 4px;
}

.btn-danger, .btn-success, .btn-primary {
  padding: 0.8rem 2rem;
  border: 1px solid transparent;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: auto;
  backdrop-filter: blur(8px);
}

.btn-primary {
  background: rgba(99, 102, 241, 0.15) !important;
  color: #818cf8 !important;
  border: 1px solid rgba(99, 102, 241, 0.3) !important;
}

.btn-primary:hover {
  background: rgba(99, 102, 241, 0.25) !important;
  color: #a5b4fc !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4) !important;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
  border: 1px solid rgba(239, 68, 68, 0.3) !important;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.25) !important;
  color: #fca5a5 !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4) !important;
}

.btn-success {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #34d399 !important;
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
}

.btn-success:hover {
  background: rgba(16, 185, 129, 0.25) !important;
  color: #6ee7b7 !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4) !important;
}

.btn-cancel {
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px;
  color: #94a3b8 !important;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.btn-resume-focus {
  padding: 1rem 2.5rem;
  background: rgba(99, 102, 241, 0.2) !important;
  color: #818cf8 !important;
  border: 1px solid rgba(99, 102, 241, 0.4) !important;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-resume-focus:hover {
  background: rgba(99, 102, 241, 0.3) !important;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 25px rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.6) !important;
  color: #fff !important;
}

.btn-resume-focus:active {
  transform: translateY(-1px);
}

.badge-projection {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  border: 1px solid rgba(16, 185, 129, 0.3);
  text-transform: uppercase;
}

.hint {
  font-size: 0.9rem;
  color: #94a3b8;
  font-style: italic;
  margin-top: 0.8rem;
  display: block;
}

.animation-toolbar {
  position: absolute;
  top: 1.5rem; /* Retour en haut */
  left: 50%;
  transform: translateX(-50%);
  height: 54px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  z-index: 1000;
  min-width: auto;
  gap: 1rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.toolbar-separator {
  height: 20px;
  width: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 0.5rem;
}

.toolbar-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  position: relative;
}

.slide-wrapper-container {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

/* Pause Overlay Formateur */
.trainer-pause-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  z-index: 20000; /* Doit être au-dessus de tout, même du slider */
}

.pause-status-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: clamp(1rem, 3vw, 2rem);
  text-align: center;
  backdrop-filter: blur(8px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  max-width: 550px;
  width: 90%;
  animation: pause-zoom-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@keyframes pause-zoom-in {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.pause-pulse-icon {
  width: 100px;
  height: 100px;
  background: rgba(99, 102, 241, 0.1);
  border: 4px solid rgba(99, 102, 241, 0.3);
  color: #6366f1;
  border-radius: 50%;
  margin: 0 auto 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
}

.pause-pulse-icon::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  border: 2px solid rgba(99, 102, 241, 0.1);
  animation: pause-pulse-animation 2s infinite ease-in-out;
}

@keyframes pause-pulse-animation {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 0.4; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.pause-pulse-icon svg {
  width: 50px;
  height: 50px;
}

.pause-status-card h2 {
  color: white;
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  margin-bottom: 0.5rem;
}

.pause-status-card p {
  color: #94a3b8;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  font-size: clamp(0.9rem, 2.5vw, 1.1rem)0.9rem, 2.5vw, 1.1rem);
}

.pause-timers {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: rgba(15, 23, 42, 0.4);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.main-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.large-timer {
  font-family: 'Space Mono', monospace, sans-serif;
  font-size: clamp(2rem, 7vw, 4rem) !important;
  font-weight: 800;
  color: #6366f1 !important;
  letter-spacing: -2px;
  white-space: nowrap;
}

.timer-resume-sub {
  font-family: 'Inter', sans-serif;
  font-size: clamp(0.9rem, 2.5vw, 1.2rem);
  color: rgba(255, 255, 255, 0.9); /* Blanc quasi pur */
  font-weight: 400;
  letter-spacing: 0;
}

/* Modale de réglage de la pause */
.pause-settings-modal {
  background: #1e293b;
  padding: 2.5rem;
  border-radius: 28px;
  width: 90%;
  max-width: 500px;
  color: white;
  text-align: center;
}

.duration-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2rem 0;
}

.duration-chip {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.duration-chip:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.4);
}

.duration-chip.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

.custom-duration {
  margin: 1.5rem 0 2rem;
}

.duration-input {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  width: 100px;
  margin-left: 1rem;
  font-size: 1.1rem;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
}

.btn-cancel, .btn-confirm {
  padding: 0.8rem 1.8rem;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

.btn-confirm {
  background: #6366f1;
  color: white;
}

.btn-resume-session {
  background: #6366f1;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: 0 auto;
  transition: all 0.2s;
}

.btn-resume-session:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.3);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.toolbar-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.toolbar-btn:active {
  transform: translateY(0);
}

.toolbar-btn.is-active {
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
}

.toolbar-btn.is-active:hover {
  background: rgba(0, 212, 255, 0.15);
  border-color: rgba(0, 212, 255, 0.4);
}

.toolbar-btn.is-active-recall {
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.15);
  border-color: rgba(255, 77, 77, 0.4);
  box-shadow: 0 0 20px rgba(255, 77, 77, 0.2);
  animation: recall-shake-mini 0.3s ease-in-out infinite;
}

@keyframes recall-shake-mini {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  75% { transform: scale(0.95); }
}

.svg-icon {
  width: 22px;
  height: 22px;
}

.svg-icon.large {
  width: 28px;
  height: 28px;
}

.slide-wrapper {
  width: 1920px;
  height: 1080px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 100px rgba(0, 0, 0, 0.5);
  transform-origin: center center;
  padding: 80px;
  color: #f1f5f9;
  transition: transform 0.1s ease-out;
  flex-shrink: 0;
  box-sizing: border-box;
}

.slide-header {
  padding: 0;
  margin-bottom: 40px;
  border-bottom: 4px solid #3b82f6;
  background: transparent;
}

.slide-header h1 {
  font-size: 4rem;
  color: #f1f5f9;
  margin: 0;
  padding-bottom: 20px;
}

.slide-content {
  flex: 1;
  padding: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.slide-real-content {
  width: 100%;
  height: 100%;
  font-size: 2.5rem;
  line-height: 1.4;
  color: #cbd5e1;
  text-align: left;
}

.slide-real-content :deep(ul), 
.slide-real-content :deep(ol) {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding-left: 5rem;
}

.slide-real-content :deep(li) {
  margin-bottom: 1.5rem;
}

.slide-real-content :deep(h2), 
.slide-real-content :deep(h3) {
  color: #38bdf8;
  margin-bottom: 2.5rem;
}

.slide-real-content :deep(strong) {
  color: #f1f5f9;
}

.slide-placeholder {
  font-size: 2.5rem;
  color: #94a3b8;
  text-align: center;
  max-width: 80%;
  line-height: 1.4;
}

.no-chapter-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.2rem;
}

.no-trainees {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.trainee-card {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 12px;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.led-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-right: 12px;
  align-items: center;
  justify-content: center;
}

.led-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.led-indicator.main { width: 12px; height: 12px; }
.led-indicator.secondary { width: 8px; height: 8px; }

.led-green { background: #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.6); }
.led-orange { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.6); }
.led-red { background: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); }
.led-purple { background: #a855f7; box-shadow: 0 0 10px rgba(168, 85, 247, 0.6); }
.led-off { background: #334155; box-shadow: none; opacity: 0.3; }

.trainee-info {
  display: flex;
  flex-direction: column;
}

.trainee-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #f1f5f9;
}

.trainee-status {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Aside Droit - Stagiaires */
.trainees-list {
  flex: 1;
  padding: 1rem;
  /* On enlève l'overflow-y: auto qui crée un contexte de clipping */
  overflow: visible !important;
}

.trainees-aside {
  width: 250px;
  border-left: 1px solid #334155;
  display: flex;
  flex-direction: column;
  background: #1e293b;
  /* On enlève tout ce qui pourrait couper le tooltip */
  overflow: visible !important;
  z-index: 1000; /* Augmenté pour passer au dessus du contenu central */
}

.active-trainee-card {
  display: flex !important;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #0f172a;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid transparent;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
}

.active-trainee-card:hover {
  background: #1e293b;
  transform: translateX(-4px);
  z-index: 10001; /* Doit être supérieur à .trainees-aside */
}

/* Tooltip Riche */
.trainee-tooltip {
  position: absolute;
  right: calc(100% + 20px);
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
  background: #1e293b;
  border: 1px solid #3b82f6;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 10, 0.9);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Effet ressort */
  pointer-events: none;
  display: flex !important;
  flex-direction: column;
  color: white !important;
  z-index: 10000 !important; /* Sortie absolue */
}

.active-trainee-card:hover .trainee-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(-10px);
}

/* S'assurer que le texte est bien blanc et visible dans le tooltip */
.trainee-tooltip, .stat-row span {
  color: #f1f5f9 !important;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #334155;
  padding-bottom: 8px;
}

.score-badge {
  background: #3b82f6;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 1rem;
}

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #94a3b8;
}

.stat-row span:last-child {
  font-weight: 800;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.stat-divider {
  height: 1px;
  background: #334155;
  margin: 4px 0;
}

.grade-A { color: #10b981 !important; background: rgba(16, 185, 129, 0.15); }
.grade-B { color: #3b82f6 !important; background: rgba(59, 130, 246, 0.15); }
.grade-C { color: #f59e0b !important; background: rgba(245, 158, 11, 0.15); }
.grade-D { color: #ef4444 !important; background: rgba(239, 68, 68, 0.15); }

.trainee-card.has-hand-raised {
  background: rgba(245, 158, 11, 0.15);
  border-color: #f59e0b;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
  transform: scale(1.02);
}

.hand-raised-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #f59e0b;
  color: #000;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  z-index: 10;
  animation: bounce-mini 0.6s infinite alternate;
}

@keyframes bounce-mini {
  from { transform: translateY(0); }
  to { transform: translateY(-3px); }
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #64748b; /* Offline */
}

.trainee-card.online .status-indicator {
  background: #10b981; /* Online */
  box-shadow: 0 0 8px #10b981;
}

.trainee-card.off-slide .status-indicator {
  background: #f59e0b; /* Ailleurs */
  box-shadow: 0 0 8px #f59e0b;
}

.trainee-card.off-slide {
  border-color: rgba(245, 158, 11, 0.3);
}

.trainee-info {
  display: flex;
  flex-direction: column;
}

.trainee-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #e2e8f0;
}

.trainee-status {
  font-size: 0.75rem;
  color: #94a3b8;
}

.unauthorized {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #0f0f1e;
  gap: 2rem;
}

.btn-primary {
  padding: 0.8rem 1.8rem;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  filter: brightness(1.1);
}

.btn-secondary {
  padding: 0.8rem 1.8rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #e2e8f0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-success-glass {
  padding: 0.8rem 1.8rem;
  background: rgba(16, 185, 129, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  color: #6ee7b7;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-success-glass:hover {
  background: #10b981;
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.btn-danger {
  padding: 0.8rem 1.8rem;
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: #f87171;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-danger:hover {
  background: #ef4444;
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

.modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

.modal-content {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 32px;
  padding: 3.5rem;
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.6);
  max-width: 600px;
  width: 90%;
}

.modal-content h2 {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #a5b4fc 0%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.modal-content p {
  color: #94a3b8;
  font-size: 1.1rem;
  line-height: 1.6;
}

.session-info {
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
}

.session-info ul {
  padding-left: 1.2rem;
  margin-top: 1rem;
}

.session-info li {
  margin-bottom: 0.75rem;
  color: #cbd5e1;
}

.modal-actions.vertical {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;
}

.modal-actions.vertical button {
  width: 100%;
  padding: 1rem;
}

.modal-actions.horizontal {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: stretch;
  align-items: center;
  margin-top: 2rem;
}

.modal-actions.horizontal button {
  flex: 1 1 0;
  min-width: fit-content;
}

.modal-actions.no-margin {
  margin-top: 0 !important;
  flex: 2 !important; /* Prend plus de place pour aligner les deux petits boutons */
}

.session-info {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Slider de navigation en bas */
.presentation-slider {
  position: absolute;
  bottom: 4rem; /* Remonté pour floater proprement */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(15, 23, 42, 0.85); /* Un peu plus opaque */
  backdrop-filter: blur(12px);
  padding: 1rem 2rem; /* Plus d'air */
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
  z-index: 10000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.is-paused-slider {
  background: rgba(30, 41, 59, 0.95) !important;
  border: 1px solid rgba(99, 102, 241, 0.4) !important;
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.2) !important;
}

.locked-opacity {
  opacity: 0.4;
  pointer-events: none;
}

.slider-nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.slider-nav-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

.slider-nav-btn svg {
  width: 24px;
  height: 24px;
}

.slider-pages-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 300px; /* Taille fixe pour 1 chapô + 3 slots + 1 indicateur optionnel */
  justify-content: center;
  padding: 0 0.5rem;
  overflow: hidden;
}

.page-box-wrapper {
  width: 50px; /* Largeur fixe pour chaque slot de slide */
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-box-spacer {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.next-chapter-indicator-nu {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 0.5rem;
}

.next-chapter-indicator-nu:hover {
  color: #3b82f6;
  transform: translateX(4px);
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
}

.next-chapter-indicator-nu.finish-icon:hover {
  color: #ef4444;
  transform: translateX(4px);
  filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
}

.svg-chevron-double, .svg-finish {
  width: 24px;
  height: 24px;
}

.slider-more-indicator {
  font-size: 0.8rem;
  font-weight: 700;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  margin-left: 4px;
}

.page-box {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-box:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

.page-box.locked {
  background: rgba(239, 68, 68, 0.25) !important;
  border-color: rgba(239, 68, 68, 0.45) !important;
  color: #fca5a5 !important;
}

.page-box.active {
  min-width: 48px;
  height: 48px;
  background: #2563eb !important;
  border-color: #3b82f6 !important;
  color: white !important;
  font-size: 1.2rem;
  border-radius: 14px;
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.5);
  transform: scale(1.05);
  z-index: 2;
}

.page-box:not(.active):not(.locked) {
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #94a3b8 !important;
}

.page-box.chapo {
  font-size: 1.1rem;
}
</style>

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

.sessions-grid,
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.session-card,
.tool-card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #333;
  transition: all 0.3s;
}

.session-card:hover,
.tool-card:hover {
  border-color: #667eea;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
}

.session-card h3,
.tool-card h3 {
  color: #e0e0e0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.session-card p,
.tool-card p {
  color: #94a3b8;
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.btn-primary,
.btn-secondary {
  width: 100%;
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
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-cancel {
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px;
  color: #94a3b8 !important;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: #1a1a2e;
  padding: 3rem;
  border-radius: 20px;
  max-width: 550px;
  width: 90%;
  color: white;
  text-align: center;
  border: 1px solid #4a5568;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-content h2 {
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.session-info {
  text-align: left;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  margin: 2rem 0;
}

.session-info ul {
  margin-top: 1rem;
  padding-left: 1.5rem;
}

.session-info li {
  margin-bottom: 0.8rem;
  color: #a0aec0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions.horizontal {
  display: flex !important;
  flex-direction: row !important;
  gap: 1rem !important;
  width: 100% !important;
  justify-content: stretch !important;
}

.modal-actions.column {
  display: flex !important;
  flex-direction: column !important;
  gap: 1rem !important;
  width: 100% !important;
}

.modal-actions.horizontal .btn-primary,
.modal-actions.horizontal .btn-secondary,
.modal-actions.horizontal .btn-danger,
.modal-actions.horizontal .btn-success,
.modal-actions.horizontal .btn-cancel {
  flex: 1 1 0 !important;
  margin: 0 !important;
  white-space: nowrap;
}

.modal-actions.no-margin {
  padding: 0 !important;
  margin: 0 !important;
}

.full-width {
  width: 100% !important;
}

.center {
  align-items: center !important;
  justify-content: center !important;
}

.projection-active-card {
  max-width: 500px !important;
  text-align: center;
  padding: 3.5rem 2.5rem !important;
  border: 1px solid rgba(99, 102, 241, 0.3) !important;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.1) !important;
}

.projection-active-card h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #fff;
  line-height: 1.3;
}

.projection-active-card p {
  color: #94a3b8;
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 1rem;
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
  width: auto;
  padding: 0.75rem 1.5rem;
  margin-top: 2rem;
  display: inline-block;
}

.hand-raised-alert {
  position: absolute;
  bottom: 15vh;
  right: 40px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px) saturate(180%);
  border: 3px solid rgba(245, 158, 11, 0.6); /* Bordure plus épaisse et plus visible */
  border-radius: 20px;
  padding: 1.25rem 2rem;
  z-index: 2000;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.hand-raised-alert.is-reaction {
  top: 50%;
  left: 50%;
  bottom: auto;
  right: auto;
  transform: translate(-50%, -50%);
  background: rgba(88, 28, 135, 0.4);
  border: 1px solid rgba(192, 132, 252, 0.5);
  padding: 2.5rem 4rem;
  border-radius: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(168, 85, 247, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: pulse-reaction-crystal 3s infinite ease-in-out;
}

.hand-raised-alert.clickable {
  cursor: pointer;
  pointer-events: auto;
}

.hand-raised-alert.clickable:hover {
  transform: translateY(-4px);
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(245, 158, 11, 0.8);
}

.hand-raised-alert.is-reaction.clickable:hover {
  transform: translate(-50%, -54%);
  background: rgba(107, 33, 168, 0.6);
  border-color: rgba(192, 132, 252, 0.8);
}

@keyframes pulse-reaction-crystal {
  0% { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.1); }
  50% { box-shadow: 0 20px 70px rgba(0, 0, 0, 0.6), 0 0 50px rgba(168, 85, 247, 0.3); }
  100% { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.1); }
}

.hands-counter {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #f8fafc;
  color: #0f172a;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  border: 1px solid rgba(245, 158, 11, 0.5);
}

.alert-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0;
}

.alert-content {
  display: flex;
  flex-direction: row; /* Horizontal */
  align-items: center;
  gap: 1.25rem;
  animation: slide-in-right 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.alert-icon-wrapper {
  width: 54px;
  height: 54px;
  background: #d97706; /* Ambre plus sombre pour contraste AA sur blanc */
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
  position: relative; /* Pour le counter */
}

.hand-raised-alert.is-reaction .alert-icon-wrapper {
  background: #f8fafc;
  color: #6b21a8; /* Pourpre sombre pour contraste */
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}

.hand-raised-alert.is-reaction .alert-text {
  font-size: 1.5rem;
  color: #f8fafc;
}

.hand-raised-alert.is-reaction .alert-hint {
  color: #e9d5ff; /* Pourpre très clair pour lisibilité */
}

.alert-icon-wrapper svg {
  width: 30px;
  height: 30px;
}

.hand-raised-alert.is-reaction .trainee-highlight {
  color: #f1f5f9;
}

.alert-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-text {
  font-size: 1.15rem;
  color: #f8fafc;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}

.trainee-highlight {
  color: #f59e0b;
  font-weight: 800;
}

@keyframes slide-in-right {
  from { transform: translateX(50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* ... existing styles ... */
</style>

<style>
/* Global reset for Animation Page only */
body:has(.trainer-animation-layout) {
  overflow: hidden !important;
  height: 100vh !important;
  width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
}

body:has(.trainer-animation-layout) #app {
  height: 100vh !important;
  overflow: hidden !important;
}

body:has(.trainer-animation-layout) #main-content {
  height: 100vh !important;
  padding: 0 !important;
  margin: 0 !important;
}
</style>
