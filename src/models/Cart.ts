import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
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

const cartSchema = new mongoose.Schema({
  userId: {
    type: String, // Supabase user ID
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Update the updatedAt field on save
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Clear any existing model to ensure schema updates are applied
if (mongoose.models.Cart) {
  delete mongoose.models.Cart
}

export default mongoose.model('Cart', cartSchema) 