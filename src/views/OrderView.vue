<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { formatMoney } from '../lib/money'
import { useShopStore } from '../stores/shop'

const route = useRoute()
const shop = useShopStore()

const order = computed(() =>
  shop.lastOrder && shop.lastOrder.id === route.params.id ? shop.lastOrder : null,
)

const placed = computed(() =>
  order.value ? new Date(order.value.placedAt).toLocaleString() : '',
)
</script>

<template>
  <section v-if="order" class="page narrow">
    <p class="eyebrow">Order {{ order.id }}</p>
    <h1>It’s in.</h1>
    <p class="lede">A mock receipt for {{ order.fullName }} at {{ order.email }}. Nothing was charged.</p>
    <p class="muted">Placed {{ placed }}</p>
    <ul class="lines plain">
      <li v-for="line in order.lines" :key="line.lineId">
        <div>
          <strong>{{ line.name }}</strong>
          <p class="muted">
            {{ line.color }}<template v-if="line.size"> · {{ line.size }}</template>
            · {{ line.quantity }}
          </p>
        </div>
        <p class="price">{{ formatMoney(line.unitPrice * line.quantity) }}</p>
      </li>
    </ul>
    <dl class="totals">
      <div>
        <dt>Subtotal</dt>
        <dd>{{ formatMoney(order.subtotal) }}</dd>
      </div>
      <div>
        <dt>Discount</dt>
        <dd>{{ order.discount ? `−${formatMoney(order.discount)}` : formatMoney(0) }}</dd>
      </div>
      <div class="total-row">
        <dt>Total</dt>
        <dd>{{ formatMoney(order.total) }}</dd>
      </div>
    </dl>
    <p class="muted">{{ order.address }}, {{ order.city }} {{ order.postalCode }}</p>
    <RouterLink class="btn" to="/">Back to the catalog</RouterLink>
  </section>
  <section v-else class="page empty">
    <h1>No order with that number in this browser.</h1>
    <RouterLink class="btn" to="/">Back to the catalog</RouterLink>
  </section>
</template>
