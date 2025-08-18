import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Review from '@/models/Review'
import Product from '@/models/Product'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { rating, title, comment } = body
    
    // Validate required fields
    if (!rating || !title || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Find and update the review
    const review = await Review.findByIdAndUpdate(
      params.id,
      { rating, title, comment, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }
    
    // Update product rating
    await updateProductRating(review.productId.toString())
    
    return NextResponse.json(review)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
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
    
    const review = await Review.findByIdAndDelete(params.id)
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }
    
    // Update product rating
    await updateProductRating(review.productId.toString())
    
    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}

async function updateProductRating(productId: string) {
  try {
    const reviews = await Review.find({ productId })
    
    if (reviews.length === 0) {
      // No reviews left, reset product rating
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0
      })
      return
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    })
  } catch (error) {
    console.error('Error updating product rating:', error)
  }
} 