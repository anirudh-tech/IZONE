import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get all orders for admin (in a real app, you might want to add authentication)
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name image')
    
    console.log(`Fetched ${orders.length} orders for admin`)
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders for admin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
} 