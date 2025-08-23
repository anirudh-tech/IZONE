export interface Address {
  _id?: string
  userId: string
  type: 'home' | 'work' | 'other'
  name: string
  phone: string
  secondaryPhone: string
  email: string
  address: string
  city: string
  state: string
  region: string
  zipCode: string
  country: string
  isDefault: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateAddressData {
  userId: string
  type: 'home' | 'work' | 'other'
  name: string
  phone: string
  secondaryPhone: string
  email: string
  address: string
  city: string
  state: string
  region: string
  zipCode: string
  country?: string
  isDefault?: boolean
}

export interface UpdateAddressData {
  type?: 'home' | 'work' | 'other'
  name: string
  phone: string
  secondaryPhone: string
  email: string
  address: string
  city: string
  state: string
  region: string
  zipCode: string
  country?: string
  isDefault?: boolean
}

class AddressService {
  private baseUrl = '/api/addresses'

  async getAddresses(userId: string): Promise<Address[]> {
    try {
      const response = await fetch(`${this.baseUrl}?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch addresses')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching addresses:', error)
      throw error
    }
  }

  async createAddress(addressData: CreateAddressData): Promise<Address> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create address')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating address:', error)
      throw error
    }
  }

  async updateAddress(id: string, addressData: UpdateAddressData): Promise<Address> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update address')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating address:', error)
      throw error
    }
  }

  async deleteAddress(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      throw error
    }
  }

  async setDefaultAddress(id: string, userId: string): Promise<Address> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to set address as default')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error setting address as default:', error)
      throw error
    }
  }
}

export const addressService = new AddressService() 