// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

interface ApiResponse<T> {
  success?: boolean
  data?: T
  error?: string
}

export interface Product {
  _id: string
  name: string
  price: string
  originalPrice: string
  image: string
  discount: string
  description?: string
  category?: string
  inStock?: boolean
  rating?: number
  reviews?: number
  createdAt?: string
  updatedAt?: string
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`
  console.log('API Call:', url, options.method || 'GET')

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    console.log('API Response:', data)

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
  getById: (id: string) => apiCall<Product>(`/products/${id}`),
  create: (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => apiCall<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  update: (id: string, product: Partial<Product>) => apiCall<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  delete: (id: string) => apiCall<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  }),
  getByCategory: (category: string) => apiCall<Product[]>(`/products?category=${category}`),
  getFeatured: (limit?: number) => apiCall<Product[]>(`/products?featured=true${limit ? `&limit=${limit}` : ''}`),
}

// Orders API
export const ordersApi = {
  getAll: () => apiCall<unknown[]>('/orders'),
  getById: (id: string) => apiCall<unknown>(`/orders/${id}`),
  create: (order: Record<string, unknown>) => apiCall<unknown>('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  }),
  update: (id: string, order: Record<string, unknown>) => apiCall<unknown>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(order),
  }),
  delete: (id: string) => apiCall<unknown>(`/orders/${id}`, {
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