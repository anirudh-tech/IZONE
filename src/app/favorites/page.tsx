'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Trash2, ShoppingCart, ArrowLeft, Star } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Mock favorites data - in a real app, this would come from a state management system
const initialFavorites = [
  {
    id: 1,
    name: 'iPhone 14 Pro Max',
    price: 1099,
    originalPrice: 1499,
    image: '/iphone14F-removebg-preview.png',
    color: 'Deep Purple',
    rating: 4.8,
    reviews: 124,
    inStock: true,
    addedDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Apple Watch Series 8',
    price: 1499,
    originalPrice: 1899,
    image: '/iphone14s-removebg-preview.png',
    color: 'Midnight',
    rating: 4.9,
    reviews: 89,
    inStock: true,
    addedDate: '2024-01-10'
  },
  {
    id: 3,
    name: 'AirPods Pro 2nd Generation',
    price: 749,
    originalPrice: 949,
    image: '/iphone14c-removebg-preview.png',
    color: 'White',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    addedDate: '2024-01-12'
  },
  {
    id: 4,
    name: 'iPad Air 5th Gen',
    price: 2199,
    originalPrice: 2799,
    image: '/iphone1.png',
    color: 'Space Gray',
    rating: 4.6,
    reviews: 78,
    inStock: false,
    addedDate: '2024-01-08'
  }
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(initialFavorites)
  const [sortBy, setSortBy] = useState('date')
  const [filterInStock, setFilterInStock] = useState(false)

  // Remove from favorites
  const removeFromFavorites = (itemId: number) => {
    setFavorites(prev => prev.filter(item => item.id !== itemId))
  }

  // Add to cart
  const addToCart = (itemId: number) => {
    // In a real app, this would add to cart
    alert('Added to cart!')
  }

  // Sort and filter favorites
  const sortedAndFilteredFavorites = favorites
    .filter(item => !filterInStock || item.inStock)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'date':
        default:
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
      }
    })

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <Heart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Your favorites list is empty</h1>
            <p className="text-gray-400 mb-8">Start adding items to your favorites to see them here.</p>
            <Link href="/shop">
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Start Shopping
              </button>
            </Link>
          </div>
        </div>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/shop" className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Favorites</h1>
            <p className="text-gray-400">{favorites.length} items in your favorites</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
            >
              <option value="date">Sort by Date Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Sort by Rating</option>
            </select>

            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={filterInStock}
                onChange={(e) => setFilterInStock(e.target.checked)}
                className="w-4 h-4 text-amber-600 bg-gray-800 border-gray-600 rounded focus:ring-amber-400"
              />
              In Stock Only
            </label>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAndFilteredFavorites.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all duration-300 group">
              {/* Product Image */}
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-700">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain object-center group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {/* Stock Status */}
                {!item.inStock && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Out of Stock
                  </div>
                )}
                
                {/* Remove from Favorites */}
                <button
                  onClick={() => removeFromFavorites(item.id)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-lg group-hover:text-amber-400 transition-colors">
                  {item.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(item.rating) ? 'text-amber-400 fill-current' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">({item.reviews})</span>
                </div>

                {/* Color */}
                <p className="text-gray-400 text-sm">Color: {item.color}</p>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-lg">AED {item.price}</span>
                  <span className="text-gray-400 line-through text-sm">AED {item.originalPrice}</span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/product/${item.id}`} className="flex-1">
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors">
                      View Details
                    </button>
                  </Link>
                  
                  <button
                    onClick={() => addToCart(item.id)}
                    disabled={!item.inStock}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>

                {/* Added Date */}
                <p className="text-gray-500 text-xs pt-2 border-t border-gray-700">
                  Added {new Date(item.addedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for Filtered Results */}
        {sortedAndFilteredFavorites.length === 0 && favorites.length > 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No items match your filters</h3>
            <p className="text-gray-400">Try adjusting your filters to see more items.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
} 