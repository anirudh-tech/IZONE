'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const { favorites, loading: favoritesLoading, removeFromFavorites } = useFavorites()
  const { addToCart } = useCart()
  const router = useRouter()
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in')
    }
  }, [authLoading, user, router])

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1)
      // Remove from favorites after successfully adding to cart
      await removeFromFavorites(productId)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleRemoveFavorite = async (productId: string) => {
    await removeFromFavorites(productId)
  }

  if (authLoading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            My Favorites ({favorites.length} items)
          </h1>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-300 mb-4">No favorites yet</h2>
              <p className="text-gray-400 mb-8">Start adding products to your favorites to see them here.</p>
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div key={favorite._id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-700">
                  <div className="relative">
                    <div className="aspect-square bg-gray-700 overflow-hidden">
                      <img 
                        src={favorite.productId.image} 
                        alt={favorite.productId.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <button 
                      className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full shadow-md hover:bg-red-500/20 transition-colors border border-gray-600"
                      onClick={() => handleRemoveFavorite(favorite.productId._id)}
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                    </button>
                    {!favorite.productId.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium border border-gray-600">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{favorite.productId.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(favorite.productId.rating || 0) ? 'text-amber-400 fill-current' : 'text-gray-500'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">({favorite.productId.reviewCount || 0})</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-amber-400">{favorite.productId.price}</span>
                      <span className="text-sm text-gray-500 line-through">{favorite.productId.originalPrice}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/product/${favorite.productId._id}`}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center border border-gray-600"
                      >
                        View Details
                      </Link>
                      <button 
                        className={`flex-1 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          favorite.productId.inStock 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed border border-gray-500'
                        }`}
                        disabled={!favorite.productId.inStock}
                        onClick={() => favorite.productId.inStock && handleAddToCart(favorite.productId._id)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {favorite.productId.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 