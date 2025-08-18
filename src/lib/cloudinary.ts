import { v2 as cloudinary } from 'cloudinary'

// Debug: Check if environment variables are loaded
console.log('Cloudinary Config Check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
  api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
})

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload image to Cloudinary
export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    // Check if credentials are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials not configured. Please set up your environment variables.')
    }

    console.log('Uploading to Cloudinary:', file.name, file.size, 'bytes')

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'izone-products',
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    })

    console.log('Cloudinary upload successful:', result.secure_url)
    return result.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error(`Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Upload multiple images to Cloudinary
export const uploadMultipleToCloudinary = async (files: File[]): Promise<string[]> => {
  console.log('Uploading multiple files to Cloudinary:', files.length, 'files')
  const uploadPromises = files.map(file => uploadToCloudinary(file))
  return Promise.all(uploadPromises)
}

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    // Don't throw error for delete failures as they're not critical
  }
}

// Extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/v\d+\/([^\/]+)\.\w+$/)
  return match ? match[1] : null
} 