/**
 * North Atelier — a frontend-only Vue shop.
 * Catalog, cart, coupon, and checkout. State lives in Pinia and localStorage.
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './styles.css'

createApp(App).use(createPinia()).use(router).mount('#app')
