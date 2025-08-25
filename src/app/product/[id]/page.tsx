'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Star, ShoppingCart, Heart, Check, ZoomIn, Filter, SortAsc, SortDesc, X, ChevronLeft, ChevronRight, Loader2, Eye } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AedIcon from '@/components/AedIcon'
import ReviewsDisplay from '@/components/ReviewsDisplay'
import { productsApi, Product } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

interface ColorStock {
  name: string
  stock: number
  inStock: boolean
}



export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState('features')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [operationLoading, setOperationLoading] = useState<string | null>(null)
  
  // Context hooks
  const { user } = useAuth()
  const { addToCart, cart } = useCart()
  const { showToast } = useToast()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()

  // Check if product is in cart and favorites
  const isInCart = cart?.items?.some(item => item.productId._id === params.id) || false
  const isInFavorites = isFavorite(params.id)

    // Helper function to get available stock
    const getAvailableStock = (): number => {
      if (product?.showColors && product.colors && product.colors.length > 0) {
        // If colors are available, use selected color's stock
        const selectedColorData = product.colors[selectedColor]
        return selectedColorData ? selectedColorData.stock : 0
      }
      // If no colors, assume unlimited stock (you can modify this based on your needs)
      // You might want to add a general stock field to your Product interface
      return 999
    }
  
    const availableStock = getAvailableStock()

   // Reset quantity if it exceeds available stock when color changes
   useEffect(() => {
    if (quantity > availableStock) {
      setQuantity(Math.min(quantity, availableStock))
    }
  }, [selectedColor, availableStock, quantity])

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiProduct = await productsApi.getById(params.id)
        
        setActiveTab(apiProduct.showFeatures?'features':apiProduct.showSpecifications?'specifications':'reviews')
        setProduct(apiProduct)
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

  // Ensure initially selected color is in stock. If not, pick the first in-stock color (or none)
  useEffect(() => {
    if (product?.showColors && product.colors && product.colors.length > 0) {
      const currentIsValid = selectedColor >= 0 && !!product.colors[selectedColor]?.inStock
      if (!currentIsValid) {
        const firstInStockIndex = product.colors.findIndex(c => c.inStock)
        setSelectedColor(firstInStockIndex !== -1 ? firstInStockIndex : -1)
      }
    }
  }, [product?.colors, product?.showColors])

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

  const priceValue = extractPriceValue(product.price)
  const originalPriceValue = extractPriceValue(product.originalPrice)
  const discountAmount = originalPriceValue - priceValue
  const discountPercentage = originalPriceValue > 0 ? Math.round((discountAmount / originalPriceValue) * 100) : 0

  const formatViews = (count: number): string => {
    if (count >= 100000) {
      const value = count / 100000
      const formatted = value.toFixed(value >= 10 ? 0 : 1).replace(/\.0$/, '')
      return `${formatted}L`
    }
    if (count >= 1000) {
      const value = count / 1000
      const formatted = value.toFixed(value >= 10 ? 0 : 1).replace(/\.0$/, '')
      return `${formatted}k`
    }
    return count.toString()
  }



  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

 

  const handleAddToCart = async () => {
    if (!user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/sign-in'
      return
    }

    // Validate color selection if colors are available
    if (product?.colors && product.colors.length > 0) {
      const selectedColorData = product.colors[selectedColor]
      if (!selectedColorData || !selectedColorData.inStock) {
        showToast('Please select an available color', 'warning')
        return
      }
    }

    // Get selected color name
    const selectedColorName = product?.colors && product.colors.length > 0 
      ? product.colors[selectedColor]?.name || ''
      : ''

    try {
      setOperationLoading('cart')
      await addToCart(params.id, quantity, selectedColorName)
      
      // Remove from favorites if it was in favorites
      if (isInFavorites) {
        await removeFromFavorites(params.id)
      }
      
      showToast('Added to cart successfully!', 'success')
      setTimeout(() => setOperationLoading(null), 1000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      showToast('Failed to add to cart. Please try again.', 'error')
      setOperationLoading(null)
    }
  }

  const handleAddToFavorites = async () => {
    if (!user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/sign-in'
      return
    }

    try {
      setOperationLoading('favorites')
      if (isInFavorites) {
        await removeFromFavorites(params.id)
        showToast('Removed from favorites!', 'success')
      } else {
        await addToFavorites(params.id)
        showToast('Added to favorites!', 'success')
      }
      setTimeout(() => setOperationLoading(null), 1000)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      showToast('Failed to update favorites. Please try again.', 'error')
      setOperationLoading(null)
    }
  }

  // Get all product images
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image]

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
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-gray-100 p-2 rounded-full hover:bg-opacity-75 transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              
              {/* Image Navigation */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : productImages.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-gray-100 p-2 rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(selectedImage < productImages.length - 1 ? selectedImage + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-gray-100 p-2 rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
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
                        i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-current' : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-300">{product.rating || 0}</span>
                </div>
                <span className="text-gray-400">({product.reviewCount || 0} reviews)</span>
                <div className="flex items-center gap-1 text-gray-400">
                  <Eye className="w-5 h-5" />
                  <span>{formatViews(product.views || 0)}</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-amber-400 flex items-center gap-2">
                  <AedIcon className="text-amber-400" width={18} height={16} />
                  {extractPriceValue(product.price).toLocaleString()}
                </span>
                {discountAmount>0&&(
                  <span className="text-xl text-gray-400 line-through flex items-center gap-2">
                    <AedIcon className="text-gray-400" width={14} height={12} />
                    {extractPriceValue(product.originalPrice).toLocaleString()}
                  </span>
                )}
               
                {product.discount&&product.discount!=='0% OFF'&& (
                  <span className="bg-red-500 text-gray-100 px-3 py-1 rounded-full text-sm font-bold">
                    {product.discount}
                  </span>
                )}
              </div>
              {discountAmount > 0 && (
                <p className="text-green-400 text-sm flex items-center gap-1">
                  You save
                  <AedIcon className="text-green-400" width={12} height={10} />
                  {discountAmount}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">{product.description || 'No description available'}</p>
            </div>

            {/* Colors */}
            {product.showColors && product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Color Options
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        selectedColor === index
                          ? 'border-amber-400 bg-amber-400 text-white font-semibold text-base'
                          : color.inStock
                          ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                          : 'border-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!color.inStock}
                    >
                      <span>{color.name}</span>
                      <span className="text-xs">({color.stock} left)</span>
                    </button>
                  ))}
                </div>
                {selectedColor >= 0 && product.colors[selectedColor] && (
                  <p className="text-sm text-gray-400 mt-2">
                    Selected: <span className="text-amber-400">{product.colors[selectedColor].name}</span>
                  </p>
                )}
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product?.colors?.[selectedColor]?.inStock ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`text-sm ${product?.colors?.[selectedColor]?.inStock ? 'text-green-400' : 'text-red-400'}`}>
                {product?.colors?.[selectedColor]?.inStock ? 'In Stock' : 'Out of Stock'}
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
                    onClick={() => setQuantity(Math.min(quantity + 1, availableStock))}
                    disabled={quantity >= availableStock}
                    className={`px-3 py-2 transition-colors ${
                      quantity >= availableStock 
                        ? 'text-gray-600 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    +
                  </button>
                </div>
                {availableStock < 999 && (
                  <div className="text-sm text-gray-400">
                    {availableStock - quantity} of {availableStock} available
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product?.colors?.[selectedColor]?.inStock || operationLoading === 'cart' || (!product?.colors || product.colors.length === 0 || !product.colors[selectedColor]?.inStock)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                    product?.colors?.[selectedColor]?.inStock
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  } ${operationLoading === 'cart' ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {operationLoading === 'cart' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                  Add to Cart
                </button>
                <button
                  onClick={handleAddToFavorites}
                  disabled={operationLoading === 'favorites'}
                  className={`p-3 rounded-lg border transition-colors ${
                    isInFavorites
                      ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                      : 'border-gray-600 text-gray-400 hover:border-amber-400 hover:text-amber-400'
                  } ${operationLoading === 'favorites' ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isInFavorites ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8">
              {product.showFeatures && product.features && product.features.length > 0 && (
                <button
                  onClick={() => setActiveTab('features')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'features'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Features
                </button>
              )}
              {product.showSpecifications && product.specifications && Object.keys(product.specifications).length > 0 && (
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'specifications'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Specifications
                </button>
              )}
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Reviews
              </button>
            </nav>
          </div>

          <div className="py-8">
            {/* Features Tab */}
            {activeTab === 'features' && product.showFeatures && product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Product Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && product.showSpecifications && product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Product Specifications</h3>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <div key={index} className={`flex py-4 px-6 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                      <div className="w-1/3 font-semibold text-gray-300">{key}</div>
                      <div className="w-2/3 text-gray-400">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <ReviewsDisplay productId={params.id} />
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
} 