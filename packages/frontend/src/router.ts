// src/router.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import ToolsPage from '@/pages/ToolsPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import StatSession from '@/pages/StatSession.vue'
import UserAccountPage from '@/pages/UserAccountPage.vue'
import TrainerAccountPage from '@/pages/TrainerAccountPage.vue'
import LibraryPage from '@/pages/LibraryPage.vue'
import TrainerPage from '@/pages/TrainerPage.vue'
import TrainerSetup from '@/pages/TrainerSetup.vue'
import TrainerAnimationPage from '@/pages/TrainerAnimationPage.vue'
import TrainerGestionPage from '@/pages/TrainerGestionPage.vue'
import TrainerConfigPage from '@/pages/TrainerConfigPage.vue'
import TrainerProjectionPage from '@/pages/TrainerProjectionPage.vue'
import SessionCoursePage from '@/pages/SessionCoursePage.vue'
import WaitingRoomPage from '@/pages/WaitingRoomPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/account',
    name: 'account',
    component: UserAccountPage,
  },
  {
    path: '/waiting-room',
    name: 'waiting-room',
    component: WaitingRoomPage,
  },
  {
    path: '/session-cours/:sessionId',
    name: 'session-course',
    component: SessionCoursePage,
  },
  {
    path: '/session',
    name: 'session',
    component: RegisterPage,
  },
  {
    path: '/tools',
    name: 'tools',
    component: ToolsPage,
  },
  {
    path: '/trainer',
    name: 'trainer',
    component: TrainerPage,
  },
  {
    path: '/trainer/setup/:token',
    name: 'trainer-setup',
    component: TrainerSetup,
  },
  {
    path: '/trainer/animation',
    name: 'trainer-animation',
    component: TrainerAnimationPage,
  },
  {
    path: '/trainer/projection',
    name: 'trainer-projection',
    component: TrainerProjectionPage,
  },
  {
    path: '/trainer/gestion',
    name: 'trainer-gestion',
    component: TrainerGestionPage,
  },
  {
    path: '/trainer/config',
    name: 'trainer-config',
    component: TrainerConfigPage,
  },
  {
    path: '/trainer/account',
    name: 'trainer-account',
    component: TrainerAccountPage,
  },
  {
    path: '/trainer/stats',
    name: 'trainer-stats',
    component: StatSession,
  },
  {
    path: '/trainer/library',
    name: 'trainer-library',
    component: LibraryPage,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  },
})
