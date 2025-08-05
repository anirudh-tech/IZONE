'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Star, ShoppingCart, Heart, Check, ZoomIn, Filter, SortAsc, SortDesc, X } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { productsApi } from '@/lib/api'

interface Product {
  id: number
  name: string
  price: string
  originalPrice: string
  discount: string
  description: string
  image: string
  category: string
  inStock: boolean
  rating: number
  reviews: number
}

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    userName: 'Ahmed Al-Rashid',
    rating: 5,
    date: '2024-01-15',
    title: 'Excellent product!',
    comment: 'This iPhone is absolutely amazing. The camera quality is outstanding and the performance is incredible. Highly recommended!',
    verified: true,
    helpful: 12
  },
  {
    id: 2,
    userName: 'Sarah Johnson',
    rating: 4,
    date: '2024-01-10',
    title: 'Great but expensive',
    comment: 'The phone is fantastic, but it\'s quite expensive. The features are worth it though, especially the camera system.',
    verified: true,
    helpful: 8
  },
  {
    id: 3,
    userName: 'Mohammed Hassan',
    rating: 5,
    date: '2024-01-08',
    title: 'Best iPhone ever!',
    comment: 'I\'ve owned several iPhones and this is by far the best one. The battery life is incredible and the display is stunning.',
    verified: false,
    helpful: 15
  },
  {
    id: 4,
    userName: 'Emily Chen',
    rating: 3,
    date: '2024-01-05',
    title: 'Good but not perfect',
    comment: 'The phone is good overall, but I expected better battery life. The camera is great though.',
    verified: true,
    helpful: 5
  },
  {
    id: 5,
    userName: 'David Wilson',
    rating: 5,
    date: '2024-01-03',
    title: 'Outstanding performance',
    comment: 'This phone exceeds all my expectations. The A16 chip is incredibly fast and the camera system is revolutionary.',
    verified: true,
    helpful: 20
  },
  {
    id: 6,
    userName: 'Fatima Al-Zahra',
    rating: 4,
    date: '2024-01-01',
    title: 'Very satisfied',
    comment: 'Great phone with excellent features. The only minor issue is the price, but you get what you pay for.',
    verified: true,
    helpful: 7
  }
]

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [isInCart, setIsInCart] = useState(false)
  const [isInFavorites, setIsInFavorites] = useState(false)
  const [activeTab, setActiveTab] = useState('features')
  const [reviewFilter, setReviewFilter] = useState('all')
  const [reviewSort, setReviewSort] = useState('newest')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiProduct = await productsApi.getById(params.id)
        
        // Convert API product to match our interface
        const productData: Product = {
          id: parseInt(apiProduct._id),
          name: apiProduct.name,
          price: apiProduct.price,
          originalPrice: apiProduct.originalPrice,
          discount: apiProduct.discount || '',
          description: apiProduct.description || 'No description available',
          image: apiProduct.image,
          category: apiProduct.category || 'Uncategorized',
          inStock: apiProduct.inStock !== false,
          rating: apiProduct.rating || 0,
          reviews: apiProduct.reviews || 0
        }
        
        setProduct(productData)
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product')
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
            <p className="text-gray-400 mb-4">{error || 'The product you are looking for does not exist.'}</p>
            <Link href="/shop" className="text-amber-400 hover:text-amber-300">
              Back to Shop
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Helper function to extract numeric price value
  const extractPriceValue = (priceString: string): number => {
    const match = priceString.match(/AED\s*([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''))
    }
    return 0
  }

  // Helper function to extract numeric original price value
  const extractOriginalPriceValue = (priceString: string): number => {
    const match = priceString.match(/AED\s*([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''))
    }
    return 0
  }

  const priceValue = extractPriceValue(product.price)
  const originalPriceValue = extractOriginalPriceValue(product.originalPrice)
  const discountAmount = originalPriceValue - priceValue
  const discountPercentage = originalPriceValue > 0 ? Math.round((discountAmount / originalPriceValue) * 100) : 0

  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const handleAddToCart = () => {
    setIsInCart(true)
    // In a real app, this would add to cart state
    alert('Added to cart!')
  }

  const handleAddToFavorites = () => {
    setIsInFavorites(!isInFavorites)
    // In a real app, this would add to favorites state
    alert(isInFavorites ? 'Removed from favorites!' : 'Added to favorites!')
  }

  // Mock product images (since API doesn't provide multiple images)
  const productImages = [product.image]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/shop" className="flex items-center text-gray-400 hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative w-full h-96 bg-gray-800 rounded-lg overflow-hidden cursor-zoom-in"
              onMouseMove={handleImageHover}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseEnter={() => setIsZoomed(true)}
            >
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className={`object-contain transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                }}
              />
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-amber-400'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) ? 'text-amber-400 fill-current' : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-300">{product.rating}</span>
                </div>
                <span className="text-gray-400">({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-amber-400">{product.price}</span>
                <span className="text-xl text-gray-400 line-through">{product.originalPrice}</span>
                {product.discount && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.discount}
                  </span>
                )}
              </div>
              {discountAmount > 0 && (
                <p className="text-green-400 text-sm">You save AED {discountAmount}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`text-sm ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                    product.inStock
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleAddToFavorites}
                  className={`p-3 rounded-lg border transition-colors ${
                    isInFavorites
                      ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                      : 'border-gray-600 text-gray-400 hover:border-amber-400 hover:text-amber-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInFavorites ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>
            <div className="flex items-center gap-4">
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
              >
                <option value="all">All Reviews</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {mockReviews.map((review) => (
              <div key={review.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white">{review.userName}</span>
                      {review.verified && (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-600'
                          }`}
                        />
                      ))}
                      <span className="text-gray-400 text-sm">{review.date}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-amber-400 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-white mb-2">{review.title}</h3>
                <p className="text-gray-300 mb-4">{review.comment}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <button className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                    <Check className="w-4 h-4" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
} 