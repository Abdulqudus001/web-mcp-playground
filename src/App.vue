<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { watch } from 'vue'
import { useSearchProductsTool } from './composables/useSearchProductsTool'
import { useShopStore } from './stores/shop'

const shop = useShopStore()
useSearchProductsTool()

watch(
  () => shop.notice,
  (message) => {
    if (!message) return
    window.setTimeout(() => {
      if (shop.notice === message) shop.notice = null
    }, 3200)
  },
)
</script>

<template>
  <div class="shell">
    <a class="skip" href="#main">Skip to content</a>
    <header class="topbar">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">NA</span>
        <span>
          <span class="brand-name">North Atelier</span>
          <span class="brand-sub">Goods for the table and the cold</span>
        </span>
      </RouterLink>
      <nav class="nav" aria-label="Shop">
        <RouterLink to="/">Catalog</RouterLink>
        <RouterLink class="cart-link" to="/cart">
          Cart
          <span class="count">{{ shop.itemCount }}</span>
        </RouterLink>
      </nav>
    </header>

    <main id="main">
      <RouterView />
    </main>

    <footer class="foot">
      <p>Frontend only. The cart and any order stay in this browser.</p>
    </footer>

    <p v-if="shop.notice" class="toast" role="status">{{ shop.notice }}</p>
  </div>
</template>
