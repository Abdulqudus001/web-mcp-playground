<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { formatMoney } from '../lib/money'
import { useShopStore } from '../stores/shop'

const route = useRoute()
const shop = useShopStore()
const quantity = ref(1)

const product = computed(() => shop.products.find((item) => item.id === route.params.slug))
const colorName = ref('')
const sizeName = ref('')

watch(
  product,
  (next) => {
    if (!next) return
    const inStock = next.colors.find((color) => color.stock > 0) ?? next.colors[0]
    colorName.value = inStock?.name ?? ''
    sizeName.value = next.sizes[0] ?? ''
    quantity.value = 1
  },
  { immediate: true },
)

const color = computed(() => product.value?.colors.find((item) => item.name === colorName.value))
const inCart = computed(() =>
  product.value ? shop.quantityInCart(product.value.id, colorName.value, product.value.sizes.length ? sizeName.value : null) : 0,
)

function add() {
  if (!product.value) return
  shop.addToCart({
    product: product.value.id,
    color: colorName.value,
    size: product.value.sizes.length ? sizeName.value : undefined,
    quantity: quantity.value,
  })
}
</script>

<template>
  <section v-if="product" class="page product">
    <RouterLink class="back-link" to="/">← Catalog</RouterLink>
    <div class="stage" :style="{ '--swatch': color?.hex ?? '#ddd' }">
      <p class="stage-caption">{{ colorName }}</p>
    </div>
    <div class="product-copy">
      <p class="eyebrow">{{ product.category }}</p>
      <h1>{{ product.name }}</h1>
      <p class="price price-lg">{{ formatMoney(product.price) }}</p>
      <p class="lede">{{ product.description }}</p>

      <fieldset>
        <legend>Color</legend>
        <div class="chip-row">
          <button
            v-for="option in product.colors"
            :key="option.name"
            type="button"
            class="chip"
            :aria-pressed="colorName === option.name"
            @click="colorName = option.name"
          >
            {{ option.name }}
            <span v-if="option.stock === 0"> · out</span>
          </button>
        </div>
      </fieldset>

      <fieldset v-if="product.sizes.length">
        <legend>Size</legend>
        <div class="chip-row">
          <button
            v-for="size in product.sizes"
            :key="size"
            type="button"
            class="chip"
            :aria-pressed="sizeName === size"
            @click="sizeName = size"
          >
            {{ size }}
          </button>
        </div>
      </fieldset>

      <div class="buy-row">
        <div class="qty" aria-label="Quantity">
          <button type="button" aria-label="Decrease quantity" @click="quantity = Math.max(1, quantity - 1)">
            −
          </button>
          <span>{{ quantity }}</span>
          <button type="button" aria-label="Increase quantity" @click="quantity += 1">+</button>
        </div>
        <button class="btn" type="button" :disabled="!color || color.stock < 1" @click="add">
          {{ color && color.stock < 1 ? 'Out of stock' : 'Add to cart' }}
        </button>
      </div>
      <p v-if="color" class="stock-note">
        {{ color.stock }} in {{ color.name }}.
        <template v-if="inCart">{{ inCart }} already in the cart.</template>
      </p>
      <RouterLink class="text-link" to="/cart">View cart</RouterLink>
    </div>
  </section>
  <section v-else class="page empty">
    <h1>That object is not in the shop.</h1>
    <RouterLink class="btn" to="/">Back to the catalog</RouterLink>
  </section>
</template>
