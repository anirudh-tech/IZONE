import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: true
  },
  originalPrice: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  discount: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  },

  reviewCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  features: {
    type: [String],
    default: []
  },
  specifications: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  colors: {
    type: [{
      name: String,
      stock: Number,
      inStock: Boolean
    }],
    required: true,
    validate: {
      validator: function(colors: Array<{name: string, stock: number, inStock: boolean}>) {
        return colors && colors.length > 0
      },
      message: 'At least one color with stock information is required'
    }
  },
  showFeatures: {
    type: Boolean,
    default: false
  },
  showSpecifications: {
    type: Boolean,
    default: false
  },
  showColors: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
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
productSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Clear any existing model to ensure schema updates are applied
if (mongoose.models.Product) {
  delete mongoose.models.Product
}

export default mongoose.model('Product', productSchema) 