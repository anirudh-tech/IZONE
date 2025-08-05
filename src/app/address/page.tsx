'use client'

import { useState } from 'react'
import { MapPin, Plus, Edit, Trash2, Home, Building, Navigation } from 'lucide-react'
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
  zipCode: string
  country: string
  isDefault: boolean
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      name: 'John Doe',
      phone: '+971 50 123 4567',
      address: '123 Sheikh Zayed Road',
      city: 'Dubai',
      state: 'Dubai',
      zipCode: '12345',
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
      zipCode: '67890',
      country: 'UAE',
      isDefault: false
    }
  ])

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

  const handleAddAddress = () => {
    if (editingAddress) {
      // Update existing address
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id 
          ? { ...formData, id: addr.id, isDefault: addr.isDefault }
          : addr
      ))
      setEditingAddress(null)
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0
      }
      setAddresses([...addresses, newAddress])
    }
    
    // Reset form
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
    setIsAddingAddress(false)
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

  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(addresses.filter(addr => addr.id !== id))
    }
  }

  const setDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
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
        <div className="mb-6">
          <button
            onClick={() => setIsAddingAddress(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        </div>

        {/* Address Form */}
        {isAddingAddress && (
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
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
              <button
                onClick={() => {
                  setIsAddingAddress(false)
                  setEditingAddress(null)
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
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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
                      onClick={() => setDefaultAddress(address.id)}
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
                    onClick={() => handleDeleteAddress(address.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {addresses.length === 0 && !isAddingAddress && (
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
      </div>

      <Footer />
    </div>
  )
} 