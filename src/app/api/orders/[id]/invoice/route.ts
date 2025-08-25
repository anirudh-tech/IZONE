import { NextRequest, NextResponse } from 'next/server'
import Order from '@/models/Order'
import { generateInvoice } from '@/lib/invoiceGenerator'
import connectDB from '@/lib/mongodb'

export const runtime = 'nodejs'

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
      deliveredAt: order.deliveredAt||'N/A',
      shippingAddress: order.shippingAddress,
      items: order.items.map((item: any) => {
        const numericPrice = typeof item.price === 'number'
          ? item.price
          : parseFloat(String(item.price).replace(/[^\d.]/g, '')) || 0
        const numericTotal = typeof item.total === 'number'
          ? item.total
          : parseFloat(String(item.total).replace(/[^\d.]/g, '')) || 0
        return {
          productName: item.productName,
          quantity: item.quantity,
          price: numericPrice,
          total: numericTotal,
          image:item.image,
          color: item.color || 'N/A'
        }
      }),
      subtotal: order.subtotal,
      tax: 0, // You can add tax calculation logic here
      total: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber
    }
    
    // Generate PDF
    let pdfArrayBuffer: ArrayBuffer
    try {
      const doc = generateInvoice(invoiceData)
      const pdfBuffer = doc.output('arraybuffer')
      pdfArrayBuffer = pdfBuffer as ArrayBuffer
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError)
      return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
    }
    
    // Return PDF as response
    return new NextResponse(pdfArrayBuffer, {
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