'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const { cart, loading: cartLoading, updateCartItem, removeFromCart } = useCart()
  const router = useRouter()
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in')
    }
  }, [authLoading, user, router])

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    await updateCartItem(productId, newQuantity)
  }

  const handleRemoveItem = async (productId: string) => {
    await removeFromCart(productId)
  }

  // Calculate totals
  const subtotal = cart?.items?.reduce((sum, item) => {
    let price = 0
    try {
      // Handle different price formats (AED 1,299.00, 1299.00, etc.)
      if (item.productId?.price) {
        const priceStr = item.productId.price.toString()
        price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
      }
    } catch (error) {
      console.error('Error parsing price:', error)
      price = 0
    }
    return sum + (price * (item.quantity || 1))
  }, 0) || 0
  
  const shipping = 'Free'
  const discount = 0 
  const total = subtotal

  if (authLoading) {
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
            <ShoppingCart className="w-8 h-8" />
            Shopping Cart ({cart?.items?.length || 0} items)
          </h1>

          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-300 mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8">Start shopping to add items to your cart.</p>
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {cart.items.map((item) => (
                  <div key={item._id} className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gray-700 rounded-lg overflow-hidden">
                        <img 
                          src={item.productId.image} 
                          alt={item.productId.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{item.productId.name}</h3>
                        {item.color && (
                          <p className="text-sm text-gray-400 mb-2">Color: {item.color}</p>
                        )}
                        {item.size && (
                          <p className="text-sm text-gray-400 mb-2">Size: {item.size}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-amber-400">{item.productId.price}</span>
                          <span className="text-sm text-gray-500 line-through">{item.productId.originalPrice}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          className="p-2 rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white"
                          onClick={() => handleQuantityChange(item.productId._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium text-white">{item.quantity}</span>
                        <button 
                          className="p-2 rounded-lg border border-gray-600 hover:bg-gray-700 text-white"
                          onClick={() => handleQuantityChange(item.productId._id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg border border-gray-600"
                        onClick={() => handleRemoveItem(item.productId._id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-lg shadow-md p-6 sticky top-24 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-medium text-white">AED {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping</span>
                      <span className="font-medium text-white">{shipping}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discount</span>
                      <span className="font-medium text-white">AED {discount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-white">Total</span>
                        <span className="text-amber-400">AED {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Proceed to Checkout
                  </Link>

                  <Link
                    href="/shop"
                    className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center block border border-gray-600"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 