import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/izone'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// Validate MongoDB URI format
if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  throw new Error('Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://')
}

// Check if URI contains required components
if (MONGODB_URI.includes('mongodb+srv://') && !MONGODB_URI.includes('@')) {
  console.warn('Warning: MongoDB Atlas connection string detected but no authentication found')
}

console.log('MongoDB URI format validation passed')
console.log('MongoDB URI length:', MONGODB_URI.length)
console.log('MongoDB URI starts with:', MONGODB_URI.substring(0, 20) + '...')

interface Cached {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: Cached = (global as any).mongoose

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection')
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    }

    console.log('Creating new MongoDB connection...')
    console.log('MONGODB_URI:', MONGODB_URI)
    console.log('Connection options:', opts)
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    console.log('Waiting for MongoDB connection...')
    cached.conn = await cached.promise
    console.log('MongoDB connection established successfully')
  } catch (e) {
    console.error('MongoDB connection error:', e)
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB 