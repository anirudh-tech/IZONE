import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const supabase = createSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { color, quantity } = await request.json()
    const productId = params.id

    if (!color || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Color and quantity are required' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Find the product
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Find the specific color and update its stock
    if (product.colors && product.colors.length > 0) {
      const colorIndex = product.colors.findIndex(c => c.name === color)
      
      if (colorIndex === -1) {
        return NextResponse.json(
          { error: 'Color not found for this product' },
          { status: 404 }
        )
      }

      const currentStock = product.colors[colorIndex].stock
      if (currentStock < quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock for this color' },
          { status: 400 }
        )
      }

      // Update the stock for the specific color
      product.colors[colorIndex].stock = currentStock - quantity
      
      // Update inStock status if stock reaches 0
      if (product.colors[colorIndex].stock === 0) {
        product.colors[colorIndex].inStock = false
      }

      // Update overall product stock status
      const totalStock = product.colors.reduce((sum, c) => sum + c.stock, 0)
      product.inStock = totalStock > 0

      await product.save()

      return NextResponse.json({
        message: 'Inventory updated successfully',
        updatedColor: product.colors[colorIndex],
        totalStock
      })
    } else {
      return NextResponse.json(
        { error: 'Product does not have color variants' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 