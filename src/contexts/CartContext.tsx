'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { createSupabaseClient } from '@/lib/supabase'
import { useToast } from './ToastContext'

interface CartItem {
  _id: string
  productId: {
    _id: string
    name: string
    price: string
    originalPrice: string
    discount: string
    image: string
    inStock: boolean
    colors?: { name: string; stock: number; inStock: boolean }[]
  }
  quantity: number
  color: string
  size: string
}

interface Cart {
  _id: string
  userId: string
  items: CartItem[]
  total: number
  createdAt: string
  updatedAt: string
}

interface CartContextType {
  cart: Cart | null
  loading: boolean
  addToCart: (productId: string, quantity?: number, color?: string, size?: string, removeFromFavorites?: boolean) => Promise<void>
  updateCartItem: (productId: string, quantity?: number, color?: string, size?: string) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  cartItemCount: number
  clearCartAfterOrder: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(0)
  const supabase = createSupabaseClient()
  const { showToast } = useToast()

  const getAuthToken = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }, [supabase.auth])

  const fetchCart = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const token = await getAuthToken()
      
      if (!token) {
        console.error('No auth token available')
        return
      }
      
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const cartData = await response.json()
        setCart(cartData)
        setLastUpdate(Date.now())
      } else if (response.status === 404) {
        // Cart not found, create empty cart
        setCart(null)
      } else {
        console.error('Failed to fetch cart:', response.status, response.statusText)
        setCart(null)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken])

  const addToCart = useCallback(async (productId: string, quantity: number = 1, color: string = '', size: string = '', removeFromFavorites: boolean = false) => {
    if (!user) return

    try {
      setLoading(true)
      const token = await getAuthToken()
      
      if (!token) {
        console.error('No auth token available')
        showToast('Authentication error. Please sign in again.', 'error')
        return
      }
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity, color, size }),
      })

      if (response.ok) {
        const updatedCart = await response.json()
        setCart(updatedCart)
        setLastUpdate(Date.now())

        
        // If removeFromFavorites is true, remove from favorites
        if (removeFromFavorites) {
          // Import and use favorites context to remove from favorites
          // This will be handled in the component that calls addToCart
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to add to cart:', response.status, errorData)
        showToast(errorData.message || 'Failed to add to cart', 'error')
        throw new Error(errorData.message || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      showToast('Failed to add product to cart', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken, showToast])

  const updateCartItem = useCallback(async (productId: string, quantity?: number, color?: string, size?: string) => {
    if (!user) return

    try {
      const token = await getAuthToken()
      
      if (!token) {
        console.error('No auth token available')
        showToast('Authentication error. Please sign in again.', 'error')
        return
      }
      
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity, color, size }),
      })

      if (response.ok) {
        const updatedCart = await response.json()
        setCart(updatedCart)
        setLastUpdate(Date.now())
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to update cart item:', response.status, errorData)
        showToast(errorData.message || 'Failed to update cart item', 'error')
        throw new Error(errorData.message || 'Failed to update cart item')
      }
    } catch (error) {
      console.error('Error updating cart item:', error)
      showToast('Failed to update cart item', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken, showToast])

  const removeFromCart = useCallback(async (productId: string) => {
    if (!user) return

    try {
      setLoading(true)
      const token = await getAuthToken()
      
      if (!token) {
        console.error('No auth token available')
        showToast('Authentication error. Please sign in again.', 'error')
        return
      }
      
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const updatedCart = await response.json()
        setCart(updatedCart)
        setLastUpdate(Date.now())
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to remove from cart:', response.status, errorData)
        showToast(errorData.message || 'Failed to remove from cart', 'error')
        throw new Error(errorData.message || 'Failed to remove from cart')
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      showToast('Failed to remove product from cart', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken, showToast])

  const clearCart = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      // Remove all items one by one
      if (cart?.items) {
        for (const item of cart.items) {
          await removeFromCart(item.productId._id)
        }
      }
      setCart(null)
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error clearing cart:', error)
      showToast('Failed to clear cart', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [user, cart, removeFromCart, showToast])

  const clearCartAfterOrder = useCallback(async () => {
    if (!user) return

    try {
      const token = await getAuthToken()
      
      if (!token) {
        console.error('No auth token available')
        return
      }
      
      // Clear all items from cart
      if (cart?.items) {
        for (const item of cart.items) {
          await removeFromCart(item.productId._id)
        }
      }
      
      setCart(null)
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error clearing cart after order:', error)
      showToast('Failed to clear cart after order', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [user, cart, removeFromCart, getAuthToken, showToast])

  const refreshCart = useCallback(async () => {
    await fetchCart()
  }, [fetchCart])

  // Calculate cart item count
  const cartItemCount = cart?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0

  // Fetch cart when user changes
  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart(null)
      setLastUpdate(0)
    }
  }, [user, fetchCart])

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    clearCartAfterOrder,
    refreshCart,
    cartItemCount,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 