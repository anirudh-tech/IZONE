import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    let query = {}

    if (category && category !== 'All') {
      query = { category }
    }

    if (featured === 'true') {
      query = { ...query, discount: { $ne: '', $exists: true } }
    }

    const products = await Product.find(query).sort({ createdAt: -1 })
    
    console.log(`Fetched ${products.length} products from MongoDB`)
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.price || !body.originalPrice || !body.image) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, originalPrice, image' },
        { status: 400 }
      )
    }

    const product = new Product(body)
    const savedProduct = await product.save()
    
    console.log('Product saved to MongoDB:', savedProduct._id)
    
    return NextResponse.json(savedProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 