// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

interface ApiResponse<T> {
  success?: boolean
  data?: T
  error?: string
}

interface ColorStock {
  name: string
  stock: number
  inStock: boolean
}

export interface Product {
  _id: string
  name: string
  price: string
  originalPrice: string
  image: string
  images?: string[]
  discount: string
  description?: string
  category?: string
  inStock?: boolean
  rating?: number
  reviewCount?: number
  views?: number
  features?: string[]
  specifications?: Record<string, string>
  colors?: ColorStock[]
  showFeatures?: boolean
  showSpecifications?: boolean
  showColors?: boolean
  status?: 'draft' | 'published'
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  _id: string
  name: string
  slug: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`


  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Products API
export const productsApi = {
  getAll: () => apiCall<Product[]>('/products'),
  getPublished: () => apiCall<Product[]>('/products?status=published'),
  getDrafts: () => apiCall<Product[]>('/products?status=draft'),
  getById: (id: string) => apiCall<Product>(`/products/${id}`),
  create: (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => apiCall<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  update: (id: string, product: Partial<Product>) => apiCall<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  updateStatus: (id: string, status: 'draft' | 'published') => apiCall<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  delete: (id: string) => apiCall<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  }),
  getByCategory: (category: string) => apiCall<Product[]>(`/products?category=${category}&status=published`),
  getFeatured: (limit?: number) => apiCall<Product[]>(`/products?featured=true&status=published${limit ? `&limit=${limit}` : ''}`),
}

// Categories API
export const categoriesApi = {
  getAll: (includeInactive = false) => apiCall<Category[]>(`/categories${includeInactive ? '?status=all' : ''}`),
  create: (category: Pick<Category, 'name' | 'isActive'>) => apiCall<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  }),
  update: (id: string, category: Partial<Pick<Category, 'name' | 'isActive'>>) => apiCall<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  }),
  delete: (id: string) => apiCall<{ message: string }>(`/categories/${id}`, {
    method: 'DELETE',
  }),
}

// Order types
export interface OrderItem {
  productId: string | {
    _id: string
    name: string
    image: string
  }
  productName: string
  image?: string // Optional since existing orders might not have this
  quantity: number
  price: number
  total: number
  color?: string
  size?: string
}

export interface Order {
  _id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  tax: number
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  orderDate: string
  deliveredAt?: string
  shippingAddress: string
  trackingNumber?: string
  notes?: string
  cancellationNote?: string
  createdAt: string
  updatedAt: string
}

// Review types
export interface Review {
  _id: string
  productId: string | {
    _id: string
    name: string
    image: string
  }
  orderId: string | {
    _id: string
    orderNumber: string
    status: string
  }
  customerId: string
  customerName: string
  customerEmail: string
  rating: number
  title: string
  comment: string
  isVerified: boolean
  helpful: number
  likedBy?: string[]
  createdAt: string
  updatedAt: string
}

// Reviews API
export const reviewsApi = {
  getAll: (params?: { productId?: string; orderId?: string; customerId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.productId) searchParams.append('productId', params.productId)
    if (params?.orderId) searchParams.append('orderId', params.orderId)
    if (params?.customerId) searchParams.append('customerId', params.customerId)
    return apiCall<Review[]>(`/reviews?${searchParams.toString()}`)
  },
  getById: (id: string) => apiCall<Review>(`/reviews/${id}`),
  create: (review: Omit<Review, '_id' | 'isVerified' | 'helpful' | 'createdAt' | 'updatedAt'>) => apiCall<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  }),
  update: (id: string, review: Pick<Review, 'rating' | 'title' | 'comment'>) => apiCall<Review>(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(review),
  }),
  delete: (id: string) => apiCall<{ message: string }>(`/reviews/${id}`, {
    method: 'DELETE',
  }),
  like: (id: string, userId?: string) => apiCall<Review>(`/reviews/${id}`, {
    method: 'PATCH',
    body: userId ? JSON.stringify({ userId }) : undefined,
  }),
}

// Orders API
export const ordersApi = {
  getAll: () => apiCall<Order[]>('/orders'),
  getById: (id: string) => apiCall<Order>(`/orders/${id}`),
  getByCustomer: (customerId: string, status?: string) => {
    const params = new URLSearchParams({ customerId })
    if (status && status !== 'all') params.append('status', status)
    return apiCall<Order[]>(`/orders?${params.toString()}`)
  },
  create: (order: Omit<Order, '_id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => apiCall<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  }),
  update: (id: string, order: Partial<Pick<Order, 'status' | 'paymentStatus' | 'trackingNumber' | 'notes'>>) => apiCall<Order>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(order),
  }),
  delete: (id: string) => apiCall<{ message: string }>(`/orders/${id}`, {
    method: 'DELETE',
  }),
}

// Customers API
export const customersApi = {
  getAll: () => apiCall<unknown[]>('/customers'),
  getById: (id: string) => apiCall<unknown>(`/customers/${id}`),
  create: (customer: Record<string, unknown>) => apiCall<unknown>('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  }),
  update: (id: string, customer: Record<string, unknown>) => apiCall<unknown>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customer),
  }),
  delete: (id: string) => apiCall<unknown>(`/customers/${id}`, {
    method: 'DELETE',
  }),
} 