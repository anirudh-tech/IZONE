import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: ''
  }
})

const orderSchema = new mongoose.Schema({
      orderNumber: {
      type: String,
      required: false,
      unique: true
    },
  customerId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  orderDate: {
    type: Date,
    default: Date.now,
    set: function(value: any) {
      // Handle both Date objects and ISO strings
      if (typeof value === 'string') {
        return new Date(value)
      }
      return value
    }
  },
  shippingAddress: {
    type: String,
    required: true
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  },
  cancellationNote: {
    type: String,
    default: 'Order cancellation is not allowed. Please contact admin for assistance.'
  }
}, {
  timestamps: true
})

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.orderNumber) {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      
      // Get count of orders for today
      const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      
      const count = await mongoose.model('Order').countDocuments({
        createdAt: { $gte: todayStart, $lt: todayEnd }
      })
      
      this.orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`
    }
    next()
  } catch (error: any) {
    console.error('Error generating order number:', error)
    next(error)
  }
})

// Set deliveredAt when status changes to delivered
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date()
  }
  next()
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order 