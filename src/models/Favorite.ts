import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: String, // Supabase user ID
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Create compound index to ensure a user can only favorite a product once
favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true })

// Clear any existing model to ensure schema updates are applied
if (mongoose.models.Favorite) {
  delete mongoose.models.Favorite
}

export default mongoose.model('Favorite', favoriteSchema) 