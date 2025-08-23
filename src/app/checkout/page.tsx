'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, CreditCard, Lock, Check, AlertCircle, Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { ordersApi } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { addressService, Address as AddressType } from '@/lib/addressService'
import { createSupabaseClient } from '@/lib/supabase'
import AedIcon from '@/components/AedIcon'

interface CartItem {
  _id: string
  productId: {
    _id: string
    name: string
    price: string
    originalPrice: string
    image: string
    inStock: boolean
  }
  quantity: number
  color: string
  size: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { cart, loading: cartLoading, clearCartAfterOrder } = useCart()
  const { showToast } = useToast()
  
  const [addresses, setAddresses] = useState<AddressType[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'cash'>('cash')
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch addresses when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchAddresses()
    } else {
      setLoadingAddresses(false)
    }
  }, [user?.id])

  // Set default selected address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(addr => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id!)
      } else {
        setSelectedAddress(addresses[0]._id!)
      }
    }
  }, [addresses, selectedAddress])

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true)
      const fetchedAddresses = await addressService.getAddresses(user!.id)
      setAddresses(fetchedAddresses)
    } catch (error) {
      console.error('Error fetching addresses:', error)
      showToast('Failed to fetch addresses', 'error')
    } finally {
      setLoadingAddresses(false)
    }
  }

  // Calculate totals from actual cart data
  const subtotal = cart?.items?.reduce((sum, item) => {
    let price = 0
    try {
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

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast('Please select a delivery address', 'warning')
      return
    }

    if (!user) {
      showToast('Please sign in to place an order', 'warning')
      router.push('/sign-in')
      return
    }

    if (!cart || cart.items.length === 0) {
      showToast('Your cart is empty', 'warning')
      return
    }

    setIsProcessing(true)
    
    try {
      const selectedAddressData = addresses.find(addr => addr._id === selectedAddress)
      if (!selectedAddressData) {
        throw new Error('Selected address not found')
      }

      // Prepare order items from actual cart data
      const orderItems = cart.items.map(item => ({
        productId: item.productId._id,
        productName: item.productId.name,
        image: item.productId.image,
        quantity: item.quantity,
        price: parseFloat(item.productId.price.toString().replace(/[^0-9.]/g, '')) || 0,
        total: (parseFloat(item.productId.price.toString().replace(/[^0-9.]/g, '')) || 0) * item.quantity,
        color: item.color || '',
        size: item.size || ''
      }))

      // Create order
      const orderData = {
        customerId: user.id,
        customerName: selectedAddressData.name,
        customerEmail: user.email || '',
        items: orderItems,
        subtotal,
        tax: 0,
        totalAmount: total,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        orderDate: new Date().toISOString(),
        shippingAddress: `${selectedAddressData.address}, ${selectedAddressData.city}, ${selectedAddressData.state} ${selectedAddressData.zipCode}, ${selectedAddressData.country}`,
        notes: 'The Track ID and platform information will be updated soon.'
      }


      const createdOrder = await ordersApi.create(orderData)
      
      // Update product inventory for specific colors
      await updateProductInventory(orderItems)
      
      // Redirect first to avoid interim empty cart render on checkout
      router.push(`/order-confirmation?orderId=${createdOrder._id}`)
      
      // Clear cart after successful order placement (non-blocking)
      void clearCartAfterOrder()
    } catch (error) {
      console.error('Error creating order:', error)
      
      // Log additional error details
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      
      // Try to get more details from the error response
      if (error && typeof error === 'object' && 'message' in error) {
        showToast(`Failed to create order: ${error.message}`, 'error')
      } else {
        showToast('Failed to create order. Please try again.', 'error')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to update product inventory for specific colors
  const updateProductInventory = async (orderItems: any[]) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No auth token available for inventory update')
        return
      }

      for (const item of orderItems) {
        if (item.color) {
          // Update inventory for specific color
          const response = await fetch(`/api/products/${item.productId}/inventory`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              color: item.color,
              quantity: item.quantity
            }),
          })

          if (!response.ok) {
            console.error(`Failed to update inventory for product ${item.productId}, color ${item.color}`)
          }
        }
      }
    } catch (error) {
      console.error('Error updating product inventory:', error)
      // Don't fail the order if inventory update fails
    }
  }

  const selectedAddressData = addresses.find(addr => addr._id === selectedAddress)

  // Show loading state while fetching data
  if (cartLoading || loadingAddresses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="animate-spin rounded-full h-12 w-12  border-amber-400 mx-auto mb-4" />
              <p className="text-gray-300">Loading checkout...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Show empty cart message if no items (but not while processing order)
  if (!isProcessing && (!cart || cart.items.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-gray-300 mb-6">Add some products to your cart before checkout</p>
            <button
              onClick={() => router.push('/shop')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Show message if no addresses
  if (addresses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">No Delivery Address</h1>
            <p className="text-gray-300 mb-6">Please add a delivery address before checkout</p>
            <button
              onClick={() => router.push('/address')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Add Address
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
                    key={address._id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAddress === address._id
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedAddress(address._id!)}
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
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                          <p>{address.country}</p>
                        </div>
                      </div>

                      {selectedAddress === address._id && (
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

              {/* Beta Notice */}
              <div className="mb-6 p-4 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-medium">Beta Version</span>
                </div>
                <p className="text-gray-300 text-sm">
                  We're currently in beta and will be introducing additional payment methods soon, including credit/debit cards, digital wallets, and more!
                </p>
              </div>

              <div className="space-y-4">
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
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart?.items?.map((item) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                      <img
                        src={item.productId.image}
                        alt={item.productId.name}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.productId.name}</p>
                      <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                      {(item.color || item.size) && (
                        <p className="text-gray-400 text-xs">
                          {item.color && `${item.color}`}
                          {item.color && item.size && ' • '}
                          {item.size && `${item.size}`}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-bold flex items-center gap-1 justify-end">
                        <AedIcon className="text-amber-400" width={14} height={12} />
                        {parseFloat(item.productId.price.toString().replace(/[^0-9.]/g, '')) || 0}
                      </p>
                      {item.productId.originalPrice && (
                        <p className="text-gray-400 text-sm line-through flex items-center gap-1 justify-end">
                          <AedIcon className="text-gray-400" width={12} height={10} />
                          {parseFloat(item.productId.originalPrice.toString().replace(/[^0-9.]/g, '')) || 0}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white flex items-center gap-1">
                    <AedIcon className="text-white" width={14} height={12} />
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Shipping</span>
                  <span className="text-white">{shipping}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Discount</span>
                  <span className="text-white flex items-center gap-1">
                    <AedIcon className="text-white" width={14} height={12} />
                    {discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <AedIcon className="text-amber-400" width={14} height={12} />
                    {total.toFixed(2)}
                  </span>
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
                    <span className="flex items-center gap-1">
                      Place Order -
                      <AedIcon className="text-white" width={14} height={12} />
                      {total.toFixed(2)}
                    </span>
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