// src/main.ts
// Load polyfill first before any other imports
import './polyfills'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'

console.log('--- A11Y DEBUG: APP STARTING WITH RED FOCUS ---');

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
