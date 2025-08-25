import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Category from '@/models/Category'
import Cart from '@/models/Cart'
import Favorite from '@/models/Favorite'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    // Increment views atomically when product is viewed
    const product = await Product.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
    
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

    // Validate category if provided
    let validatedCategory: string | undefined = undefined
    if (body.category) {
      const existingCategory = await Category.findOne({ name: body.category, isActive: true })
      if (!existingCategory) {
        return NextResponse.json(
          { error: 'Invalid category. Please select an existing active category.' },
          { status: 400 }
        )
      }
      validatedCategory = existingCategory.name
    }

    const updateData = {
      name: body.name,
      price: body.price,
      originalPrice: body.originalPrice,
      image: body.image,
      images: images,
      discount: body.discount || '',
      description: body.description || '',
      category: validatedCategory || 'Uncategorized',
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

    // If product was unpublished, remove it from all carts and favorites
    if (updateData.status === 'draft') {
      try {
        await Promise.all([
          // Remove from every user's cart
          Cart.updateMany({}, { $pull: { items: { productId: params.id } } }),
          // Remove from favorites
          Favorite.deleteMany({ productId: params.id })
        ])
      } catch (cleanupError) {
        console.error('Cleanup error after unpublishing product:', cleanupError)
        // Do not fail the status update due to cleanup; just log
      }
    }
    
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
    
    // Remove deleted product from all carts and favorites
    try {
      await Promise.all([
        Cart.updateMany({}, { $pull: { items: { productId: params.id } } }),
        Favorite.deleteMany({ productId: params.id })
      ])
    } catch (cleanupError) {
      console.error('Cleanup error after deleting product:', cleanupError)
      // Do not fail the deletion response due to cleanup; just log
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 