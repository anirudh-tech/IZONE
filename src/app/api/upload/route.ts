import { NextRequest, NextResponse } from 'next/server'
import { uploadMultipleToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData()
    
    // Handle file uploads
    const files = formData.getAll('images') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Validate files
    for (const file of files) {
      if (file instanceof File) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            { error: 'Invalid file type. Only JPEG, PNG and WebP images are allowed.' },
            { status: 400 }
          )
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size too large. Maximum size is 5MB.' },
            { status: 400 }
          )
        }
      }
    }

    // Upload to Cloudinary
    const uploadedUrls = await uploadMultipleToCloudinary(files)

    return NextResponse.json({
      success: true,
      message: 'Images uploaded successfully to Cloudinary',
      files: uploadedUrls
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload images to Cloudinary' },
      { status: 500 }
    )
  }
} 