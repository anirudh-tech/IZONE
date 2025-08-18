import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Order from '@/models/Order'
import { generateInvoice } from '@/lib/invoiceGenerator'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const order = await Order.findById(params.id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Check if order is delivered
    if (order.status !== 'delivered') {
      return NextResponse.json({ 
        error: 'Invoice can only be downloaded for delivered orders' 
      }, { status: 400 })
    }
    
    // Generate invoice data
    const invoiceData = {
      invoiceNumber: `INV-${order.orderNumber}`,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || 'N/A',
      shippingAddress: order.shippingAddress,
      items: order.items.map((item: any) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: parseFloat(item.price.replace(/[^\d.]/g, '')) || 0,
        total: item.total,
        color: item.color || 'N/A'
      })),
      subtotal: order.totalAmount,
      tax: 0, // You can add tax calculation logic here
      total: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber
    }
    
    // Generate PDF
    const doc = generateInvoice(invoiceData)
    
    // Convert to buffer
    const pdfBuffer = doc.output('arraybuffer')
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
} 