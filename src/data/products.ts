export const categories = ['Knitwear', 'Ceramics', 'Linen', 'Leather'] as const

export type Category = (typeof categories)[number]

export interface ProductColor {
  name: string
  hex: string
  stock: number
}

export interface Product {
  id: string
  name: string
  category: Category
  price: number
  blurb: string
  description: string
  colors: ProductColor[]
  sizes: string[]
}

export const products: Product[] = [
  {
    id: 'harbor-sweater',
    name: 'Harbor Sweater',
    category: 'Knitwear',
    price: 128,
    blurb: 'Dense merino wool crew with a slightly cropped hem.',
    description:
      'Knitted in dense merino wool that holds its shape. The hem sits just at the hip, and the ribbing is firm enough to keep the cuffs quiet.',
    colors: [
      { name: 'Navy', hex: '#1e2a4a', stock: 6 },
      { name: 'Cream', hex: '#f3ead7', stock: 4 },
      { name: 'Rust', hex: '#9c4221', stock: 0 },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'field-cardigan',
    name: 'Field Cardigan',
    category: 'Knitwear',
    price: 156,
    blurb: 'Shawl-collar wool cardigan with horn buttons.',
    description:
      'An undyed wool cardigan with a shawl collar and three horn buttons. Heavy enough for a cold room, light enough to wear over a shirt.',
    colors: [
      { name: 'Sage', hex: '#6e7f62', stock: 3 },
      { name: 'Ink', hex: '#1c1915', stock: 5 },
    ],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'wool-throw',
    name: 'Wool Throw',
    category: 'Knitwear',
    price: 96,
    blurb: 'Lightweight merino throw, 130 by 180 cm.',
    description:
      'A loose merino knit meant for the back of a chair. It is 130 by 180 cm, with a ribbed edge that does not curl.',
    colors: [
      { name: 'Cream', hex: '#f3ead7', stock: 4 },
      { name: 'Sage', hex: '#6e7f62', stock: 3 },
    ],
    sizes: [],
  },
  {
    id: 'daybreak-tee',
    name: 'Daybreak Tee',
    category: 'Linen',
    price: 48,
    blurb: 'Washed linen tee with a bound neckline.',
    description:
      'Cut from washed linen that has already softened. The neckline is bound, and the sleeves end above the elbow.',
    colors: [
      { name: 'Sand', hex: '#e6d3b3', stock: 8 },
      { name: 'Cream', hex: '#f3ead7', stock: 5 },
      { name: 'Navy', hex: '#1e2a4a', stock: 4 },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'market-tote',
    name: 'Market Tote',
    category: 'Linen',
    price: 64,
    blurb: 'Heavy linen tote with a flat base and leather handles.',
    description:
      'A structured linen tote that stands up when you set it down. The handles are vegetable-tanned leather, stitched through a reinforced band.',
    colors: [
      { name: 'Sand', hex: '#e6d3b3', stock: 7 },
      { name: 'Rust', hex: '#9c4221', stock: 3 },
    ],
    sizes: [],
  },
  {
    id: 'linen-apron',
    name: 'Linen Apron',
    category: 'Linen',
    price: 58,
    blurb: 'Cross-back apron in washed linen.',
    description:
      'A cross-back apron with a deep front pocket. The linen is washed, so it does not need breaking in.',
    colors: [
      { name: 'Sand', hex: '#e6d3b3', stock: 5 },
      { name: 'Ink', hex: '#1c1915', stock: 3 },
    ],
    sizes: [],
  },
  {
    id: 'table-bowl',
    name: 'Table Bowl',
    category: 'Ceramics',
    price: 42,
    blurb: 'Speckled stoneware bowl, about 22 cm across.',
    description:
      'Thrown stoneware with a speckled glaze. About 22 cm across and 8 cm deep, sized for salad or fruit.',
    colors: [
      { name: 'Clay', hex: '#c47a58', stock: 5 },
      { name: 'Cream', hex: '#f3ead7', stock: 6 },
      { name: 'Ink', hex: '#1c1915', stock: 2 },
    ],
    sizes: [],
  },
  {
    id: 'pour-over-cup',
    name: 'Pour-over Cup',
    category: 'Ceramics',
    price: 28,
    blurb: 'Handleless cup sized for a single pour-over.',
    description:
      'A handleless cup with a thick foot, sized for one pour-over. The lip is thin; the base stays warm.',
    colors: [
      { name: 'Clay', hex: '#c47a58', stock: 9 },
      { name: 'Sage', hex: '#6e7f62', stock: 4 },
    ],
    sizes: [],
  },
  {
    id: 'espresso-set',
    name: 'Espresso Cup Set',
    category: 'Ceramics',
    price: 46,
    blurb: 'Two espresso cups with saucers.',
    description:
      'A pair of espresso cups and saucers in the same glaze. Each cup holds about 70 ml.',
    colors: [
      { name: 'Cream', hex: '#f3ead7', stock: 6 },
      { name: 'Clay', hex: '#c47a58', stock: 3 },
    ],
    sizes: [],
  },
  {
    id: 'field-notebook',
    name: 'Field Notebook',
    category: 'Leather',
    price: 36,
    blurb: 'Pocket notebook with a vegetable-tanned cover.',
    description:
      'A pocket notebook in vegetable-tanned leather. The paper is plain, 64 pages, and the cover darkens where your hand rests.',
    colors: [
      { name: 'Ink', hex: '#1c1915', stock: 10 },
      { name: 'Rust', hex: '#9c4221', stock: 6 },
    ],
    sizes: [],
  },
  {
    id: 'card-wallet',
    name: 'Card Wallet',
    category: 'Leather',
    price: 54,
    blurb: 'Four-card wallet that folds flat.',
    description:
      'Holds four cards and a folded note. It closes flat, with a single stitch line along the edge.',
    colors: [
      { name: 'Ink', hex: '#1c1915', stock: 5 },
      { name: 'Navy', hex: '#1e2a4a', stock: 4 },
    ],
    sizes: [],
  },
  {
    id: 'desk-folio',
    name: 'Desk Folio',
    category: 'Leather',
    price: 88,
    blurb: 'Slim leather folio for a notebook and a pen.',
    description:
      'A slim folio with a pocket for a pocket notebook and a loop for a pen. The leather is the same hide as the wallet.',
    colors: [
      { name: 'Ink', hex: '#1c1915', stock: 4 },
      { name: 'Navy', hex: '#1e2a4a', stock: 2 },
    ],
    sizes: [],
  },
]

export const sorts = ['featured', 'price_asc', 'price_desc', 'name'] as const
export type SortKey = (typeof sorts)[number]

export const coupons = {
  SUMMER10: { label: 'Summer', rate: 0.1, min: 0 },
  WELCOME15: { label: 'Welcome', rate: 0.15, min: 40 },
} as const

export type CouponCode = keyof typeof coupons
