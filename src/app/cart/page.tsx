'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Loader2, Trash2, Plus, Minus, ShoppingCart, ArrowRight, Home, Package, Truck, CheckCircle, AlertCircle, CreditCard } from 'lucide-react'
import AedIcon from '@/components/AedIcon'
import { createSupabaseClient } from '@/lib/supabase'

export default function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const { cart, loading: cartLoading, updateCartItem, removeFromCart, refreshCart } = useCart()
  const router = useRouter()
  const { showToast } = useToast()
  const [validating, setValidating] = useState(false)
  
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

  const getAvailableStockForItem = (item: any): number => {
    const colors = item?.productId?.colors
    if (Array.isArray(colors) && colors.length > 0) {
      const entry = colors.find((c: any) => c.name === item.color)
      return typeof entry?.stock === 'number' ? entry.stock : 0
    }
    return 999
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

  if (authLoading||cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12  border-amber-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  const handleProceedToCheckout = async () => {
    if (!cart || cart.items.length === 0) return
    setValidating(true)
    try {
      const supabase = createSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        showToast('Please sign in again', 'warning')
        router.push('/sign-in')
        return
      }

      const res = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || 'Failed to validate cart', 'error')
        return
      }

      const data = await res.json()
      const changes = data.changes as Array<any>

      if (Array.isArray(changes) && changes.length > 0) {
        // Build a concise notification
        const removed = changes.filter(c => c.type === 'removed')
        const adjusted = changes.filter(c => c.type === 'adjusted')

        if (removed.length > 0) {
          const names = removed.map(c => `${c.productName || 'Item'}${c.color ? ` (${c.color})` : ''}`).join(', ')
          showToast(`Removed: ${names}. Reason: ${removed[0].reason || 'Out of stock'}`, 'warning')
        }
        if (adjusted.length > 0) {
          const summaries = adjusted.map(c => `${c.productName || 'Item'}${c.color ? ` (${c.color})` : ''} ${c.fromQty}>${c.toQty}`)
          showToast(`Adjusted qty due to limited stock: ${summaries.join(', ')}`, 'info')
        }

        // Refresh cart from server to reflect changes
        await refreshCart()

        // If cart is now empty, stop navigation
        if (!data.cart || !data.cart.items || data.cart.items.length === 0) {
          showToast('Your cart has no available stock to checkout.', 'warning')
          return
        }
      }

      // Navigate to checkout
      router.push('/checkout')
    } catch (e) {
      console.error('Cart validation error:', e)
      showToast('Failed to validate cart. Please try again.', 'error')
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="truncate">Shopping Cart ({cart?.items?.length || 0} items)</span>
          </h1>

          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <ShoppingCart className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-300 mb-3 sm:mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Start shopping to add items to your cart.</p>
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {cart.items.map((item) => (
                  <div key={item._id} className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-700">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="flex gap-4 mb-4">
                        <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.productId.image} 
                            alt={item.productId.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white truncate mb-1">{item.productId.name}</h3>
                          {item.color && (
                            <p className="text-sm text-gray-400 mb-1">Color: {item.color}</p>
                          )}
                          {item.size && (
                            <p className="text-sm text-gray-400 mb-2">Size: {item.size}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-amber-400 flex items-center gap-1">
                              <AedIcon className="text-amber-400" width={14} height={12} />
                              {parseFloat(item.productId.price?.toString().replace(/[^0-9.]/g, '')) || 0}
                            </span>
                            {item.productId.discount!=='0% OFF' && (
                            <span className="text-sm text-gray-500 line-through flex items-center gap-1">
                              <AedIcon className="text-gray-500" width={12} height={10} />
                              {parseFloat(item.productId.originalPrice?.toString().replace(/[^0-9.]/g, '')) || 0}
                            </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile quantity and remove controls */}
                      <div className="flex items-center justify-between">
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
                            className="p-2 rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white"
                            onClick={() => handleQuantityChange(item.productId._id, Math.min(item.quantity + 1, getAvailableStockForItem(item)))}
                            disabled={item.quantity >= getAvailableStockForItem(item)}
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

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
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
                          <span className="text-lg font-bold text-amber-400 flex items-center gap-1">
                            <AedIcon className="text-amber-400" width={14} height={12} />
                            {parseFloat(item.productId.price?.toString().replace(/[^0-9.]/g, '')) || 0}
                          </span>
                          {item.productId.discount!=='0% OFF' && (
                          <span className="text-sm text-gray-500 line-through flex items-center gap-1">
                            <AedIcon className="text-gray-500" width={12} height={10} />
                            {parseFloat(item.productId.originalPrice?.toString().replace(/[^0-9.]/g, '')) || 0}
                          </span>
                          )}
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
                          className="p-2 rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white"
                          onClick={() => handleQuantityChange(item.productId._id, Math.min(item.quantity + 1, getAvailableStockForItem(item)))}
                          disabled={item.quantity >= getAvailableStockForItem(item)}
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
                <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-24 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4 sm:mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 sm:space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-medium text-white flex items-center gap-1">
                        <AedIcon className="text-white" width={14} height={12} />
                        {subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping</span>
                      <span className="font-medium text-white">{shipping}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discount</span>
                      <span className="font-medium text-white flex items-center gap-1">
                        <AedIcon className="text-white" width={14} height={12} />
                        {discount.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-600 pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-white">Total</span>
                        <span className="text-amber-400 flex items-center gap-1">
                          <AedIcon className="text-amber-400" width={14} height={12} />
                          {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    disabled={validating || !cart || cart.items.length === 0}
                    className={`w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${validating ? 'opacity-70 cursor-not-allowed' : 'hover:from-amber-600 hover:to-amber-700'}`}
                  >
                    {validating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="hidden sm:inline">Validating stock...</span>
                        <span className="sm:hidden">Validating...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span className="hidden sm:inline">Proceed to Checkout</span>
                        <span className="sm:hidden">Checkout</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/shop"
                    className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center block border border-gray-600 text-sm sm:text-base"
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