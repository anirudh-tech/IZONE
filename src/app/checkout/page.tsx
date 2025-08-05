'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, CreditCard, Lock, Check, AlertCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  name: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface CartItem {
  id: number
  name: string
  price: number
  originalPrice: number
  quantity: number
  image: string
}

export default function CheckoutPage() {
  const router = useRouter()
  
  // Mock cart data
  const [cartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'iPhone 14 Pro Max',
      price: 1099,
      originalPrice: 1499,
      quantity: 1,
      image: '/iphone14F-removebg-preview.png'
    },
    {
      id: 2,
      name: 'AirPods Pro 2nd Gen',
      price: 749,
      originalPrice: 949,
      quantity: 1,
      image: '/iphone14c-removebg-preview.png'
    }
  ])

  // Mock addresses
  const [addresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      name: 'John Doe',
      phone: '+971 50 123 4567',
      address: '123 Sheikh Zayed Road',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '12345',
      country: 'UAE',
      isDefault: true
    },
    {
      id: '2',
      type: 'work',
      name: 'John Doe',
      phone: '+971 50 123 4567',
      address: '456 Business Bay',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '67890',
      country: 'UAE',
      isDefault: false
    }
  ])

  const [selectedAddress, setSelectedAddress] = useState<string>(addresses.find(addr => addr.isDefault)?.id || '')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card')
  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 25
  const tax = subtotal * 0.05 // 5% VAT
  const total = subtotal + shipping + tax

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    setIsProcessing(true)
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    router.push('/order-confirmation')
  }

  const selectedAddressData = addresses.find(addr => addr.id === selectedAddress)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-gray-300">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">Delivery Address</h2>
              </div>

              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAddress === address.id
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedAddress(address.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-white font-medium capitalize">{address.type}</span>
                          {address.isDefault && (
                            <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                              Default
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-gray-300">
                          <p className="font-medium text-white">{address.name}</p>
                          <p>{address.phone}</p>
                          <p>{address.address}</p>
                          <p>{address.city}, {address.state} {address.postalCode}</p>
                          <p>{address.country}</p>
                        </div>
                      </div>

                      {selectedAddress === address.id && (
                        <Check className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push('/address')}
                className="mt-4 text-amber-400 hover:text-amber-300 transition-colors"
              >
                + Add New Address
              </button>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">Payment Method</h2>
              </div>

              <div className="space-y-4">
                <div
                  className={`p-4 disabled:opacity-50 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="text-white font-medium">Credit/Debit Card</p>
                        <p className="text-gray-400 text-sm">Pay securely with your card</p>
                      </div>
                    </div>
                    {paymentMethod === 'card' && (
                      <Check className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-900">$</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Cash on Delivery</p>
                        <p className="text-gray-400 text-sm">Pay when you receive your order</p>
                      </div>
                    </div>
                    {paymentMethod === 'cash' && (
                      <Check className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
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
                      <p className="text-gray-400 text-sm line-through">AED {item.originalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white">AED {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Shipping</span>
                  <span className="text-white">AED {shipping}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tax (VAT 5%)</span>
                  <span className="text-white">AED {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400">AED {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              {selectedAddressData && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Delivery to:</h3>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>{selectedAddressData.name}</p>
                    <p>{selectedAddressData.address}</p>
                    <p>{selectedAddressData.city}, {selectedAddressData.state}</p>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-center gap-2 text-green-400 text-sm mb-6">
                <Lock className="w-4 h-4" />
                <span>Secure payment processing</span>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedAddress}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Place Order - AED {total.toFixed(2)}
                  </>
                )}
              </button>

              {/* Terms */}
              <p className="text-gray-400 text-xs text-center mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 