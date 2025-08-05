'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Package, Truck, Home, Download, Share2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function OrderConfirmationPage() {
  const router = useRouter()
  const [orderNumber] = useState(`ORD-${Date.now().toString().slice(-6)}`)
  const [estimatedDelivery] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))

  // Mock order data
  const orderData = {
    items: [
      {
        id: 1,
        name: 'iPhone 14 Pro Max',
        price: 1099,
        quantity: 1,
        image: '/iphone14F-removebg-preview.png'
      },
      {
        id: 2,
        name: 'AirPods Pro 2nd Gen',
        price: 749,
        quantity: 1,
        image: '/iphone14c-removebg-preview.png'
      }
    ],
    deliveryAddress: {
      name: 'John Doe',
      address: '123 Sheikh Zayed Road',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '12345',
      country: 'UAE'
    },
    paymentMethod: 'Credit Card',
    subtotal: 1848,
    shipping: 25,
    tax: 92.4,
    total: 1965.4
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
      completed: false,
      time: 'Within 24 hours'
    },
    {
      step: 3,
      title: 'Shipped',
      description: 'Your order is on its way to you',
      icon: Truck,
      completed: false,
      time: '2-3 business days'
    },
    {
      step: 4,
      title: 'Delivered',
      description: 'Your order has been delivered',
      icon: CheckCircle,
      completed: false,
      time: 'Estimated delivery date'
    }
  ]

  const handleDownloadInvoice = () => {
    // In a real app, this would generate and download a PDF invoice
    alert('Invoice download started!')
  }

  const handleShareOrder = () => {
    // In a real app, this would share order details
    if (navigator.share) {
      navigator.share({
        title: 'My Order',
        text: `Order ${orderNumber} - TechSouq`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`Order ${orderNumber} - TechSouq`)
      alert('Order link copied to clipboard!')
    }
  }

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
            <p className="text-amber-400 font-semibold">Order #{orderNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Order Items</h2>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                    <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-bold">AED {item.price}</p>
                    </div>
                  </div>
                ))}
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
                <p className="text-white font-medium">{orderData.deliveryAddress.name}</p>
                <p className="text-gray-300">{orderData.deliveryAddress.address}</p>
                <p className="text-gray-300">
                  {orderData.deliveryAddress.city}, {orderData.deliveryAddress.state} {orderData.deliveryAddress.postalCode}
                </p>
                <p className="text-gray-300">{orderData.deliveryAddress.country}</p>
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
                  <span className="text-white">AED {orderData.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Shipping</span>
                  <span className="text-white">AED {orderData.shipping}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tax (VAT 5%)</span>
                  <span className="text-white">AED {orderData.tax}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400">AED {orderData.total}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-medium mb-2">Payment Method</h3>
                <p className="text-gray-300">{orderData.paymentMethod}</p>
              </div>

              {/* Estimated Delivery */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-medium mb-2">Estimated Delivery</h3>
                <p className="text-green-400 font-semibold">
                  {estimatedDelivery.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

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
                  support@techsouq.com
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