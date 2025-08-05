'use client'

import { useState } from 'react'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Eye, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

// Type definitions
interface OrderItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  estimatedDelivery?: string
  trackingNumber?: string
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Ahmed Al Mansouri',
    customerEmail: 'ahmed@example.com',
    customerPhone: '+971 50 123 4567',
    shippingAddress: 'Dubai Marina, Tower 1, Apartment 1501, Dubai, UAE',
    items: [
      {
        id: 1,
        productId: 1,
        name: 'iPhone 14 Pro Max',
        price: 1099,
        quantity: 1,
        image: '/iphone14F-removebg-preview.png'
      }
    ],
    total: 1099,
    status: 'delivered',
    orderDate: '2024-01-15',
    estimatedDelivery: '2024-01-20',
    trackingNumber: 'TRK-123456789',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid'
  },
  {
    id: 'ORD-002',
    customerName: 'Fatima Al Zahra',
    customerEmail: 'fatima@example.com',
    customerPhone: '+971 55 987 6543',
    shippingAddress: 'Abu Dhabi Corniche, Villa 25, Abu Dhabi, UAE',
    items: [
      {
        id: 2,
        productId: 2,
        name: 'Apple Watch Series 8',
        price: 1499,
        quantity: 1,
        image: '/iphone14s-removebg-preview.png'
      },
      {
        id: 3,
        productId: 3,
        name: 'AirPods Pro 2nd Gen',
        price: 749,
        quantity: 2,
        image: '/iphone14c-removebg-preview.png'
      }
    ],
    total: 2997,
    status: 'shipped',
    orderDate: '2024-01-18',
    estimatedDelivery: '2024-01-25',
    trackingNumber: 'TRK-987654321',
    paymentMethod: 'PayPal',
    paymentStatus: 'paid'
  },
  {
    id: 'ORD-003',
    customerName: 'Omar Al Rashid',
    customerEmail: 'omar@example.com',
    customerPhone: '+971 52 456 7890',
    shippingAddress: 'Sharjah Al Majaz, Building 10, Apartment 502, Sharjah, UAE',
    items: [
      {
        id: 4,
        productId: 4,
        name: 'iPad Air 5th Gen',
        price: 2199,
        quantity: 1,
        image: '/iphone1.png'
      }
    ],
    total: 2199,
    status: 'processing',
    orderDate: '2024-01-20',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'pending'
  },
  {
    id: 'ORD-004',
    customerName: 'Aisha Al Qasimi',
    customerEmail: 'aisha@example.com',
    customerPhone: '+971 54 789 0123',
    shippingAddress: 'Ajman Al Nuaimiya, Villa 15, Ajman, UAE',
    items: [
      {
        id: 5,
        productId: 5,
        name: 'MacBook Pro 14"',
        price: 6999,
        quantity: 1,
        image: '/iphone1.png'
      }
    ],
    total: 6999,
    status: 'pending',
    orderDate: '2024-01-22',
    paymentMethod: 'Credit Card',
    paymentStatus: 'failed'
  }
]

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
  }

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderModalOpen(true)
  }

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-gray-400">Track and manage your orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <Package className="w-6 h-6 text-amber-400" />
              <div className="ml-3">
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-400" />
              <div className="ml-3">
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <Package className="w-6 h-6 text-blue-400" />
              <div className="ml-3">
                <p className="text-gray-400 text-sm">Processing</p>
                <p className="text-xl font-bold text-white">{stats.processing}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <Truck className="w-6 h-6 text-purple-400" />
              <div className="ml-3">
                <p className="text-gray-400 text-sm">Shipped</p>
                <p className="text-xl font-bold text-white">{stats.shipped}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div className="ml-3">
                <p className="text-gray-400 text-sm">Delivered</p>
                <p className="text-xl font-bold text-white">{stats.delivered}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-6 h-6 text-red-400" />
              <div className="ml-3">
                <p className="text-gray-400 text-sm">Cancelled</p>
                <p className="text-xl font-bold text-white">{stats.cancelled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 text-green-400" />
              <div className="ml-3">
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-xl font-bold text-white">AED {stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon
                  return (
                    <tr key={order.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{order.id}</div>
                        <div className="text-sm text-gray-400">{order.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{order.customerName}</div>
                        <div className="text-sm text-gray-400">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="w-8 h-8 bg-gray-600 rounded overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-xs text-gray-400">+{order.items.length - 3}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">{order.items.length} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">AED {order.total}</div>
                        <div className={`text-xs ${
                          order.paymentStatus === 'paid' ? 'text-green-400' : 
                          order.paymentStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {order.paymentStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{new Date(order.orderDate).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-400">{new Date(order.orderDate).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openOrderModal(order)}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No orders found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Order Details - {selectedOrder.id}</h2>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order ID:</span>
                      <span className="text-white font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Date:</span>
                      <span className="text-white">{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[selectedOrder.status].color}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Method:</span>
                      <span className="text-white">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Status:</span>
                      <span className={`text-sm ${
                        selectedOrder.paymentStatus === 'paid' ? 'text-green-400' : 
                        selectedOrder.paymentStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tracking Number:</span>
                        <span className="text-white font-mono">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                    {selectedOrder.estimatedDelivery && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Estimated Delivery:</span>
                        <span className="text-white">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <span className="text-white">{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                      <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.name}</h4>
                        <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">AED {item.price}</p>
                        <p className="text-gray-400 text-sm">Total: AED {item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>Total:</span>
                      <span>AED {selectedOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(statusConfig).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status as Order['status'])}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedOrder.status === status
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
} 