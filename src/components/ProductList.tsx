import { Headphones, Watch, Speaker, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { productsApi } from '@/lib/api'
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
}

interface ProductListProps {
  currentPage?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void
  searchQuery?: string
  selectedCategory?: string
  priceRange?: string
}

export default function ProductList({ 
  currentPage = 1, 
  itemsPerPage = 8, 
  onPageChange,
  searchQuery = '',
  selectedCategory = 'All',
  priceRange = 'All'
}: ProductListProps) {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
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
          priceValue: extractPriceValue(product.price)
        }))
        
        setProducts(convertedProducts)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products')
        showToast('Failed to load products', 'error')
        // Fallback to empty array
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [showToast])

  // Helper function to extract numeric price value
  const extractPriceValue = (priceString: string): number => {
    const match = priceString.match(/AED\s*([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''))
    }
    return 0
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

      {/* Products List */}
      {currentProducts.length > 0 ? (
        <div className="space-y-4 mb-8">
          {currentProducts.map((product) => {
            // Default icon based on category
            let IconComponent = Speaker
            if (product.category === 'Audio') IconComponent = Headphones
            else if (product.category === 'Wearables') IconComponent = Watch
            
            return (
              <Link href={`/product/${product._id}`} key={product._id}>
                <div className="group bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl">
                  <div className="flex items-center space-x-6">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain object-center group-hover:scale-110 transition-transform duration-300"
                        sizes="96px"
                      />
                      {/* Discount Badge */}
                      {product.discount&&product.discount!=='0% OFF'&& (
                        <div className="absolute top-1 right-1 bg-red-500 text-gray-100 px-1 py-0.5 rounded-full text-xs font-bold">
                          {product.discount}
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-white font-semibold text-lg group-hover:text-amber-400 transition-colors truncate">
                              {product.name}
                            </h3>
                            <span className="text-gray-400 text-sm bg-gray-600 px-2 py-1 rounded-full">
                              {product.category}
                            </span>
                          </div>
                          
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          
                          {/* Price */}
                          <div className="flex items-center gap-3">
                            <span className="text-amber-400 font-bold text-lg flex items-center gap-1">
                              <AedIcon className="text-amber-400" width={14} height={12} />
                              {product.priceValue?.toLocaleString()}
                            </span>
                            <span className="text-gray-400 line-through text-sm flex items-center gap-1">
                              <AedIcon className="text-gray-400" width={12} height={10} />
                              {extractPriceValue(product.originalPrice).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm transition-colors flex-shrink-0">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
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