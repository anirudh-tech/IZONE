import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'all' or default active only

    const query = status === 'all' ? {} : { isActive: true }
    const categories = await Category.find(query).sort({ name: 1 })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const name: string | undefined = body?.name
    const isActive: boolean = body?.isActive !== false

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const slug = slugify(name)

    // Ensure unique slug
    const existing = await Category.findOne({ $or: [{ name }, { slug }] })
    if (existing) {
      return NextResponse.json({ error: 'Category with same name already exists' }, { status: 409 })
    }

    const category = new Category({ name: name.trim(), slug, isActive })
    const saved = await category.save()
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}


