'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { createSupabaseClient } from '@/lib/supabase'
import { useToast } from './ToastContext'

interface FavoriteProduct {
  _id: string
  productId: {
    _id: string
    name: string
    price: string
    originalPrice: string
    image: string
    inStock: boolean
    rating: number
    reviews: number
  }
  createdAt: string
}

interface FavoritesContextType {
  favorites: FavoriteProduct[]
  loading: boolean
  addToFavorites: (productId: string) => Promise<void>
  removeFromFavorites: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
  refreshFavorites: () => Promise<void>
  favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
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

  const fetchFavorites = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const token = await getAuthToken()
      
      if (!token) {
        console.error('No auth token available')
        return
      }
      
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const favoritesData = await response.json()
        setFavorites(favoritesData)
        setLastUpdate(Date.now())
      } else if (response.status === 404) {
        // No favorites found, set empty array
        setFavorites([])
      } else {
        console.error('Failed to fetch favorites:', response.status, response.statusText)
        setFavorites([])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken])

  const addToFavorites = useCallback(async (productId: string) => {
    if (!user) return

    try {
      setLoading(true)
      const token = await getAuthToken()
      
      if (!token) {
        console.error('No auth token available')
        showToast('Authentication error. Please sign in again.', 'error')
        return
      }
      
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        const newFavorite = await response.json()
        setFavorites(prev => [...prev, newFavorite])
        setLastUpdate(Date.now())
        showToast('Product added to favorites successfully!', 'success')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to add to favorites:', response.status, errorData)
        showToast(errorData.message || 'Failed to add to favorites', 'error')
        throw new Error(errorData.message || 'Failed to add to favorites')
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
      showToast('Failed to add product to favorites', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken, showToast])

  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!user) return

    try {
      setLoading(true)
      const token = await getAuthToken()
      
      if (!token) {
        console.error('No auth token available')
        showToast('Authentication error. Please sign in again.', 'error')
        return
      }
      
      const response = await fetch(`/api/favorites?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.productId._id !== productId))
        setLastUpdate(Date.now())
        showToast('Product removed from favorites successfully!', 'success')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to remove from favorites:', response.status, errorData)
        showToast(errorData.message || 'Failed to remove from favorites', 'error')
        throw new Error(errorData.message || 'Failed to remove from favorites')
      }
    } catch (error) {
      console.error('Error removing from favorites:', error)
      showToast('Failed to remove product from favorites', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [user, getAuthToken, showToast])

  const isFavorite = useCallback((productId: string): boolean => {
    return favorites.some(fav => fav.productId._id === productId)
  }, [favorites])

  const refreshFavorites = useCallback(async () => {
    await fetchFavorites()
  }, [fetchFavorites])

  // Calculate favorites count
  const favoritesCount = favorites?.length || 0

  // Fetch favorites when user changes
  useEffect(() => {
    if (user) {
      fetchFavorites()
    } else {
      setFavorites([])
      setLastUpdate(0)
    }
  }, [user, fetchFavorites])

  const value: FavoritesContextType = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites,
    favoritesCount,
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
} 