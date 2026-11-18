import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  categories,
  coupons,
  products,
  type Category,
  type CouponCode,
  type Product,
  type SortKey,
} from '../data/products'

const storageKey = 'north-atelier-shop'

export interface CartLine {
  lineId: string
  productId: string
  color: string
  size: string | null
  quantity: number
}

export interface Filters {
  query: string
  category: Category | null
  maxPrice: number | null
  color: string | null
  sort: SortKey
}

export interface ShippingDetails {
  fullName: string
  email: string
  address: string
  city: string
  postalCode: string
}

export interface PlacedOrder extends ShippingDetails {
  id: string
  placedAt: string
  lines: Array<CartLine & { name: string; unitPrice: number }>
  subtotal: number
  discount: number
  total: number
  coupon: string | null
}

interface SavedState {
  cart: CartLine[]
  coupon: CouponCode | null
  order: PlacedOrder | null
}

function emptyFilters(): Filters {
  return { query: '', category: null, maxPrice: null, color: null, sort: 'featured' }
}

function lineId(productId: string, color: string, size: string | null): string {
  return `${productId}:${color}:${size ?? '-'}`
}

function load(): SavedState {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { cart: [], coupon: null, order: null }
    const parsed = JSON.parse(raw) as Partial<SavedState>
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      coupon: parsed.coupon && parsed.coupon in coupons ? parsed.coupon : null,
      order: parsed.order ?? null,
    }
  } catch {
    return { cart: [], coupon: null, order: null }
  }
}

function canonical<T extends string>(value: unknown, options: readonly T[]): T | null {
  if (typeof value !== 'string') return null
  const found = options.find((option) => option.toLowerCase() === value.trim().toLowerCase())
  return found ?? null
}

