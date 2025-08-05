'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Heart } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'

// Mock cart data - in a real app, this would come from a state management system
const initialCartItems = [
  {
    id: 1,
    name: 'iPhone 14 Pro Max',
    price: 1099,
    originalPrice: 1499,
    image: '/iphone14F-removebg-preview.png',
    quantity: 2,
    color: 'Deep Purple',
    inStock: true
  },
  {
    id: 2,
    name: 'Apple Watch Series 8',
    price: 1499,
    originalPrice: 1899,
    image: '/iphone14s-removebg-preview.png',
    quantity: 1,
    color: 'Midnight',
    inStock: true
  },
  {
    id: 3,
    name: 'AirPods Pro 2nd Generation',
    price: 749,
    originalPrice: 949,
    image: '/iphone14c-removebg-preview.png',
    quantity: 1,
    color: 'White',
    inStock: true
  }
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const originalSubtotal = cartItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0)
  const savings = originalSubtotal - subtotal
  const shipping = subtotal > 0 ? 0 : 0 // Free shipping
  const total = subtotal + shipping
  const navigate=useRouter()

  // Update quantity
  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  // Remove item from cart
  const removeItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Move to favorites
  const moveToFavorites = (itemId: number) => {
    // In a real app, this would add to favorites and remove from cart
    removeItem(itemId)
  }

  // Checkout function
  const handleCheckout = async () => {
    setIsLoading(true)
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    // In a real app, this would redirect to payment gateway
    navigate.push('/checkout')

  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-400 mb-8">Looks like you haven't added any items to your cart yet.</p>
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
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-white mb-6">Shopping Cart ({cartItems.length} items)</h1>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-6 flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain rounded-lg"
                      sizes="128px"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-semibold text-lg">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2">Color: {item.color}</p>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-amber-400 font-bold text-lg">AED {item.price}</span>
                      <span className="text-gray-400 line-through">AED {item.originalPrice}</span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-600 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 text-white border-x border-gray-600">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-semibold">AED {item.price * item.quantity}</p>
                        <button
                          onClick={() => moveToFavorites(item.id)}
                          className="text-gray-400 hover:text-pink-400 transition-colors text-sm flex items-center gap-1"
                        >
                          <Heart className="w-4 h-4" />
                          Move to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal ({cartItems.length} items)</span>
                  <span className="text-white">AED {subtotal}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Savings</span>
                    <span>-AED {savings}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-white font-bold text-lg">AED {total}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              {/* Additional Info */}
              <div className="mt-6 space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Free shipping on orders over AED 500</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 