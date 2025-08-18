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
    console.log('Received PUT body for address:', body)
    
    // Validate required fields
    if (!body.name || !body.phone || !body.address || !body.city || !body.state || !body.zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, address, city, state, zipCode' },
        { status: 400 }
      )
    }

    const addressData = {
      type: body.type || 'home',
      name: body.name,
      phone: body.phone,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      country: body.country || 'UAE',
      isDefault: body.isDefault || false
    }

    console.log('Processed address update data:', addressData)

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

    console.log('Address updated in MongoDB:', updatedAddress._id)
    
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
    
    console.log('Address deleted from MongoDB:', params.id)
    
    return NextResponse.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  }
} 