export const useShopStore = defineStore('shop', () => {
  const saved = load()
  const cart = ref<CartLine[]>(saved.cart)
  const coupon = ref<CouponCode | null>(saved.coupon)
  const lastOrder = ref<PlacedOrder | null>(saved.order)
  const filters = ref<Filters>(emptyFilters())
  const notice = ref<string | null>(null)

  watch(
    [cart, coupon, lastOrder],
    () => {
      const payload: SavedState = {
        cart: cart.value,
        coupon: coupon.value,
        order: lastOrder.value,
      }
      localStorage.setItem(storageKey, JSON.stringify(payload))
    },
    { deep: true },
  )

  const colorOptions = computed(() => {
    const names = new Set<string>()
    for (const product of products) {
      for (const color of product.colors) names.add(color.name)
    }
    return [...names]
  })

  function productById(id: string): Product | undefined {
    const key = id.trim().toLowerCase()
    return products.find(
      (product) => product.id.toLowerCase() === key || product.name.toLowerCase() === key,
    )
  }

  function matches(product: Product, current: Filters): boolean {
    if (current.category && product.category !== current.category) return false
    if (current.maxPrice != null && product.price > current.maxPrice) return false
    if (current.color) {
      const wanted = current.color.toLowerCase()
      if (!product.colors.some((color) => color.name.toLowerCase() === wanted)) return false
    }
    const query = current.query.trim().toLowerCase()
    if (!query) return true
    const haystack = [
      product.name,
      product.category,
      product.blurb,
      product.description,
      ...product.colors.map((color) => color.name),
    ]
      .join(' ')
      .toLowerCase()
    return query.split(/\s+/).every((word) => haystack.includes(word))
  }

  const filteredProducts = computed(() => {
    const current = filters.value
    const list = products.filter((product) => matches(product, current))
    const sorted = [...list]
    if (current.sort === 'price_asc') sorted.sort((a, b) => a.price - b.price)
    if (current.sort === 'price_desc') sorted.sort((a, b) => b.price - a.price)
    if (current.sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  })

  const detailedLines = computed(() =>
    cart.value.flatMap((line) => {
      const product = products.find((item) => item.id === line.productId)
      if (!product) return []
      return [
        {
          ...line,
          name: product.name,
          unitPrice: product.price,
          hex: product.colors.find((color) => color.name === line.color)?.hex ?? '#ccc',
          lineTotal: product.price * line.quantity,
        },
      ]
    }),
  )

  const itemCount = computed(() => cart.value.reduce((sum, line) => sum + line.quantity, 0))
  const subtotal = computed(() => detailedLines.value.reduce((sum, line) => sum + line.lineTotal, 0))
  const discount = computed(() => {
    if (!coupon.value) return 0
    const deal = coupons[coupon.value]
    if (subtotal.value < deal.min) return 0
    return Math.round(subtotal.value * deal.rate)
  })
  const total = computed(() => Math.max(0, subtotal.value - discount.value))

  function cartSnapshot() {
    return {
      lines: detailedLines.value.map((line) => ({
        lineId: line.lineId,
        productId: line.productId,
        name: line.name,
        color: line.color,
        size: line.size,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
      })),
      itemCount: itemCount.value,
      coupon: coupon.value,
      subtotal: subtotal.value,
      discount: discount.value,
      total: total.value,
    }
  }

  function clearFilters() {
    filters.value = emptyFilters()
    notice.value = 'Filters cleared.'
    return { count: products.length, filters: filters.value }
  }

  function addToCart(input: {
    product?: unknown
    color?: unknown
    size?: unknown
    quantity?: unknown
  }) {
    if (typeof input.product !== 'string' || !input.product.trim()) {
      return { error: 'Pass a product id or name.', products: products.map((item) => item.id) }
    }
    const product = productById(input.product)
    if (!product) {
      return {
        error: `No product matching "${input.product}".`,
        products: products.map((item) => ({ id: item.id, name: item.name })),
      }
    }
    if (typeof input.color !== 'string') {
      return {
        error: 'Pass a color.',
        colors: product.colors.map((color) => ({ name: color.name, stock: color.stock })),
      }
    }
    const color = product.colors.find((item) => item.name.toLowerCase() === input.color?.toString().toLowerCase())
    if (!color) {
      return {
        error: `${product.name} has no color "${input.color}".`,
        colors: product.colors.map((item) => item.name),
      }
    }
    if (color.stock < 1) {
      return {
        error: `${product.name} in ${color.name} is out of stock.`,
        colors: product.colors.map((item) => ({ name: item.name, stock: item.stock })),
      }
    }

    let size: string | null = null
    if (product.sizes.length > 0) {
      if (typeof input.size !== 'string') {
        return { error: `${product.name} needs a size.`, sizes: product.sizes }
      }
      const found = product.sizes.find((item) => item.toLowerCase() === input.size?.toString().toLowerCase())
      if (!found) return { error: `Unknown size "${input.size}".`, sizes: product.sizes }
      size = found
    }

    const quantity = input.quantity == null || input.quantity === '' ? 1 : Number(input.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { error: 'Quantity must be a whole number of at least 1.' }
    }

    const id = lineId(product.id, color.name, size)
    const existing = cart.value.find((line) => line.lineId === id)
    const nextQuantity = (existing?.quantity ?? 0) + quantity
    if (nextQuantity > color.stock) {
      const error = `Only ${color.stock} ${product.name} in ${color.name} are available.`
      notice.value = error
      return { error, inCart: existing?.quantity ?? 0 }
    }

    if (existing) existing.quantity = nextQuantity
    else cart.value.push({ lineId: id, productId: product.id, color: color.name, size, quantity })

    notice.value = `Added ${quantity} ${product.name} (${color.name}${size ? `, ${size}` : ''}).`
    return {
      added: { lineId: id, productId: product.id, name: product.name, color: color.name, size, quantity: nextQuantity },
      cart: cartSnapshot(),
    }
  }

  function updateQuantity(lineIdValue: unknown, quantityValue: unknown) {
    if (typeof lineIdValue !== 'string') {
      return { error: 'Pass a lineId from the cart.', lines: cartSnapshot().lines }
    }
    const line = cart.value.find((item) => item.lineId === lineIdValue)
    if (!line) return { error: `No cart line "${lineIdValue}".`, lines: cartSnapshot().lines }

    const quantity = Number(quantityValue)
    if (!Number.isInteger(quantity) || quantity < 0) {
      return { error: 'Quantity must be a whole number. Use 0 to remove the line.' }
    }
    if (quantity === 0) {
      cart.value = cart.value.filter((item) => item.lineId !== line.lineId)
      notice.value = 'Removed a line from the cart.'
      return { removed: line.lineId, cart: cartSnapshot() }
    }

    const product = products.find((item) => item.id === line.productId)
    const color = product?.colors.find((item) => item.name === line.color)
    if (color && quantity > color.stock) {
      const error = `Only ${color.stock} are available.`
      notice.value = error
      return { error, lineId: line.lineId }
    }
    line.quantity = quantity
    notice.value = `Updated ${product?.name ?? 'item'} to ${quantity}.`
    return { updated: { lineId: line.lineId, quantity }, cart: cartSnapshot() }
  }

  function removeFromCart(lineIdValue: unknown) {
    if (typeof lineIdValue !== 'string') {
      return { error: 'Pass a lineId from the cart.', lines: cartSnapshot().lines }
    }
    const line = cart.value.find((item) => item.lineId === lineIdValue)
    if (!line) return { error: `No cart line "${lineIdValue}".`, lines: cartSnapshot().lines }
    cart.value = cart.value.filter((item) => item.lineId !== line.lineId)
    notice.value = 'Removed a line from the cart.'
    return { removed: line.lineId, cart: cartSnapshot() }
  }

  function applyCoupon(code: unknown) {
    if (code == null || (typeof code === 'string' && code.trim() === '')) {
      coupon.value = null
      notice.value = 'Coupon removed.'
      return { coupon: null, cart: cartSnapshot() }
    }
    if (typeof code !== 'string') {
      return { error: 'Pass a coupon code.', codes: Object.keys(coupons) }
    }
    const found = canonical(code, Object.keys(coupons) as CouponCode[])
    if (!found) return { error: `No coupon "${code}".`, codes: Object.keys(coupons) }
    const deal = coupons[found]
    coupon.value = found
    const applies = subtotal.value >= deal.min
    notice.value = applies
      ? `${found} applied.`
      : `${found} is saved and applies once the subtotal reaches ${deal.min}.`
    return {
      coupon: found,
      rate: deal.rate,
      applies,
      minimumSubtotal: deal.min,
      cart: cartSnapshot(),
    }
  }

  function placeOrder(
    details: ShippingDetails,
  ): { error: string } | { orderId: string; total: number; email: string } {
    if (cart.value.length === 0) return { error: 'The cart is empty.' }
    const required = ['fullName', 'email', 'address', 'city', 'postalCode'] as const
    for (const field of required) {
      if (details[field].trim() === '') return { error: `Missing ${field}.` }
    }
    if (!details.email.includes('@')) return { error: 'Email needs an @.' }

    const order: PlacedOrder = {
      ...details,
      fullName: details.fullName.trim(),
      email: details.email.trim(),
      address: details.address.trim(),
      city: details.city.trim(),
      postalCode: details.postalCode.trim(),
      id: `NA-${Math.floor(1000 + Math.random() * 9000)}`,
      placedAt: new Date().toISOString(),
      lines: detailedLines.value.map((line) => ({
        lineId: line.lineId,
        productId: line.productId,
        name: line.name,
        color: line.color,
        size: line.size,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
      subtotal: subtotal.value,
      discount: discount.value,
      total: total.value,
      coupon: coupon.value,
    }
    lastOrder.value = order
    cart.value = []
    coupon.value = null
    notice.value = `Order ${order.id} placed.`
    return { orderId: order.id, total: order.total, email: order.email }
  }

  function quantityInCart(productId: string, color: string, size: string | null): number {
    return cart.value.find((line) => line.lineId === lineId(productId, color, size))?.quantity ?? 0
  }

  return {
    products,
    categories,
    cart,
    coupon,
    lastOrder,
    filters,
    notice,
    colorOptions,
    filteredProducts,
    detailedLines,
    itemCount,
    subtotal,
    discount,
    total,
    clearFilters,
    addToCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    placeOrder,
    quantityInCart,
  }
})
