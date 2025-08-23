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
export const renderOrderStatusEmail = (order: any, previousStatus?: string): string => {
  const pretty = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

  const escapeHtml = (unsafe: string): string => {
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



export const renderLoginEmail = (email: string, name?: string): string => {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif">
    <h2>Welcome${name ? ', ' + escapeHtml(name) : ''}!</h2>
    <p>You have successfully signed in to TECHSSOUQ.</p>
  </div>`
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}


