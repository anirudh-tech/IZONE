'use client'

import { useState, useEffect } from 'react'
import { Download, ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Link from 'next/link'
import AedIcon from '@/components/AedIcon'

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
  color?: string
}

interface Order {
  _id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  deliveredAt: string
  orderDate: string
  shippingAddress: string
  trackingNumber?: string
  notes?: string
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const { user } = useAuth()
  const { showToast } = useToast()

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/orders/${params.id}`)

        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }

        const data = await response.json()
        setOrder(data)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [user, params.id])

  const handleDownloadInvoice = async () => {
    if (!order) return

    try {
      setDownloadingInvoice(true)

      const response = await fetch(`/api/orders/${order._id}/invoice`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download invoice')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${order.orderNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showToast('Invoice downloaded successfully!', 'success')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      showToast(error instanceof Error ? error.message : 'Failed to download invoice', 'error')
    } finally {
      setDownloadingInvoice(false)
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />
      case 'processing':
        return <Package className="w-6 h-6 text-blue-500" />
      case 'shipped':
        return <Truck className="w-6 h-6 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Package className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12  border-amber-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
            <p className="text-gray-400 mb-4">{error || 'The order you are looking for does not exist.'}</p>
            <Link href="/orders" className="text-amber-400 hover:text-amber-300">
              Back to Orders
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Delivery timeline steps based on order status
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
      description: "We're preparing your order for shipment",
      icon: Package,
      completed: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered',
      time: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'In progress' : 'Within 24 hours'
    },
    {
      step: 3,
      title: 'Shipped',
      description: 'Your order is on its way to you',
      icon: Truck,
      completed: order.status === 'shipped' || order.status === 'delivered',
      time: order.status === 'shipped' || order.status === 'delivered' ? 'In progress' : '2-3 business days'
    },
    {
      step: 4,
      title: 'Delivered',
      description: 'Your order has been delivered',
      icon: CheckCircle,
      completed: order.status === 'delivered',
      time: order.status === 'delivered' ? 'Completed' : 'Estimated delivery date'
    }
  ]

  // Calculate estimated delivery date (3 days from order date)
  const estimatedDeliveryFrom = new Date(new Date(order.orderDate).getTime() + 4 * 24 * 60 * 60 * 1000)
  const estimatedDeliveryTo = new Date(new Date(order.orderDate).getTime() + 7 * 24 * 60 * 60 * 1000)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/orders" className="flex items-center text-gray-400 hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </div>

        {/* Order Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              {getStatusIcon(order.status)}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-gray-400">
                  Placed on {new Date(order.orderDate).toLocaleDateString()} {order.status === 'delivered' && order.deliveredAt ? ` - Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                Delivery Status:{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
               Payment Status: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.productName}</h3>
                      {item.color && (
                        <p className="text-gray-400 text-sm">Color: {item.color}</p>
                      )}
                      <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold flex items-center gap-1 justify-end">
                        <AedIcon className="text-white" width={14} height={12} />
                        {item.total.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm flex items-center gap-1 justify-end">
                        <AedIcon className="text-gray-400" width={12} height={10} />
                        {item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Delivery Timeline</h2>
              <div className="space-y-6">
                {deliverySteps.map((step, index) => {
                  const IconComponent = step.icon
                  return (
                    <div key={step.step} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                        <IconComponent className={`w-5 h-5 ${step.completed ? 'text-white' : 'text-gray-400'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`font-semibold ${step.completed ? 'text-white' : 'text-gray-400'
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
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Details */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white flex items-center gap-1">
                    <AedIcon className="text-white" width={14} height={12} />
                    {order.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-white">Free</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-amber-400 font-bold text-lg flex items-center gap-1">
                      <AedIcon className="text-amber-400" width={14} height={12} />
                      {order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Status</h2>
              <p className={`font-semibold capitalize ${order.status === 'pending' ? 'text-yellow-400' :
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


            {/* Delivered On */}
            {order.status === 'delivered' && order.deliveredAt && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Delivered On</h2>
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

            {/* Shipping Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Shipping Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Shipping Address</p>
                  <p className="text-white">{order.shippingAddress}</p>
                </div>
                {order.trackingNumber && (
                  <div>
                    <p className="text-gray-400 text-sm">Tracking Number</p>
                    <p className="text-white font-mono">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
              <div className="space-y-3">
                {order.status === 'delivered' && (
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={downloadingInvoice}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {downloadingInvoice ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
                  </button>
                )}

                <Link
                  href="/shop"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 