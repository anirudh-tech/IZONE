import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Address from '@/models/Address'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    const userId = body.userId
    const { id } = await context.params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // First, remove default from all addresses of this user
    await Address.updateMany(
      { userId },
      { isDefault: false }
    )

    // Then set the specified address as default
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { isDefault: true },
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
    console.error('Error setting address as default:', error)
    return NextResponse.json(
      { error: 'Failed to set address as default' },
      { status: 500 }
    )
  }
} 