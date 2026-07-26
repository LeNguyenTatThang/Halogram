import configAxios from '../api/axios'
import type { Product, ProductListResponse, Category, Shop, Cart } from '../types/shop'

export async function getCategories(): Promise<Category[]> {
  const { data } = await configAxios.get('/shop/categories')
  return Array.isArray(data) ? data : data.categories ?? []
}

export async function getProducts(params?: {
  categoryId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
  limit?: number
}): Promise<ProductListResponse> {
  const res = await configAxios.get('/shop/products', { params })
  return res.data
}

export async function getProductById(id: string): Promise<Product> {
  const res = await configAxios.get(`/shop/products/${id}`)
  return res.data
}

export async function getProductsByShop(shopId: string, page = 1, limit = 20): Promise<ProductListResponse> {
  const res = await configAxios.get(`/shop/products/shop/${shopId}`, { params: { page, limit } })
  return res.data
}

export async function getShop(slugOrId: string): Promise<Shop> {
  const res = await configAxios.get(`/shop/${slugOrId}`)
  return res.data
}

export async function registerShop(data: {
  name: string
  description?: string
  phone?: string
  email?: string
  address?: string
}): Promise<Shop> {
  const res = await configAxios.post('/shop/register', data)
  return res.data
}

export async function getMyShop(): Promise<Shop | null> {
  try {
    const res = await configAxios.get('/shop/my-shop')
    return res.data
  } catch {
    return null
  }
}

export async function getCart(): Promise<Cart> {
  const res = await configAxios.get('/shop/cart')
  return res.data
}

export async function addToCart(productId: string, quantity = 1): Promise<Cart> {
  const res = await configAxios.post('/shop/cart/add', { productId, quantity })
  return res.data
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const res = await configAxios.put(`/shop/cart/item/${itemId}`, { quantity })
  return res.data
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const res = await configAxios.delete(`/shop/cart/item/${itemId}`)
  return res.data
}
