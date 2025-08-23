import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { sendEmail, renderOrderStatusEmail } from '@/lib/resend'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const order = await Order.findById(params.id)
      .populate('items.productId', 'name image')
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
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
    
    
    // Fetch existing order to compare status changes
    const existingOrder = await Order.findById(params.id)
    
    // Only allow updating specific fields for security
    const allowedUpdates = {
      status: body.status,
      paymentStatus: body.paymentStatus,
      trackingNumber: body.trackingNumber,
      notes: body.notes
    }
    
    // If status is changing to delivered, set deliveredAt timestamp
    if (existingOrder && body?.status === 'delivered' && existingOrder.status !== 'delivered') {
      // @ts-expect-error - allow dynamic prop assignment for update
      allowedUpdates.deliveredAt = new Date()
    }
 
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).populate('items.productId', 'name image')
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    

    
    // If status changed, notify customer
    try {
      if (existingOrder && updatedOrder && existingOrder.status !== updatedOrder.status && updatedOrder.customerEmail) {
    
       const response= await sendEmail({
          to: updatedOrder.customerEmail,
          subject: `Your order ${updatedOrder.orderNumber || updatedOrder._id} is now ${updatedOrder.status}`,
          html: renderOrderStatusEmail(updatedOrder, existingOrder.status),
        })

       
      }
    } catch (emailError) {
      console.error('Failed to send order status email:', emailError)
    }
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
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
    
    const deletedOrder = await Order.findByIdAndDelete(params.id)
    
    if (!deletedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
  
    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
} 