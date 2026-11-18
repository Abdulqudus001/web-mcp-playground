/**
 * WebMCP: search_products — read-only catalog lookup.
 * Awaits document.modelContext.registerTool (Chrome returns a Promise;
 * VueUse’s useWebMCP does not await it yet).
 */
import { onMounted, onUnmounted, shallowRef } from 'vue'
import { categories } from '../data/products'
import { useShopStore } from '../stores/shop'

export function useSearchProductsTool() {
  const shop = useShopStore()
  const isSupported = shallowRef(false)
  const isRegistered = shallowRef(false)
  const error = shallowRef<Error | null>(null)
  let controller: AbortController | undefined

  onMounted(async () => {
    const ctx = document.modelContext
    isSupported.value = typeof ctx?.registerTool === 'function'
    if (!ctx?.registerTool) return

    controller = new AbortController()
    error.value = null
    try {
      await ctx.registerTool(
        {
          name: 'search_products',
          description:
            'Search the North Atelier catalog by free-text query and optional category. Returns matching products with id, name, price, colors, and sizes. Does not change the cart.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description:
                  'Words to match against product name, blurb, description, category, or color.',
              },
              category: {
                type: 'string',
                description: `Optional category filter. One of: ${categories.join(', ')}.`,
                enum: [...categories],
              },
            },
          },
          annotations: { readOnlyHint: true },
          async execute(args: { query?: string; category?: string } = {}) {
            const result = shop.searchProducts(args)
            return {
              content: [{ type: 'text', text: JSON.stringify(result) }],
            }
          },
        },
        { signal: controller.signal },
      )
      isRegistered.value = true
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      isRegistered.value = false
      console.error('[WebMCP] search_products registration failed', err)
    }
  })

  onUnmounted(() => {
    controller?.abort()
    isRegistered.value = false
  })

  return { isSupported, isRegistered, error }
}
