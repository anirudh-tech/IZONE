import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Address from '@/models/Address'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const body = await request.json()
   
    
    // Validate required fields
    if (!body.name || !body.phone || !body.secondaryPhone || !body.email || !body.address || !body.city || !body.state || !body.region || !body.zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, secondaryPhone, email, address, city, state, region, zipCode' },
        { status: 400 }
      )
    }

    const addressData = {
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
      isDefault: body.isDefault || false
    }

   

    const updatedAddress = await Address.findByIdAndUpdate(
      params.id,
      addressData,
      { new: true, runValidators: true }
    )

    if (!updatedAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }


    
    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const address = await Address.findById(params.id)
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    // Check if this is the default address
    if (address.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default address. Set another address as default first.' },
        { status: 400 }
      )
    }

    await Address.findByIdAndDelete(params.id)
    
   
    
    return NextResponse.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  }
} 