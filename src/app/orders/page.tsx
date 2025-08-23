'use client'

import { useState, useEffect } from 'react'
import { Download, Eye, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Link from 'next/link'
import AedIcon from '@/components/AedIcon'
import ReviewForm from '@/components/ReviewForm'
import { reviewsApi, Review } from '@/lib/api'

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
  image:string
  color?: string
}

interface Order {
  _id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  deliveredAt?: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  orderDate: string
  shippingAddress: string
  trackingNumber?: string
  notes?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)
  const { user } = useAuth()
  const { showToast } = useToast()
  const [userReviews, setUserReviews] = useState<Record<string, Review>>({})
  const [loadingUserReviews, setLoadingUserReviews] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [modalContext, setModalContext] = useState<{ orderId: string; productId: string } | null>(null)

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/orders/user', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        
        const data = await response.json()
        setOrders(data)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  // Build a unique key for an order-item review
  const getReviewKey = (orderId: string | unknown, productId: string | unknown) => `${String(orderId)}:${String(productId)}`

  const extractId = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && (value as { _id?: unknown })._id) {
      return String((value as { _id?: unknown })._id)
    }
    return String(value ?? '')
  }

  // After orders load, fetch this user's reviews once and index by orderId+productId
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user || orders.length === 0) return
      try {
        setLoadingUserReviews(true)
        const reviews = await reviewsApi.getAll({ customerId: user.id })
        const map: Record<string, Review> = {}
        reviews.forEach((r) => {
          const orderIdVal = typeof r.orderId === 'string' ? r.orderId : (r.orderId as any)?._id
          const productIdVal = typeof r.productId === 'string' ? r.productId : (r.productId as any)?._id
          if (orderIdVal && productIdVal) {
            map[getReviewKey(orderIdVal, productIdVal)] = r
          }
        })
        setUserReviews(map)
      } catch (err) {
        console.error('Error fetching user reviews:', err)
      } finally {
        setLoadingUserReviews(false)
      }
    }

    fetchUserReviews()
  }, [user, orders])

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      setDownloadingInvoice(orderId)
      
      const response = await fetch(`/api/orders/${orderId}/invoice`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download invoice')
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const anchorElement = document.createElement('a')
      anchorElement.href = url
      anchorElement.download = `invoice-${orderId}.pdf`
      document.body.appendChild(anchorElement)
      anchorElement.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(anchorElement)
      
      showToast('Invoice downloaded successfully!', 'success')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      showToast(error instanceof Error ? error.message : 'Failed to download invoice', 'error')
    } finally {
      setDownloadingInvoice(null)
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
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

  const openReviewModal = (orderId: string, productId: string) => {
    setModalContext({ orderId, productId })
    setIsReviewModalOpen(true)
  }

  const closeReviewModal = () => {
    setIsReviewModalOpen(false)
    setModalContext(null)
  }

  const getCustomerName = () => {
    const meta = (user?.user_metadata ?? {}) as Record<string, unknown>
    const first = typeof meta['first_name'] === 'string' ? (meta['first_name'] as string) : undefined
    const last = typeof meta['last_name'] === 'string' ? (meta['last_name'] as string) : undefined
    const full = typeof meta['full_name'] === 'string' ? (meta['full_name'] as string) : undefined
    const derived = full || [first, last].filter(Boolean).join(' ').trim()
    return derived || (user?.email ? user.email.split('@')[0] : 'User')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Error Loading Orders</h1>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-amber-400 hover:text-amber-300"
            >
              Try Again
            </button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-gray-400">Track your orders and download invoices</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Orders Yet</h2>
            <p className="text-gray-400 mb-6">You haven&apos;t placed any orders yet.</p>
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-gray-400">
                       Ordered On: {new Date(order.orderDate).toLocaleDateString()}  {order.deliveredAt?<span className='text-green-400'>- Delivered On: {new Date(order.deliveredAt).toLocaleDateString()}</span>:''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      Delivery Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      Payment Status: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
                

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Amount</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      <AedIcon className="text-white" width={14} height={12} />
                      {order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Items</p>
                    <p className="text-white">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Shipping Address</p>
                    <p className="text-white text-sm">{order.shippingAddress}</p>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <p className="text-gray-400 text-sm">Tracking Number</p>
                      <p className="text-white text-sm">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={item.image} alt="product" className="w-12 h-12 sm:w-10 sm:h-10 object-cover rounded-lg flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-white truncate">{item.productName}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                  {item.color && (
                                    <span className="text-gray-400 text-xs">Color: {item.color}</span>
                                  )}
                                  {(order.status === 'delivered' && order.paymentStatus === 'paid') && (
                                    <button
                                      onClick={() => openReviewModal(order._id, extractId(item.productId))}
                                      disabled={loadingUserReviews}
                                      className="text-amber-400 hover:text-amber-300 underline text-xs"
                                    >
                                      {userReviews[getReviewKey(order._id, extractId(item.productId))] ? 'Edit Review' : 'Rate Your Experience'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="sm:text-right flex items-center justify-between sm:justify-end gap-4">
                              <p className="text-white">Qty: {item.quantity}</p>
                              <p className="text-gray-400 flex items-center gap-1">
                                <AedIcon className="text-gray-400" width={12} height={10} />
                                {item.total.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/order/${order._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                      
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleDownloadInvoice(order._id)}
                          disabled={downloadingInvoice === order._id}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {downloadingInvoice === order._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Download Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />

      {/* Review Modal */}
      {isReviewModalOpen && modalContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            role="button"
            tabIndex={0}
            aria-label="Close review modal"
            onClick={closeReviewModal}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                closeReviewModal()
              }
            }}
          />
          <div className="relative z-10 w-full max-w-2xl mx-4">
            <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <h3 className="text-white font-semibold text-lg">
                  {userReviews[getReviewKey(modalContext.orderId, modalContext.productId)] ? 'Edit Review' : 'Rate Your Experience'}
                </h3>
                <button onClick={closeReviewModal} className="text-gray-400 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <ReviewForm
                  productId={modalContext.productId}
                  orderId={modalContext.orderId}
                  customerId={user?.id || ''}
                  customerName={getCustomerName()}
                  customerEmail={user?.email || ''}
                  existingReview={userReviews[getReviewKey(modalContext.orderId, modalContext.productId)]}
                  onReviewSubmitted={(review) => {
                    const key = getReviewKey(modalContext.orderId, modalContext.productId)
                    setUserReviews((prev) => ({ ...prev, [key]: review }))
                    closeReviewModal()
                  }}
                  onReviewUpdated={(review) => {
                    const key = getReviewKey(modalContext.orderId, modalContext.productId)
                    setUserReviews((prev) => ({ ...prev, [key]: review }))
                    closeReviewModal()
                  }}
                  onReviewDeleted={() => {
                    const key = getReviewKey(modalContext.orderId, modalContext.productId)
                    setUserReviews((prev) => {
                      const { [key]: _removed, ...rest } = prev
                      return rest
                    })
                    closeReviewModal()
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 