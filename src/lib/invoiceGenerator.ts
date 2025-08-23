import jsPDF from 'jspdf'

interface InvoiceItem {
  productName: string
  quantity: number
  price: number
  total: number
  color?: string
}

interface InvoiceData {
  invoiceNumber: string
  orderNumber: string
  orderDate: string | Date
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  status: string
  paymentStatus: string
  trackingNumber?: string
}

export const generateInvoice = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF()
  
  // Set font
  doc.setFont('helvetica')
  
  // Header
  doc.setFontSize(24)
  doc.setTextColor(255, 140, 0) // Amber color
  doc.text('TECHSSOUQ', 20, 30)
  
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text('Your Trusted Tech Partner', 20, 40)
  
  // Invoice details
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('INVOICE', 150, 30)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Invoice #:', 150, 45)
  doc.text('Order #:', 150, 52)
  doc.text('Date:', 150, 59)
  doc.text('Status:', 150, 66)
  
  doc.setTextColor(0, 0, 0)
  doc.text(data.invoiceNumber, 170, 45)
  doc.text(data.orderNumber, 170, 52)
  const orderDate = data.orderDate instanceof Date ? data.orderDate : new Date(data.orderDate)
  doc.text(orderDate.toLocaleDateString(), 170, 59)
  doc.text(data.status.charAt(0).toUpperCase() + data.status.slice(1), 170, 66)
  
  // Customer information
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Bill To:', 20, 70)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(data.customerName, 20, 80)
  doc.text(data.customerEmail, 20, 87)
  doc.text(data.customerPhone, 20, 94)
  doc.text(data.shippingAddress, 20, 101)
  
  // Shipping information
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Ship To:', 20, 120)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(data.customerName, 20, 130)
  doc.text(data.shippingAddress, 20, 137)
  
  if (data.trackingNumber) {
    doc.text(`Tracking: ${data.trackingNumber}`, 20, 144)
  }
  
  // Items table
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Items', 20, 160)
  
  // Table header
  doc.setFillColor(240, 240, 240)
  doc.rect(20, 165, 170, 10, 'F')
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Product', 25, 172)
  doc.text('Color', 80, 172)
  doc.text('Qty', 110, 172)
  doc.text('Price', 130, 172)
  doc.text('Total', 160, 172)
  
  // Table content
  let yPosition = 180
  data.items.forEach((item, index) => {
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }
    
    doc.setTextColor(0, 0, 0)
    doc.text(item.productName.substring(0, 30), 25, yPosition)
    doc.text(item.color || 'N/A', 80, yPosition)
    doc.text(item.quantity.toString(), 110, yPosition)
    doc.text(`AED ${item.price.toFixed(2)}`, 130, yPosition)
    doc.text(`AED ${item.total.toFixed(2)}`, 160, yPosition)
    
    yPosition += 8
  })
  
  // Totals
  const totalsY = Math.max(yPosition + 10, 260)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Subtotal:', 130, totalsY)
  doc.text('Tax:', 130, totalsY + 8)
  doc.text('Total:', 130, totalsY + 16)
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text(`AED ${data.subtotal.toFixed(2)}`, 160, totalsY)
  doc.text(`AED ${data.tax.toFixed(2)}`, 160, totalsY + 8)
  doc.setFontSize(14)
  doc.setTextColor(255, 140, 0)
  doc.text(`AED ${data.total.toFixed(2)}`, 160, totalsY + 16)
  
  // Payment status
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Payment Status:', 20, totalsY + 30)
  doc.setTextColor(0, 0, 0)
  doc.text(data.paymentStatus.charAt(0).toUpperCase() + data.paymentStatus.slice(1), 50, totalsY + 30)
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Thank you for your purchase!', 20, 280)
  doc.text('For support, contact us at techssouquae@gmail.com', 20, 285)
  
  return doc
}

export const downloadInvoice = (data: InvoiceData, filename?: string): void => {
  const doc = generateInvoice(data)
  const fileName = filename || `invoice-${data.invoiceNumber}.pdf`
  doc.save(fileName)
} 