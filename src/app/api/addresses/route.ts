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
  
    
    // Validate required fields
    if (!body.userId || !body.name || !body.phone || !body.secondaryPhone || !body.email || !body.address || !body.city || !body.state || !body.region || !body.zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, phone, secondaryPhone, email, address, city, state, region, zipCode' },
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
      secondaryPhone: body.secondaryPhone,
      email: body.email,
      address: body.address,
      city: body.city,
      state: body.state,
      region: body.region,
      zipCode: body.zipCode,
      country: body.country || 'UAE',
      isDefault: isDefault
    }

   

    const address = new Address(addressData)
    const savedAddress = await address.save()
    
   
    
    return NextResponse.json(savedAddress, { status: 201 })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
} 