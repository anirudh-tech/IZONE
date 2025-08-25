import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { sendEmail, renderOrderConfirmationEmail, renderAdminOrderNotification } from '@/lib/resend'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {

    
    const connection = await connectDB()
  
    
    // Test database connection
    const dbState = connection.connection.readyState
   
    
    if (dbState !== 1) {
      return NextResponse.json(
        { error: 'Database not ready', state: dbState },
        { status: 503 }
      )
    }
    
    // Test if we can actually query the database
    try {
      const orderCount = await connection.model('Order').countDocuments()
  
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
  const appliedAdjustments: Array<{ productId: string, color: string, quantity: number }> = []
  try {
    
    const connection = await connectDB()

    
    // Test database connection
    const dbState = connection.connection.readyState
 
    
    if (dbState !== 1) {
      throw new Error(`Database not ready. State: ${dbState}`)
    }
    
    // Test if we can actually query the database
    try {
      const orderCount = await connection.model('Order').countDocuments()
    
    } catch (queryError) {
      console.error('Error querying database:', queryError)
      throw new Error(`Database query failed: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`)
    }
    
    const body = await request.json()
  
    
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

    // Decrease inventory for each ordered item (per product color)
    try {
      for (const item of body.items) {
        const product = await Product.findById(item.productId)
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`)
        }

        if (!Array.isArray(product.colors) || product.colors.length === 0) {
          throw new Error('Product does not have color variants')
        }

        if (!item.color) {
          throw new Error(`Color is required for product ${product.name}`)
        }

        const colorIndex = product.colors.findIndex((c: any) => c.name === item.color)
        if (colorIndex === -1) {
          throw new Error(`Color ${item.color} not found for product ${product.name}`)
        }

        const currentStock = product.colors[colorIndex].stock || 0
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name} - ${item.color}. Available: ${currentStock}, requested: ${item.quantity}`)
        }

        product.colors[colorIndex].stock = currentStock - item.quantity
        if (product.colors[colorIndex].stock === 0) {
          product.colors[colorIndex].inStock = false
        } else {
          product.colors[colorIndex].inStock = true
        }

        const totalStock = product.colors.reduce((sum: number, c: any) => sum + (c.stock || 0), 0)
        product.inStock = totalStock > 0

        await product.save()
        appliedAdjustments.push({ productId: product._id.toString(), color: item.color, quantity: item.quantity })
      }
    } catch (inventoryError: any) {
      // Roll back any applied adjustments before returning error
      try {
        for (const adj of appliedAdjustments) {
          const prod = await Product.findById(adj.productId)
          if (!prod) continue
          const idx = prod.colors.findIndex((c: any) => c.name === adj.color)
          if (idx === -1) continue
          const prev = prod.colors[idx].stock || 0
          prod.colors[idx].stock = prev + adj.quantity
          prod.colors[idx].inStock = (prod.colors[idx].stock || 0) > 0
          const total = prod.colors.reduce((sum: number, c: any) => sum + (c.stock || 0), 0)
          prod.inStock = total > 0
          await prod.save()
        }
      } catch (rollbackError) {
        console.error('Inventory rollback failed:', rollbackError)
      }

      console.error('Inventory update failed:', inventoryError)
      return NextResponse.json(
        { error: inventoryError instanceof Error ? inventoryError.message : 'Failed to update inventory' },
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

  

    const order = new Order(orderData)
    const savedOrder = await order.save()
    
    // Send emails sequentially to avoid conflicts
    try {
      // First, send customer confirmation email
      if (savedOrder?.customerEmail) {
        try {
          await sendEmail({
            to: savedOrder.customerEmail,
            subject: `Order Confirmed: ${savedOrder.orderNumber || savedOrder._id}`,
            html: renderOrderConfirmationEmail(savedOrder),
          })
        } catch (customerEmailError) {
          console.error('Customer email failed:', customerEmailError)
          // Continue with admin email even if customer email fails
        }
        
        // Wait a bit before sending admin email to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      // Then, send admin notification email
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail) {
        try {
          await sendEmail({
            to: adminEmail,
            subject: `🆕 New Order Received: ${savedOrder.orderNumber || savedOrder._id}`,
            html: renderAdminOrderNotification(savedOrder),
          })
        } catch (adminEmailError) {
          console.error('Admin email failed:', adminEmailError)
        }
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the order creation if emails fail
    }
    
    return NextResponse.json(savedOrder, { status: 201 })
  } catch (error) {
    // Attempt rollback if we had already adjusted inventory
    if (appliedAdjustments.length > 0) {
      try {
        for (const adj of appliedAdjustments) {
          const prod = await Product.findById(adj.productId)
          if (!prod) continue
          const idx = prod.colors.findIndex((c: any) => c.name === adj.color)
          if (idx === -1) continue
          const prev = prod.colors[idx].stock || 0
          prod.colors[idx].stock = prev + adj.quantity
          prod.colors[idx].inStock = (prod.colors[idx].stock || 0) > 0
          const total = prod.colors.reduce((sum: number, c: any) => sum + (c.stock || 0), 0)
          prod.inStock = total > 0
          await prod.save()
        }
      } catch (rollbackError) {
        console.error('Inventory rollback failed (outer catch):', rollbackError)
      }
    }

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