import { NextRequest, NextResponse } from 'next/server'

import Review from '@/models/Review'
import Product from '@/models/Product'
import Order from '@/models/Order'
import connectDB from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { productId, orderId, customerId, customerName, customerEmail, rating, title, comment } = body
    
    // Validate required fields
    if (!productId || !orderId || !customerId || !rating || !title || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if order exists and is delivered
    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Can only review delivered orders' },
        { status: 400 }
      )
    }
    
    if (order.paymentStatus !== 'paid') {
      return NextResponse.json(
        { error: 'Can only review paid orders' },
        { status: 400 }
      )
    }
    
    // Check if customer already reviewed this product for this order
    const existingReview = await Review.findOne({
      productId,
      orderId,
      customerId
    })
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product for this order' },
        { status: 400 }
      )
    }
    
    // Create new review
    const review = new Review({
      productId,
      orderId,
      customerId,
      customerName,
      customerEmail,
      rating,
      title,
      comment
    })
    
    await review.save()
    
    // Update product rating and review count
    await updateProductRating(productId)
    
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const orderId = searchParams.get('orderId')
    const customerId = searchParams.get('customerId')
    
    let query: any = {}
    
    if (productId) query.productId = productId
    if (orderId) query.orderId = orderId
    if (customerId) query.customerId = customerId
    
    const reviews = await Review.find(query)
      .populate('productId', 'name image')
      .populate('orderId', 'orderNumber status')
      .sort({ createdAt: -1 })
    
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

async function updateProductRating(productId: string) {
  try {
    const reviews = await Review.find({ productId })
    
    if (reviews.length === 0) return
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length
    })
  } catch (error) {
    console.error('Error updating product rating:', error)
  }
} 