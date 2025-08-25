import { Headphones, Watch, Speaker, Search, Heart, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { productsApi } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import AedIcon from '@/components/AedIcon'

interface Product {
  _id: string
  name: string
  price: string
  originalPrice: string
  category: string
  description: string
  image: string
  discount: string
  priceValue?: number
  colors?: Array<{name: string, stock: number, inStock: boolean}>
}

interface ProductGridProps {
  currentPage?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void
  searchQuery?: string
  selectedCategory?: string
  priceRange?: string
}

export default function ProductGrid({ 
  currentPage = 1, 
  itemsPerPage = 8, 
  onPageChange,
  searchQuery = '',
  selectedCategory = 'All',
  priceRange = 'All'
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [operationLoading, setOperationLoading] = useState<string | null>(null)
  const { addToCart, loading: cartLoading } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite, loading: favoritesLoading } = useFavorites()
  const { user } = useAuth()
  const { showToast } = useToast()

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiProducts = await productsApi.getPublished()
        
        // Convert API products to match our interface
        const convertedProducts: Product[] = apiProducts.map(product => ({
          _id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category || 'Uncategorized',
          description: product.description || 'No description available',
          image: product.image,
          discount: product.discount || '',
          priceValue: extractPriceValue(product.price),
          colors: product.colors // Assuming product.colors is available from the API
        }))
        
        setProducts(convertedProducts)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products')
        // Fallback to empty array
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Helper function to extract numeric price value
  const extractPriceValue = (priceString: string): number => {
    const match = priceString.match(/AED\s*([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''))
    }
    return 0
  }

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/sign-in'
      return
    }

    try {
      setOperationLoading(`cart-${productId}`)
      
      // Find the product to check if it has colors
      const product = products.find(p => p._id === productId)
      if (product && product.colors && product.colors.length > 0) {
        // If product has colors, redirect to product detail page for color selection
        window.location.href = `/product/${productId}`
        return
      }
      
      await addToCart(productId, 1)
      
      // Remove from favorites if it was in favorites
      if (isFavorite(productId)) {
        await removeFromFavorites(productId)
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      // You could show a toast notification here
    } finally {
      setOperationLoading(null)
    }
  }

  const handleToggleFavorite = async (productId: string) => {
    if (!user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/sign-in'
      return
    }
    
    try {
      setOperationLoading(`favorite-${productId}`)
      if (isFavorite(productId)) {
        await removeFromFavorites(productId)
      } else {
        await addToFavorites(productId)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      // You could show a toast notification here
    } finally {
      setOperationLoading(null)
    }
  }

  // Filter products based on search query, category, and price range
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Category filter
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    
    // Price range filter
    let matchesPriceRange = true
    if (priceRange !== 'All') {
      const price = product.priceValue || 0
      switch (priceRange) {
        case 'Under AED 500':
          matchesPriceRange = price < 500
          break
        case 'AED 500 - AED 1,000':
          matchesPriceRange = price >= 500 && price <= 1000
          break
        case 'AED 1,000 - AED 2,000':
          matchesPriceRange = price >= 1000 && price <= 2000
          break
        case 'Over AED 2,000':
          matchesPriceRange = price > 2000
          break
        default:
          matchesPriceRange = true
      }
    }
    
    return matchesSearch && matchesCategory && matchesPriceRange
  })

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading products...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Error loading products</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Results Count */}
      <div className="text-center mb-6">
        <p className="text-gray-300">
          {filteredProducts.length === 0 
            ? 'No products found' 
            : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} of ${filteredProducts.length} products`
          }
        </p>
      </div>

      {/* Products Grid */}
      {currentProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {currentProducts.map((product) => {
          // Default icon based on category
          let IconComponent = Speaker
          if (product.category === 'Audio') IconComponent = Headphones
          else if (product.category === 'Wearables') IconComponent = Watch
          
          const isCartLoading = operationLoading === `cart-${product._id}`
          const isFavoriteLoading = operationLoading === `favorite-${product._id}`
          
          return (
            <div key={product._id} className="group bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl h-full flex flex-col">
              {/* Product Image */}
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-800">
                <Link href={`/product/${product._id}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain object-center group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </Link>
                {/* Discount Badge */}
                {product.discount&&product.discount!=='0% OFF'&&(
                  <div className="absolute top-2 right-2 bg-red-500 text-gray-100 px-2 py-1 rounded-full text-xs font-bold">
                    {product.discount}
                  </div>
                )}
                {/* Favorite Button */}
                <button
                  onClick={() => handleToggleFavorite(product._id)}
                  disabled={favoritesLoading || isFavoriteLoading}
                  className={`absolute top-2 left-2 p-2 rounded-full transition-all duration-300 ${
                    isFavorite(product._id)
                      ? 'bg-red-500 text-gray-100'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-red-500 hover:text-white dark:bg-gray-800 dark:bg-opacity-80 dark:text-gray-300 dark:border-transparent'
                  } ${isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(product._id) ? 'fill-current text-gray-100' : ''}`} />
                </button>
              </div>
              
              {/* Product Info */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
                {product.name}
              </h3>
              
              <p className="text-gray-300 text-sm mb-3 line-clamp-2 flex-grow">
                {product.description}
              </p>
              
              {/* Price */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex justify-center items-center gap-2">
                  <span className="text-amber-400 font-bold text-lg flex items-center gap-1">
                    <AedIcon className="text-amber-400" width={14} height={12} />
                    {product.priceValue?.toLocaleString()}
                  </span>
                  {product.discount!=='0% OFF'&&(
                    <span className="text-gray-400 line-through text-sm flex items-center gap-1">
                      <AedIcon className="text-gray-400" width={12} height={10} />
                      {extractPriceValue(product.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-auto">
               
                <button 
                  onClick={() => handleAddToCart(product._id)}
                  disabled={cartLoading || isCartLoading}
                  className={`flex-1 cursor-pointer bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors   ${
                    isCartLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                 View Details
                </button>
              </div>
            </div>
          )
        })}
      </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No products found matching your criteria</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
} 