<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Category } from '../data/products'
import { formatMoney } from '../lib/money'
import { useShopStore } from '../stores/shop'

const shop = useShopStore()
const priceCaps = [50, 100, 150]

function toggleCategory(category: Category) {
  shop.filters.category = shop.filters.category === category ? null : category
}

function toggleColor(color: string) {
  shop.filters.color = shop.filters.color === color ? null : color
}

function togglePrice(cap: number) {
  shop.filters.maxPrice = shop.filters.maxPrice === cap ? null : cap
}

function monogram(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}
</script>

<template>
  <section class="page">
    <header class="page-intro">
      <p class="eyebrow">Catalog</p>
      <h1>Twelve objects, no warehouse.</h1>
      <p class="lede">Wool, linen, ceramic, and leather. Filter the shelf, then take something home.</p>
    </header>

    <div class="catalog">
      <details class="filters" open>
        <summary>Filters</summary>
        <label class="field">
          <span>Search</span>
          <input v-model="shop.filters.query" type="search" placeholder="Wool, linen, navy…" />
        </label>

        <fieldset>
          <legend>Category</legend>
          <div class="chip-row">
            <button
              v-for="category in shop.categories"
              :key="category"
              type="button"
              class="chip"
              :aria-pressed="shop.filters.category === category"
              @click="toggleCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Color</legend>
          <div class="chip-row">
            <button
              v-for="color in shop.colorOptions"
              :key="color"
              type="button"
              class="chip"
              :aria-pressed="shop.filters.color === color"
              @click="toggleColor(color)"
            >
              {{ color }}
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Price</legend>
          <div class="chip-row">
            <button
              v-for="cap in priceCaps"
              :key="cap"
              type="button"
              class="chip"
              :aria-pressed="shop.filters.maxPrice === cap"
              @click="togglePrice(cap)"
            >
              Under {{ formatMoney(cap) }}
            </button>
          </div>
        </fieldset>

        <label class="field">
          <span>Sort</span>
          <select v-model="shop.filters.sort">
            <option value="featured">Featured</option>
            <option value="price_asc">Price, low to high</option>
            <option value="price_desc">Price, high to low</option>
            <option value="name">Name</option>
          </select>
        </label>

        <button class="text-btn" type="button" @click="shop.clearFilters()">Clear filters</button>
      </details>

      <div>
        <p class="result-count">
          {{ shop.filteredProducts.length }} of {{ shop.products.length }} objects
        </p>
        <div v-if="shop.filteredProducts.length" class="grid">
          <RouterLink
            v-for="product in shop.filteredProducts"
            :key="product.id"
            class="card"
            :to="{ name: 'product', params: { slug: product.id } }"
          >
            <div class="card-visual" :style="{ '--swatch': product.colors[0].hex }">
              <span>{{ monogram(product.name) }}</span>
            </div>
            <div class="card-body">
              <p class="eyebrow">{{ product.category }}</p>
              <h2>{{ product.name }}</h2>
              <p class="price">{{ formatMoney(product.price) }}</p>
            </div>
          </RouterLink>
        </div>
        <div v-else class="empty">
          <p>Nothing matches.</p>
          <button class="btn" type="button" @click="shop.clearFilters()">Clear filters</button>
        </div>
      </div>
    </div>
  </section>
</template>
