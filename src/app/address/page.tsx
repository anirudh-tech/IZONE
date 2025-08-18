'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { MapPin, Plus, Edit, Trash2, Home, Building, Navigation, Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { addressService, Address, CreateAddressData, UpdateAddressData } from '@/lib/addressService'

export default function AddressPage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'UAE'
  })

  // Fetch addresses on component mount
  useEffect(() => {
    if (user?.id) {
      fetchAddresses()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const fetchedAddresses = await addressService.getAddresses(user!.id)
      setAddresses(fetchedAddresses)
    } catch (error) {
      console.error('Error fetching addresses:', error)
      showToast('Failed to fetch addresses', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5" />
      case 'work':
        return <Building className="w-5 h-5" />
      default:
        return <Navigation className="w-5 h-5" />
    }
  }

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'Home'
      case 'work':
        return 'Work'
      default:
        return 'Other'
    }
  }

  const handleAddAddress = async () => {
    if (!user?.id) {
      showToast('Please sign in to manage addresses', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      
      if (editingAddress) {
        // Update existing address
        const updateData: UpdateAddressData = {
          type: formData.type,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        }
        
        const updatedAddress = await addressService.updateAddress(editingAddress._id!, updateData)
        setAddresses(addresses.map(addr => 
          addr._id === editingAddress._id ? updatedAddress : addr
        ))
        setEditingAddress(null)
        showToast('Address updated successfully!', 'success')
      } else {
        // Add new address
        const createData: CreateAddressData = {
          userId: user.id,
          type: formData.type,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          isDefault: addresses.length === 0
        }
        
        const newAddress = await addressService.createAddress(createData)
        setAddresses([...addresses, newAddress])
        showToast('Address added successfully!', 'success')
      }
      
      setIsAddingAddress(false)
      resetForm()
    } catch (error: any) {
      console.error('Error saving address:', error)
      showToast(error.message || 'Failed to save address', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      type: address.type,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country
    })
    setIsAddingAddress(true)
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      await addressService.deleteAddress(id)
      setAddresses(addresses.filter(addr => addr._id !== id))
      showToast('Address deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Error deleting address:', error)
      showToast(error.message || 'Failed to delete address', 'error')
    }
  }

  const setDefaultAddress = async (id: string) => {
    if (!user?.id) {
      showToast('Please sign in to manage addresses', 'error')
      return
    }

    try {
      const updatedAddress = await addressService.setDefaultAddress(id, user.id)
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr._id === id
      })))
      showToast('Default address updated!', 'success')
    } catch (error: any) {
      console.error('Error setting default address:', error)
      showToast(error.message || 'Failed to set default address', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'home',
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'UAE'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Manage Addresses</h1>
          <p className="text-gray-300">Add and manage your delivery addresses</p>
        </div>

        {/* Add New Address Button */}
        {user && (
          <div className="mb-6">
            <button
              onClick={() => setIsAddingAddress(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Address
            </button>
          </div>
        )}

        {/* Address Form */}
        {user && isAddingAddress && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address Type */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Address Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'home' | 'work' | 'other'})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="+971 50 123 4567"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="UAE"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="Enter your street address"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="Dubai"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  State/Emirate
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="Dubai"
                />
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="12345"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddAddress}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
              <button
                onClick={() => {
                  setIsAddingAddress(false)
                  setEditingAddress(null)
                  resetForm()
                }}
                disabled={isSubmitting}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading addresses...</p>
          </div>
        )}

        {/* Addresses List */}
        {!loading && (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                        {getAddressIcon(address.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">
                          {getAddressTypeLabel(address.type)} Address
                        </h3>
                        {address.isDefault && (
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      
                      <div className="text-gray-300 space-y-1">
                        <p className="font-medium">{address.name}</p>
                        <p>{address.phone}</p>
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(address._id!)}
                        className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="p-2 text-gray-400 hover:text-amber-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id!)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && addresses.length === 0 && !isAddingAddress && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No addresses yet</h3>
            <p className="text-gray-400 mb-6">Add your first delivery address to get started</p>
            <button
              onClick={() => setIsAddingAddress(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Add Your First Address
            </button>
          </div>
        )}

        {/* Not Signed In State */}
        {!user && !loading && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Sign in to manage addresses</h3>
            <p className="text-gray-400 mb-6">Please sign in to add and manage your delivery addresses</p>
            <a
              href="/sign-in"
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Sign In
            </a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
} 