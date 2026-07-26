export type ShopVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Shop {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  logo: string | null
  coverImage: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  verification?: ShopVerification | null
  _count?: { products: number }
}

export interface ShopVerification {
  id: string
  shopId: string
  status: ShopVerificationStatus
  idDocument: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  _count?: { products: number }
}

export interface ProductImage {
  id: string
  url: string
  order: number
}

export interface Product {
  id: string
  shopId: string
  categoryId: string
  name: string
  slug: string
  description: string | null
  price: number
  salePrice: number | null
  stock: number
  soldCount: number
  rating: number
  reviewCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  images: ProductImage[]
  category?: Category
  shop?: {
    id: string
    name: string
    slug: string
    logo: string | null
    coverImage?: string | null
    verification?: { status: ShopVerificationStatus } | null
    _count?: { products: number }
  }
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  createdAt: string
  product: Product & { shop: { id: string; name: string; slug: string } }
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductListResponse {
  products: Product[]
  pagination: Pagination
}
