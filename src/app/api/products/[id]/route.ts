import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const product = await Product.findById(params.id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Ensure backward compatibility by adding default values for new fields
    const productObj = product.toObject()
    const processedProduct = {
      ...productObj,
      images: productObj.images || [productObj.image], // Default to main image if no images array
      features: productObj.features || [],
      specifications: productObj.specifications || {},
      colors: productObj.colors || [],
      showFeatures: productObj.showFeatures || false,
      showSpecifications: productObj.showSpecifications || false,
      showColors: productObj.showColors !== undefined ? productObj.showColors : true
    }
    
    return NextResponse.json(processedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    console.log('Received PUT body:', body)
    
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

    const updateData = {
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
      status: body.status || 'draft',
      updatedAt: new Date()
    }

    console.log('Update data:', updateData)

    const product = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('Product updated:', product._id)
    
    // Ensure backward compatibility for the response
    const productObj = product.toObject()
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
    
    return NextResponse.json(processedResponse)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    console.log('Received PATCH body:', body)
    
    // Only allow status updates via PATCH
    if (body.status && !['draft', 'published'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "draft" or "published"' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (body.status) {
      updateData.status = body.status
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('Product status updated:', product._id, 'Status:', product.status)
    
    // Ensure backward compatibility for the response
    const productObj = product.toObject()
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
    
    return NextResponse.json(processedResponse)
  } catch (error) {
    console.error('Error updating product status:', error)
    return NextResponse.json(
      { error: 'Failed to update product status' },
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
    
    const deletedProduct = await Product.findByIdAndDelete(params.id)
    
    if (!deletedProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    console.log('Product deleted from MongoDB:', deletedProduct._id)
    
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 