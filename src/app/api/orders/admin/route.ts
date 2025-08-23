import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')

    const query: any = {}

    // Date range filter (based on orderDate)
    if (startDateParam || endDateParam) {
      const range: any = {}
      if (startDateParam) {
        const start = new Date(startDateParam)
        if (!isNaN(start.getTime())) range.$gte = start
      }
      if (endDateParam) {
        const end = new Date(endDateParam)
        if (!isNaN(end.getTime())) range.$lte = end
      }
      if (Object.keys(range).length > 0) {
        query.orderDate = range
      }
    }

    // Optional status filters
    if (status && status !== 'all') {
      query.status = status
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus
    }

    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .populate('items.productId', 'name image')

   

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders for admin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}