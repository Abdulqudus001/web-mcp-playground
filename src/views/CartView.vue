<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { formatMoney } from '../lib/money'
import { useShopStore } from '../stores/shop'

const shop = useShopStore()
const code = ref('')

function apply() {
  shop.applyCoupon(code.value)
  code.value = ''
}
</script>

<template>
  <section class="page">
    <header class="page-intro">
      <p class="eyebrow">Cart</p>
      <h1>{{ shop.itemCount ? 'Ready when you are.' : 'The cart is empty.' }}</h1>
    </header>

    <div v-if="shop.detailedLines.length" class="split">
      <ul class="lines">
        <li v-for="line in shop.detailedLines" :key="line.lineId">
          <span class="dot" :style="{ background: line.hex }"></span>
          <div>
            <RouterLink :to="{ name: 'product', params: { slug: line.productId } }">{{ line.name }}</RouterLink>
            <p class="muted">
              {{ line.color }}<template v-if="line.size"> · {{ line.size }}</template>
            </p>
          </div>
          <div class="qty">
            <button
              type="button"
              :aria-label="`Decrease ${line.name}`"
              @click="shop.updateQuantity(line.lineId, line.quantity - 1)"
            >
              −
            </button>
            <span>{{ line.quantity }}</span>
            <button
              type="button"
              :aria-label="`Increase ${line.name}`"
              @click="shop.updateQuantity(line.lineId, line.quantity + 1)"
            >
              +
            </button>
          </div>
          <p class="price">{{ formatMoney(line.lineTotal) }}</p>
          <button class="text-btn" type="button" @click="shop.removeFromCart(line.lineId)">Remove</button>
        </li>
      </ul>

      <aside class="summary">
        <h2>Summary</h2>
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{{ formatMoney(shop.subtotal) }}</dd>
          </div>
          <div>
            <dt>Discount</dt>
            <dd>{{ shop.discount ? `−${formatMoney(shop.discount)}` : formatMoney(0) }}</dd>
          </div>
          <div class="total-row">
            <dt>Total</dt>
            <dd>{{ formatMoney(shop.total) }}</dd>
          </div>
        </dl>
        <p v-if="shop.coupon" class="muted">
          Coupon {{ shop.coupon }} is on this order.
          <template v-if="!shop.discount">It applies once the subtotal is high enough.</template>
        </p>
        <form class="coupon-form" @submit.prevent="apply">
          <label class="field">
            <span>Coupon</span>
            <input v-model="code" type="text" placeholder="SUMMER10 or WELCOME15" autocomplete="off" />
          </label>
          <button class="btn ghost" type="submit">Apply</button>
        </form>
        <p class="muted">Demo codes: SUMMER10 takes 10%. WELCOME15 takes 15% from $40.</p>
        <RouterLink class="btn" to="/checkout">Checkout</RouterLink>
      </aside>
    </div>

    <div v-else class="empty">
      <RouterLink class="btn" to="/">Browse the catalog</RouterLink>
    </div>
  </section>
</template>
