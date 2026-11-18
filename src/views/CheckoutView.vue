<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { formatMoney } from '../lib/money'
import { useShopStore } from '../stores/shop'

const shop = useShopStore()
const router = useRouter()
const placing = ref(false)
const formError = ref('')

const details = ref({
  fullName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
})

const canLeave = computed(() => shop.itemCount === 0 && !placing.value)

watch(
  canLeave,
  (empty) => {
    if (empty) void router.replace({ name: 'cart' })
  },
  { immediate: true },
)

function submit() {
  formError.value = ''
  placing.value = true
  const result = shop.placeOrder(details.value)
  if ('error' in result) {
    placing.value = false
    formError.value = result.error
    return
  }
  void router.push({ name: 'order', params: { id: result.orderId } })
}
</script>

<template>
  <section v-if="shop.itemCount" class="page">
    <header class="page-intro">
      <p class="eyebrow">Checkout</p>
      <h1>Where should it go?</h1>
      <p class="lede">A mock shipment. Nothing is charged.</p>
    </header>

    <div class="split">
      <form class="checkout-form" @submit.prevent="submit">
        <label class="field">
          <span>Full name</span>
          <input v-model="details.fullName" name="fullName" required autocomplete="name" />
        </label>
        <label class="field">
          <span>Email</span>
          <input v-model="details.email" name="email" type="email" required autocomplete="email" />
        </label>
        <label class="field">
          <span>Street address</span>
          <input v-model="details.address" name="address" required autocomplete="address-line1" />
        </label>
        <div class="pair">
          <label class="field">
            <span>City</span>
            <input v-model="details.city" name="city" required autocomplete="address-level2" />
          </label>
          <label class="field">
            <span>Postal code</span>
            <input v-model="details.postalCode" name="postalCode" required autocomplete="postal-code" />
          </label>
        </div>
        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
        <button class="btn" type="submit">Place order</button>
      </form>

      <aside class="summary">
        <h2>Your order</h2>
        <ul class="mini-lines">
          <li v-for="line in shop.detailedLines" :key="line.lineId">
            <span>{{ line.quantity }} × {{ line.name }}</span>
            <span>{{ formatMoney(line.lineTotal) }}</span>
          </li>
        </ul>
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
        <RouterLink class="text-link" to="/cart">Edit cart</RouterLink>
      </aside>
    </div>
  </section>
</template>
