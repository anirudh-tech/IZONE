'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Loader2, Download, Share2, Home, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { ordersApi, Order } from '@/lib/api'
import AedIcon from '@/components/AedIcon'

function OrderConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    } else {
      setError('No order ID provided')
      setLoading(false)
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const orderData = await ordersApi.getById(orderId!)
      setOrder(orderData)
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Failed to fetch order details')
      showToast('Failed to fetch order details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const deliverySteps = [
    {
      step: 1,
      title: 'Order Confirmed',
      description: 'Your order has been received and confirmed',
      icon: CheckCircle,
      completed: true,
      time: 'Just now'
    },
    {
      step: 2,
      title: 'Processing',
      description: 'We\'re preparing your order for shipment',
      icon: Package,
      completed: order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'delivered',
      time: order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'delivered' ? 'In progress' : 'Within 24 hours'
    },
    {
      step: 3,
      title: 'Shipped',
      description: 'Your order is on its way to you',
      icon: Truck,
      completed: order?.status === 'shipped' || order?.status === 'delivered',
      time: order?.status === 'shipped' || order?.status === 'delivered' ? 'In progress' : '2-3 business days'
    },
    {
      step: 4,
      title: 'Delivered',
      description: 'Your order has been delivered',
      icon: CheckCircle,
      completed: order?.status === 'delivered',
      time: order?.status === 'delivered' ? 'Completed' : 'Estimated delivery date'
    }
  ]

  const handleDownloadInvoice = () => {
    // In a real app, this would generate and download a PDF invoice
    showToast('Invoice download started!', 'success')
  }

  const handleShareOrder = () => {
    if (!order) return
    
    // In a real app, this would share order details
    if (navigator.share) {
      navigator.share({
        title: 'My Order',
        text: `Order ${order.orderNumber || order._id} - TECHSSOUQ`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`Order ${order.orderNumber || order._id} - TECHSSOUQ`)
      showToast('Order link copied to clipboard!', 'success')
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="animate-spin rounded-full h-12 w-12  border-amber-400 mx-auto mb-4" />
              <p className="text-gray-300">Loading order details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Show error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Not Found</h1>
            <p className="text-gray-300 mb-6">
              {error || 'Unable to load order details. Please check your order ID and try again.'}
            </p>
            <button
              onClick={() => router.push('/orders')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View My Orders
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Calculate estimated delivery date (3 days from order date)
  const estimatedDeliveryFrom = new Date(new Date(order.orderDate).getTime() + 4 * 24 * 60 * 60 * 1000)
  const estimatedDeliveryTo = new Date(new Date(order.orderDate).getTime() + 7 * 24 * 60 * 60 * 1000)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-gray-300 mb-4">
            Thank you for your purchase. We've received your order and will begin processing it right away.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 inline-block">
            <p className="text-amber-400 font-semibold">Order #{order.orderNumber || order._id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  
                  // Handle both populated product data and direct image fields
                  const imageUrl = item.image || (
                    typeof item.productId === 'object' && 
                    item.productId !== null && 
                    'image' in item.productId ? 
                    item.productId.image : null
                  )
 
                  
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                      <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                           
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.nextElementSibling?.classList.remove('hidden')
                            }}
                            
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-500 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="w-full h-full bg-gray-500 rounded-lg flex items-center justify-center hidden">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.productName}</p>
                        <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                        {(item.color || item.size) && (
                          <div className="text-gray-400 text-xs space-y-1">
                            {item.color && <p>Color: {item.color}</p>}
                            {item.size && <p>Size: {item.size}</p>}
                          </div>
                        )}
                        {!imageUrl && (
                          <p className="text-red-400 text-xs">No image available</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 font-bold flex items-center gap-1 justify-end">
                          <AedIcon className="text-amber-400" width={14} height={12} />
                          {item.price.toFixed(2)}
                        </p>
                        <p className="text-gray-400 text-sm flex items-center gap-1 justify-end">
                          Total:
                          <AedIcon className="text-gray-400" width={12} height={10} />
                          {item.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Delivery Timeline</h2>
              <div className="space-y-6">
                {deliverySteps.map((step, index) => {
                  const IconComponent = step.icon
                  return (
                    <div key={step.step} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.completed ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          step.completed ? 'text-white' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`font-semibold ${
                            step.completed ? 'text-white' : 'text-gray-400'
                          }`}>
                            {step.title}
                          </h3>
                          {step.completed && (
                            <span className="text-green-400 text-sm">✓ Completed</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-1">{step.description}</p>
                        <p className="text-gray-500 text-xs">{step.time}</p>
                      </div>
                      {index < deliverySteps.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-600 ml-5"></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Delivery Address</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-white font-medium">{order.customerName}</p>
                <p className="text-gray-300">{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white flex items-center gap-1">
                    <AedIcon className="text-white" width={14} height={12} />
                    {(order.subtotal || order.totalAmount).toFixed(2)}
                  </span>
                </div>
                {order.tax !== undefined && order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tax (VAT 5%)</span>
                    <span className="text-white flex items-center gap-1">
                      <AedIcon className="text-white" width={14} height={12} />
                      {order.tax.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-300">Shipping</span>
                  <span className="text-white">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <AedIcon className="text-amber-400" width={14} height={12} />
                    {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-medium mb-2">Payment Method</h3>
                <p className="text-gray-300">Cash on Delivery</p>
              </div>

              {/* Order Status */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-medium mb-2">Order Status</h3>
                <p className={`font-semibold capitalize ${
                  order.status === 'pending' ? 'text-yellow-400' :
                  order.status === 'processing' ? 'text-blue-400' :
                  order.status === 'shipped' ? 'text-purple-400' :
                  order.status === 'delivered' ? 'text-green-400' :
                  'text-red-400'
                }`}>
                  {order.status}
                </p>
              </div>

              {/* Estimated Delivery */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg">
              <h2 className="text-1xl font-bold text-white mb-3 text-center">
                📦 Estimated Delivery
              </h2>
              <div className="flex flex-col items-center text-green-400 font-semibold text-sm space-y-1">
                <p>
                  {estimatedDeliveryFrom.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <span className="text-white">to</span>
                <p>
                  {estimatedDeliveryTo.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>


              {/* Actual Delivery Time */}
              {order.status === 'delivered' && order.deliveredAt && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Delivered On</h3>
                  <p className="text-green-400 font-semibold">
                    {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleDownloadInvoice}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Invoice
                </button>
                <button
                  onClick={handleShareOrder}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share Order
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Continue Shopping
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-medium mb-2">Need Help?</h3>
                <p className="text-gray-300 text-sm mb-2">
                  If you have any questions about your order, please contact our support team.
                </p>
                <p className="text-amber-400 text-sm font-medium">
                  {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'techssouquae@gmail.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <Header />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="animate-spin rounded-full h-12 w-12  border-amber-400 mx-auto mb-4" />
                <p className="text-gray-300">Loading order details...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  )
}