import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Address from '@/models/Address'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 })
    
    console.log(`Fetched ${addresses.length} addresses for user: ${userId}`)
    
    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    console.log('Received POST body for address:', body)
    
    // Validate required fields
    if (!body.userId || !body.name || !body.phone || !body.address || !body.city || !body.state || !body.zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, phone, address, city, state, zipCode' },
        { status: 400 }
      )
    }

    // If this is the first address for the user, make it default
    const existingAddresses = await Address.find({ userId: body.userId })
    const isDefault = existingAddresses.length === 0 || body.isDefault

    const addressData = {
      userId: body.userId,
      type: body.type || 'home',
      name: body.name,
      phone: body.phone,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      country: body.country || 'UAE',
      isDefault: isDefault
    }

    console.log('Processed address data:', addressData)

    const address = new Address(addressData)
    const savedAddress = await address.save()
    
    console.log('Address saved to MongoDB:', savedAddress._id)
    
    return NextResponse.json(savedAddress, { status: 201 })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
} 