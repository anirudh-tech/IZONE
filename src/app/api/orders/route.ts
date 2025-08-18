import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing MongoDB connection...')
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('Current working directory:', process.cwd())
    
    const connection = await connectDB()
    console.log('MongoDB connection successful')
    
    // Test database connection
    const dbState = connection.connection.readyState
    console.log('Database connection state:', dbState)
    
    if (dbState !== 1) {
      return NextResponse.json(
        { error: 'Database not ready', state: dbState },
        { status: 503 }
      )
    }
    
    // Test if we can actually query the database
    try {
      const orderCount = await connection.model('Order').countDocuments()
      console.log('Successfully queried database. Order count:', orderCount)
    } catch (queryError) {
      console.error('Error querying database:', queryError)
      return NextResponse.json(
        { error: 'Database query failed', details: queryError instanceof Error ? queryError.message : 'Unknown error' },
        { status: 503 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    let query: any = { customerId }

    if (status && status !== 'all') {
      query.status = status
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name image')
    
    console.log(`Fetched ${orders.length} orders for customer ${customerId}`)
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Attempting to connect to MongoDB...')
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    const connection = await connectDB()
    console.log('Successfully connected to MongoDB')
    
    // Test database connection
    const dbState = connection.connection.readyState
    console.log('Database connection state:', dbState)
    
    if (dbState !== 1) {
      throw new Error(`Database not ready. State: ${dbState}`)
    }
    
    // Test if we can actually query the database
    try {
      const orderCount = await connection.model('Order').countDocuments()
      console.log('Successfully queried database. Order count:', orderCount)
    } catch (queryError) {
      console.error('Error querying database:', queryError)
      throw new Error(`Database query failed: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`)
    }
    
    const body = await request.json()
    console.log('Received order creation request:', body)
    
    // Validate required fields
    if (!body.customerId || !body.customerName || !body.customerEmail || !body.items || !body.shippingAddress || body.subtotal === undefined || body.tax === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, customerName, customerEmail, items, shippingAddress, subtotal, tax' },
        { status: 400 }
      )
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and cannot be empty' },
        { status: 400 }
      )
    }

    // Validate each item has required fields
    for (const item of body.items) {
      if (!item.productId || !item.productName || !item.quantity || !item.price || !item.total) {
        return NextResponse.json(
          { error: 'Each item must have productId, productName, quantity, price, and total' },
          { status: 400 }
        )
      }
      
      // Ensure price and total are numbers
      if (typeof item.price !== 'number' || typeof item.total !== 'number') {
        return NextResponse.json(
          { error: 'Price and total must be numbers' },
          { status: 400 }
        )
      }
      
      // Validate quantity is positive
      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Quantity must be greater than 0' },
          { status: 400 }
        )
      }
    }

    // Validate total amount matches subtotal + tax
    const calculatedTotal = body.subtotal + body.tax
    if (Math.abs(calculatedTotal - body.totalAmount) > 0.01) {
      return NextResponse.json(
        { error: 'Total amount must equal subtotal + tax' },
        { status: 400 }
      )
    }

    const orderData = {
      customerId: body.customerId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      items: body.items,
      subtotal: body.subtotal,
      tax: body.tax,
      totalAmount: body.totalAmount,
      shippingAddress: body.shippingAddress,
      status: body.status || 'pending',
      paymentStatus: body.paymentStatus || 'pending',
      orderDate: body.orderDate || new Date(),
      notes: body.notes || ''
    }

    console.log('Creating order with data:', orderData)

    const order = new Order(orderData)
    const savedOrder = await order.save()
    
    console.log('Order created successfully:', savedOrder._id)
    
    return NextResponse.json(savedOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    
    // Log additional error details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: 'Order validation failed: ' + error.message },
          { status: 400 }
        )
      }
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Order number already exists' },
          { status: 409 }
        )
      }
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please check your MongoDB connection.' },
          { status: 503 }
        )
      }
      if (error.message.includes('MongoServerError')) {
        return NextResponse.json(
          { error: 'Database server error: ' + error.message },
          { status: 503 }
        )
      }
    }
    
    // Log the error object structure
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
} 