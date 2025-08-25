import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import connectDB from '@/lib/mongodb'
import Cart from '@/models/Cart'
import Product from '@/models/Product'

// POST /api/cart/validate - Validate cart items against latest stock and adjust if needed
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Load user's cart with product details
    const cart = await Cart.findOne({ userId: user.id }).populate('items.productId')

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ ok: true, changes: [], cart: null })
    }

    const changes: Array<{ type: 'adjusted' | 'removed'; productId: string; productName?: string; color?: string; fromQty?: number; toQty?: number; reason?: string }> = []

    // Build updated items list
    const updatedItems: any[] = []

    for (const item of cart.items) {
      const productDoc: any = item.productId
      const productIdStr = (productDoc?._id || item.productId)?.toString()

      // Product missing or unpublished
      if (!productDoc || productDoc.status === 'draft') {
        changes.push({
          type: 'removed',
          productId: productIdStr,
          productName: productDoc?.name,
          color: item.color,
          reason: !productDoc ? 'Product no longer exists' : 'Product is unpublished'
        })
        continue
      }

      // If product has color variants, validate selected color and stock
      if (Array.isArray(productDoc.colors) && productDoc.colors.length > 0) {
        const colorEntry = productDoc.colors.find((c: any) => c.name === item.color)
        if (!colorEntry || !colorEntry.inStock || (typeof colorEntry.stock === 'number' && colorEntry.stock <= 0)) {
          changes.push({
            type: 'removed',
            productId: productIdStr,
            productName: productDoc.name,
            color: item.color,
            reason: !colorEntry ? 'Selected color not available' : 'Selected color out of stock'
          })
          continue
        }

        const available = typeof colorEntry.stock === 'number' ? colorEntry.stock : 0
        if (item.quantity > available) {
          changes.push({
            type: 'adjusted',
            productId: productIdStr,
            productName: productDoc.name,
            color: item.color,
            fromQty: item.quantity,
            toQty: available,
            reason: 'Limited stock for selected color'
          })
          updatedItems.push({ ...item.toObject(), quantity: available })
        } else {
          updatedItems.push(item.toObject())
        }
      } else {
        // No color variants: respect inStock boolean
        if (!productDoc.inStock) {
          changes.push({
            type: 'removed',
            productId: productIdStr,
            productName: productDoc.name,
            reason: 'Product is out of stock'
          })
          continue
        }
        // No numeric stock to cap by; keep quantity as-is
        updatedItems.push(item.toObject())
      }
    }

    // Apply updates if there are differences
    const itemsChanged = updatedItems.length !== cart.items.length || updatedItems.some((itm: any, idx: number) => itm.quantity !== cart.items[idx]?.quantity)
    if (itemsChanged) {
      cart.items = updatedItems
      await cart.save()
    }

    // Populate product details for response
    await cart.populate('items.productId')

    // Calculate totals for client convenience
    const cartWithTotals = {
      ...cart.toObject(),
      total: cart.items.reduce((sum: number, item: any) => {
        let price = 0
        try {
          if (item.productId?.price) {
            const priceStr = item.productId.price.toString()
            price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
          }
        } catch (error) {
          price = 0
        }
        return sum + (price * (item.quantity || 1))
      }, 0)
    }

    return NextResponse.json({ ok: changes.length === 0, changes, cart: cartWithTotals })
  } catch (error) {
    console.error('Error validating cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


