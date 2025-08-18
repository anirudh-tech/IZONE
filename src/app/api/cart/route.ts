import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

import Cart from '@/models/Cart'
import Product from '@/models/Product'
import connectDB from '@/lib/mongodb'

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Find user's cart
    let cart = await Cart.findOne({ userId: user.id }).populate('items.productId')
    
    if (!cart) {
      // Return empty cart structure instead of creating one
      return NextResponse.json({
        _id: null,
        userId: user.id,
        items: [],
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Calculate totals
    const cartWithTotals = {
      ...cart.toObject(),
      total: cart.items.reduce((sum: number, item: any) => {
        let price = 0
        try {
          // Handle different price formats (AED 1,299.00, 1299.00, etc.)
          if (item.productId?.price) {
            const priceStr = item.productId.price.toString()
            price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
          }
        } catch (error) {
          console.error('Error parsing price:', error)
          price = 0
        }
        return sum + (price * (item.quantity || 1))
      }, 0)
    }

    return NextResponse.json(cartWithTotals)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity = 1, color = '', size = '' } = await request.json()
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await connectDB()
    
    // Verify product exists
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId: user.id })
    if (!cart) {
      cart = new Cart({ userId: user.id, items: [] })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    )

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      cart.items.push({ productId, quantity, color, size })
    }

    await cart.save()
    
    // Populate product details for response
    await cart.populate('items.productId')
    
    // Calculate totals
    const cartWithTotals = {
      ...cart.toObject(),
      total: cart.items.reduce((sum: number, item: any) => {
        const price = parseFloat(item.productId.price.replace(/[^0-9.]/g, ''))
        return sum + (price * item.quantity)
      }, 0)
    }
    
    return NextResponse.json(cartWithTotals)
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/cart - Update cart item
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity, color, size } = await request.json()
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await connectDB()
    
    // Find user's cart
    const cart = await Cart.findOne({ userId: user.id })
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    )

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 })
    }

    // Update item
    if (quantity !== undefined) cart.items[itemIndex].quantity = quantity
    if (color !== undefined) cart.items[itemIndex].color = color
    if (size !== undefined) cart.items[itemIndex].size = size

    await cart.save()
    
    // Populate product details for response
    await cart.populate('items.productId')
    
    // Calculate totals
    const cartWithTotals = {
      ...cart.toObject(),
      total: cart.items.reduce((sum: number, item: any) => {
        let price = 0
        try {
          // Handle different price formats (AED 1,299.00, 1299.00, etc.)
          if (item.productId?.price) {
            const priceStr = item.productId.price.toString()
            price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
          }
        } catch (error) {
          console.error('Error parsing price:', error)
          price = 0
        }
        return sum + (price * (item.quantity || 1))
      }, 0)
    }
    
    return NextResponse.json(cartWithTotals)
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await connectDB()
    
    // Find user's cart
    const cart = await Cart.findOne({ userId: user.id })
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== productId
    )

    await cart.save()
    
    // Populate product details for response
    await cart.populate('items.productId')
    
    // Calculate totals
    const cartWithTotals = {
      ...cart.toObject(),
      total: cart.items.reduce((sum: number, item: any) => {
        let price = 0
        try {
          // Handle different price formats (AED 1,299.00, 1299.00, etc.)
          if (item.productId?.price) {
            const priceStr = item.productId.price.toString()
            price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
          }
        } catch (error) {
          console.error('Error parsing price:', error)
          price = 0
        }
        return sum + (price * (item.quantity || 1))
      }, 0)
    }
    
    return NextResponse.json(cartWithTotals)
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 