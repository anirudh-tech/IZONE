'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { productsApi, Product } from '@/lib/api'

const typingTexts = [
  "Discover Amazing",
  "Cutting-Edge",
  "Premium Quality",
  "Innovative",
  "Revolutionary"
]

export default function Hero() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const products = await productsApi.getAll()
        setFeaturedProducts(products)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products')
        // Fallback to default products if API fails
        setFeaturedProducts([
          {
            _id: '1',
            name: 'iPhone 14 Pro Max',
            price: 'AED 1,099',
            originalPrice: 'AED 1,499',
            image: '/iphone14F-removebg-preview.png',
            discount: '25% OFF'
          },
          {
            _id: '2',
            name: 'Apple Watch Series 8',
            price: 'AED 1,499',
            originalPrice: 'AED 1,899',
            image: '/iphone14s-removebg-preview.png',
            discount: '20% OFF'
          },
          {
            _id: '3',
            name: 'AirPods Pro 2nd Gen',
            price: 'AED 749',
            originalPrice: 'AED 949',
            image: '/iphone14c-removebg-preview.png',
            discount: '20% OFF'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Banner products - duplicate the featured products for continuous scrolling
  const bannerProducts = [
    ...featuredProducts,
    ...featuredProducts, // Duplicate for seamless loop
    ...featuredProducts  // Triple for smooth scrolling
  ]

  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 100
    const deletingSpeed = 50
    const pauseTime = 2000

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentCharIndex < typingTexts[currentTextIndex].length) {
          setDisplayText(typingTexts[currentTextIndex].slice(0, currentCharIndex + 1))
          setCurrentCharIndex(currentCharIndex + 1)
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        if (currentCharIndex > 0) {
          setDisplayText(typingTexts[currentTextIndex].slice(0, currentCharIndex - 1))
          setCurrentCharIndex(currentCharIndex - 1)
        } else {
          setIsDeleting(false)
          setCurrentTextIndex((currentTextIndex + 1) % typingTexts.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timer)
  }, [currentCharIndex, isDeleting, currentTextIndex])

  return (
    <section className="bg-gradient-to-br from-gray-800 to-gray-900 min-h-screen flex items-center justify-center relative overflow-hidden w-full">
      {/* Animated Background Elements */}
      <div className="fixed z-0 inset-0">
        <Image
          src="/background-desert.jpg"
          alt="Desert background"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 opacity-80"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Desert landscape overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-700 to-transparent"></div>
      </div>

      

      {/* Moving Banner */}

      <div className="relative z-10 text-center w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-8 mt-5">
        <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white py-3 px-4 rounded-lg shadow-lg overflow-hidden relative border border-gray-600/30">
          <div className="flex items-center justify-center">
            {loading ? (
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
                <span className="text-white">Loading products...</span>
              </div>
            ) : error ? (
              <div className="text-red-400">Failed to load products</div>
            ) : (
              <div className="animate-scroll-banner whitespace-nowrap flex items-center">
                {bannerProducts.map((product, index) => (
                  <div key={`${product._id}-${index}`} className="inline-flex items-center mx-6 bg-gray-700/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-600/50">
                    {/* Product Image */}
                    <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill 
                        className="object-contain" 
                        sizes="48px"
                      />
                    </div>
                    {/* Product Info */}
                    <div className="flex flex-col">
                      <span className="text-white font-semibold text-sm whitespace-nowrap">
                        {product.name}
                      </span>
                      <span className="text-amber-400 text-xs">
                        {product.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Gradient overlay for smooth edges */}
          <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-gray-800 to-transparent"></div>
          <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-gray-800 to-transparent"></div>
        </div>
      </div>
        
        {/* Main headline with typing animation */}
        <div className="mb-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              {displayText}
            </span>
            <span className="animate-pulse">|</span>
            <br />
            <span className="text-white">Technology</span>
          </h1>
        </div>
        
        {/* Sub headline with fade-in animation */}
        <div className="mb-12 animate-fade-in">
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Experience the future of innovation with our curated collection of 
            <span className="text-amber-400 font-semibold"> premium devices</span> that redefine what&apos;s possible.
          </p>
        </div>

        {/* Product showcase - Multiple products with staggered animation */}
        <div className="mt-16 flex justify-center items-center relative">
          {loading ? (
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              <span className="text-white text-lg">Loading featured products...</span>
            </div>
          ) : error ? (
            <div className="text-red-400 text-lg">Failed to load featured products</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredProducts.map((product, index) => (
                <Link href={`/product/${product._id}`} key={product._id}>
                  <div 
                    className="group relative bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-700/90 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border border-gray-700/50 hover:border-amber-500/50"
                    style={{
                      animationDelay: `${index * 0.2}s`,
                      animation: 'slideInUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Discount badge with pulse animation */}
                    <div className="absolute z-10 top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      {product.discount}
                    </div>
                    
                    {/* Product image with hover effects */}
                    <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg bg-gray-700/50">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill 
                        className="object-contain object-center transition-all duration-500 group-hover:scale-110" 
                        priority 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Product info with staggered animation */}
                    <div className="space-y-3">
                      <h3 className="text-white font-semibold text-lg group-hover:text-amber-400 transition-colors duration-300">
                        {product.name}
                      </h3>
                      
                      {/* Price with gradient text */}
                      <div className="flex items-center gap-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 font-bold text-xl">
                          {product.price}
                        </span>
                        <span className="text-gray-400 line-through text-sm">{product.originalPrice}</span>
                      </div>
                      
                      {/* Animated button */}
                      <div className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-center font-semibold transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg">
                        View Details
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Shop Now button with gradient and animation */}
        <div className="mt-16 animate-bounce-in">
          <Link href="/shop">
            <button className="relative bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                🛍️ Shop All Products
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </Link>
        </div>

        {/* Floating stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="text-3xl font-bold text-amber-400 mb-2">500+</div>
            <div className="text-gray-400">Happy Customers</div>
          </div>
          <div className="text-center animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <div className="text-3xl font-bold text-amber-400 mb-2">50+</div>
            <div className="text-gray-400">Premium Products</div>
          </div>
          <div className="text-center animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <div className="text-3xl font-bold text-amber-400 mb-2">24/7</div>
            <div className="text-gray-400">Customer Support</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scroll-banner {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        
        .animate-scroll-banner {
          animation: scroll-banner 20s linear infinite;
        }
      `}</style>
    </section>
  )
} 