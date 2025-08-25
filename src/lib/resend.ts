import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY || ''
const defaultFrom = process.env.EMAIL_FROM || 'TechSSouq <noreply@techssouquae.com>'

let singletonResend: Resend | null = null

export const getResendClient = (): Resend => {
  if (!singletonResend) {
    singletonResend = new Resend(resendApiKey)
  }
  return singletonResend
}

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

export const sendEmail = async (params: SendEmailParams): Promise<any> => {
  if (!resendApiKey) {
    const message = 'RESEND_API_KEY is not set; cannot send email'
    console.error(message)
    throw new Error(message)
  }
  
  const resend = getResendClient()
  try {
    const result = await resend.emails.send({
      from: params.from || defaultFrom,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    })
    
    return result
  } catch (err: any) {
    // Surface API error details for easier debugging
    console.error('Resend email send failed:', err?.message || err)
    if (err?.name) console.error('Resend error name:', err.name)
    if (err?.statusCode) console.error('Resend status code:', err.statusCode)
    if (err?.response?.body) console.error('Resend response body:', err.response.body)
    
    throw err
  }
}

// Simple HTML templates
export const renderOrderConfirmationEmail = (order: any): string => {
  const itemsHtml = Array.isArray(order.items)
    ? order.items
        .map((it: any) => `<tr><td>${escapeHtml(it.productName || '')}</td><td>${it.quantity}</td><td>AED ${Number(it.total || it.price || 0).toFixed(2)}</td></tr>`) 
        .join('')
    : ''
  return `
  <div style="font-family:Arial,Helvetica,sans-serif">
    <h2>Thanks for your order${order.customerName ? ', ' + escapeHtml(order.customerName) : ''}!</h2>
    <p>We received your order ${order.orderNumber ? `<strong>${escapeHtml(order.orderNumber)}</strong>` : ''}.</p>
    <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;min-width:360px">
      <thead><tr><th align="left">Product</th><th align="left">Qty</th><th align="left">Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p style="margin-top:12px">Subtotal: AED ${Number(order.subtotal || 0).toFixed(2)}<br/>
    Tax: AED ${Number(order.tax || 0).toFixed(2)}<br/>
    <strong>Grand Total: AED ${Number(order.totalAmount || 0).toFixed(2)}</strong></p>
  </div>`
}
export const renderOrderStatusEmail = (order: any, previousStatus?: string) => {
  const pretty = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

  const escapeHtml = (unsafe: any): string => {
    // Handle null, undefined, or non-string values
    if (unsafe == null || typeof unsafe !== 'string') {
      return String(unsafe || 'N/A')
    }
    
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f9fafb; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">🛍️ Order Update: <span style="color: #3b82f6;">${escapeHtml(order.orderNumber || '')}</span></h2>
      
      ${
        previousStatus
          ? `<p style="font-size: 16px; margin-bottom: 10px;">🔄 Status changed from <strong style="color:#f97316;">${escapeHtml(pretty(previousStatus))}</strong> to <strong style="color:#10b981;">${escapeHtml(pretty(order.status || ''))}</strong>.</p>`
          : `<p style="font-size: 16px; margin-bottom: 10px;">📌 Current status: <strong style="color:#10b981;">${escapeHtml(pretty(order.status || ''))}</strong></p>`
      }

      <p style="margin: 10px 0; font-size: 16px;">💳 Payment Status: <strong style="color: ${order.paymentStatus === 'paid' ? '#10b981' : '#ef4444'};">${escapeHtml(pretty(order.paymentStatus || 'Unknown'))}</strong></p>

      ${order.trackingNumber ? `
        <p style="margin: 10px 0; font-size: 16px;">📦 Tracking Number: <strong>${escapeHtml(order.trackingNumber)}</strong></p>
      ` : ''}

      ${order.trackingId ? `
        <p style="margin: 10px 0; font-size: 16px;">🆔 Tracking ID: <strong>${escapeHtml(order.trackingId)}</strong></p>
      ` : ''}

      ${order.notes ? `
        <p style="margin: 10px 0; font-size: 16px;">📝 Admin Notes: <strong>${escapeHtml(order.notes)}</strong></p>
      ` : ''}

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

      <p style="font-size: 14px; color: #6b7280;">Thank you for shopping with us! If you have any questions, feel free to contact our support.</p>
    </div>
  </div>`
}

export const renderAdminOrderNotification = (order: any): string => {
  const escapeHtml = (unsafe: any): string => {
    // Handle null, undefined, or non-string values
    if (unsafe == null || typeof unsafe !== 'string') {
      return String(unsafe || 'N/A')
    }
    
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const itemsHtml = Array.isArray(order.items)
    ? order.items
        .map((it: any) => `<tr><td>${escapeHtml(it.productName || '')}</td><td>${it.quantity}</td><td>${escapeHtml(it.color || 'N/A')}</td><td>${escapeHtml(it.size || 'N/A')}</td><td>AED ${Number(it.total || it.price || 0).toFixed(2)}</td></tr>`)
        .join('')
    : ''

  const orderDate = new Date(order.orderDate || order.createdAt || Date.now()).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 20px; background-color: #f5f7fa; }
      .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
      .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
      .content { padding: 30px; }
      .order-summary { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .order-summary h3 { margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; }
      .order-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
      .detail-group { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; }
      .detail-label { font-weight: 600; color: #6c757d; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
      .detail-value { color: #2c3e50; font-size: 14px; }
      .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .items-table th { background: #667eea; color: white; padding: 12px; text-align: left; font-weight: 600; }
      .items-table td { padding: 12px; border-bottom: 1px solid #e9ecef; }
      .items-table tr:last-child td { border-bottom: none; }
      .total-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
      .total-row.grand-total { font-size: 18px; font-weight: 600; color: #2c3e50; border-top: 2px solid #dee2e6; padding-top: 12px; margin-top: 12px; }
      .action-buttons { text-align: center; margin: 30px 0; }
      .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; border-radius: 6px; text-decoration: none; font-weight: 600; transition: all 0.3s ease; }
      .btn-primary { background: #667eea; color: white; }
      .btn-primary:hover { background: #5a6fd8; transform: translateY(-2px); }
      .btn-secondary { background: #6c757d; color: white; }
      .btn-secondary:hover { background: #5a6268; transform: translateY(-2px); }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
      @media (max-width: 768px) { .order-details { grid-template-columns: 1fr; } .items-table { font-size: 12px; } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🛍️ New Order Received!</h1>
        <p>Order #${escapeHtml(order.orderNumber || order._id || 'N/A')} - ${orderDate}</p>
      </div>
      
      <div class="content">
        <div class="order-summary">
          <h3>📋 Order Summary</h3>
          <div class="order-details">
            <div class="detail-group">
              <div class="detail-label">Customer Name</div>
              <div class="detail-value">${escapeHtml(order.customerName || 'N/A')}</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Customer Email</div>
              <div class="detail-value">${escapeHtml(order.customerEmail || 'N/A')}</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Order Status</div>
              <div class="detail-value"><span style="color: #f39c12; font-weight: 600;">${escapeHtml(order.status || 'pending')}</span></div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Payment Status</div>
              <div class="detail-value"><span style="color: #e74c3c; font-weight: 600;">${escapeHtml(order.paymentStatus || 'pending')}</span></div>
            </div>
          </div>
        </div>

        <div class="detail-group" style="margin: 20px 0;">
          <div class="detail-label">Shipping Address</div>
          <div class="detail-value">${escapeHtml(order.shippingAddress || 'N/A')}</div>
        </div>

        <h3 style="color: #2c3e50; margin: 25px 0 15px 0;">📦 Order Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Color</th>
              <th>Size</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>AED ${Number(order.subtotal || 0).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>AED ${Number(order.tax || 0).toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span>AED ${Number(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        ${order.notes ? `
          <div class="detail-group">
            <div class="detail-label">Customer Notes</div>
            <div class="detail-value">${escapeHtml(order.notes)}</div>
          </div>
        ` : ''}

        <div class="action-buttons">
          <a href="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/admin" class="btn btn-primary">View in Admin Panel</a>
          <a href="mailto:${escapeHtml(order.customerEmail || '')}" class="btn btn-secondary">Contact Customer</a>
        </div>
      </div>
      
      <div class="footer">
        <p>This is an automated notification from TECHSSOUQ. Please do not reply to this email.</p>
        <p>Order ID: ${escapeHtml(order._id || 'N/A')} | Generated: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  </body>
  </html>
  `
}

export const renderLoginEmail = (email: string, name?: string): string => {
  const safeName = name ? escapeHtml(name || '') : '';
  
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f5f7fa;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        text-align: center;
      }
      h2 {
        color: #2c3e50;
        font-size: 24px;
        margin-bottom: 10px;
      }
      p {
        color: #555;
        font-size: 16px;
        line-height: 1.6;
      }
      .highlight {
        color: #0d6efd;
        font-weight: bold;
      }
      .footer {
        margin-top: 30px;
        font-size: 13px;
        color: #999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Welcome${safeName ? ', ' + safeName : ''}! 🎉</h2>
      <p>You have successfully signed in to <span class="highlight">TECHSSOUQ</span>.</p>
      <div class="footer">
        <p>If this wasn’t you, please secure your account immediately.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}


function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}


