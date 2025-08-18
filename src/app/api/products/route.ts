import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const status = searchParams.get('status')

    let query = {}

    // Handle status filtering
    if (status === 'all') {
      // Return all products regardless of status (for admin)
      query = {}
    } else if (!status) {
      // Default to published products for public access
      query = { status: 'published' }
    } else if (status === 'published' || status === 'draft') {
      query = { status }
    }

    if (category && category !== 'All') {
      query = { ...query, category }
    }

    if (featured === 'true') {
      query = { ...query, discount: { $ne: '', $exists: true } }
    }

    const products = await Product.find(query).sort({ createdAt: -1 })
    
    // Ensure backward compatibility by adding default values for new fields
    const processedProducts = products.map(product => {
      const productObj = product.toObject()
      return {
        ...productObj,
        images: productObj.images || [productObj.image], // Default to main image if no images array
        features: productObj.features || [],
        specifications: productObj.specifications || {},
        colors: productObj.colors || [],
        showFeatures: productObj.showFeatures || false,
        showSpecifications: productObj.showSpecifications || false,
        showColors: productObj.showColors !== undefined ? productObj.showColors : true
      }
    })
    
    console.log(`Fetched ${processedProducts.length} products from MongoDB`)
    
    return NextResponse.json(processedProducts)
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
    console.log('Received POST body:', body)
    
    // Validate required fields
    if (!body.name || !body.price || !body.originalPrice || !body.image) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, originalPrice, image' },
        { status: 400 }
      )
    }

    // Process images - ensure first image is the main image
    let images = body.images || []
    if (body.image && !images.includes(body.image)) {
      images = [body.image, ...images]
    }
    
    // Limit images to 4
    if (images.length > 4) {
      images = images.slice(0, 4)
    }

    // Use the data as-is with minimal processing for debugging
    const productData = {
      name: body.name,
      price: body.price,
      originalPrice: body.originalPrice,
      image: body.image,
      images: images,
      discount: body.discount || '',
      description: body.description || '',
      category: body.category || 'Uncategorized',
      inStock: body.inStock !== false,
      rating: body.rating || 0,
      reviews: body.reviews || 0,
      features: body.features || [],
      specifications: body.specifications || {},
      colors: body.colors || [],
      showFeatures: body.showFeatures || false,
      showSpecifications: body.showSpecifications || false,
      showColors: body.showColors !== false,
      status: body.status || 'draft'
    }

    console.log('Processed product data:', productData)

    const product = new Product(productData)
    console.log('Product before save:', product.toObject())
    
    const savedProduct = await product.save()
    console.log('Product after save (raw):', savedProduct.toObject())
    
    // Ensure backward compatibility for the response
    const productObj = savedProduct.toObject()
    console.log('Product object from MongoDB:', productObj)
    
    const processedResponse = {
      ...productObj,
      images: productObj.images || [productObj.image],
      features: productObj.features || [],
      specifications: productObj.specifications || {},
      colors: productObj.colors || [],
      showFeatures: productObj.showFeatures || false,
      showSpecifications: productObj.showSpecifications || false,
      showColors: productObj.showColors !== undefined ? productObj.showColors : true
    }
    
    console.log('Product saved to MongoDB:', savedProduct._id)
    console.log('Returning processed response:', processedResponse)
    
    return NextResponse.json(processedResponse, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 