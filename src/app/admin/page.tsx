'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  Upload,
  Save,
  X,
  Search,
  Filter,
  Image as ImageIcon,
  Camera,
  Move,
  Download
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { productsApi, reviewsApi, Review } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

// Type definitions
interface Product {
  id: string
  name: string
  price: number
  originalPrice: number
  discount: number
  category: string
  stockCount: number
  images: string[]
  description: string
  inStock: boolean
  rating: number
  reviewCount: number
  features?: string[]
  specifications?: Record<string, string>
  colors: ColorStock[] // Changed from string[] to ColorStock[]
  showFeatures?: boolean
  showSpecifications?: boolean
  showColors?: boolean
  status: 'draft' | 'published'
}

interface ColorStock {
  name: string
  stock: number
  inStock: boolean
}

interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  orderDate: string
  shippingAddress: string
  trackingNumber?: string
  notes?: string
}

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  joinDate: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
  status: 'active' | 'inactive' | 'vip'
  avatar?: string
}

interface FormData {
  name: string
  originalPrice: string
  discount: string
  category: string
  description: string
  images: string[]
  rating: string
  reviewCount: string
  features: string[]
  specifications: Record<string, string>
  colors: ColorStock[] // Changed from string[] to ColorStock[]
  inStock: boolean
  showFeatures: boolean
  showSpecifications: boolean
  showColors: boolean
  status: 'draft' | 'published'
}

// Mock data - in a real app, this would come from an API
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 14 Pro Max',
    price: 1099,
    originalPrice: 1499,
    discount: 25,
    category: 'Mobile',
    stockCount: 15,
    images: ['/iphone14F-removebg-preview.png'],
    description: 'Latest iPhone with cutting-edge technology and advanced camera system',
    inStock: true,
    rating: 4.8,
            reviewCount: 124,
    colors: [
      { name: 'Deep Purple', stock: 5, inStock: true },
      { name: 'Gold', stock: 3, inStock: true },
      { name: 'Silver', stock: 4, inStock: true },
      { name: 'Space Black', stock: 3, inStock: true }
    ],
    status: 'published'
  },
  {
    id: '2',
    name: 'Apple Watch Series 8',
    price: 1499,
    originalPrice: 1899,
    discount: 20,
    category: 'Wearables',
    stockCount: 8,
    images: ['/iphone14s-removebg-preview.png'],
    description: 'Advanced smartwatch with health monitoring and fitness tracking',
    inStock: true,
    rating: 4.9,
            reviewCount: 89,
    colors: [
      { name: 'Midnight', stock: 3, inStock: true },
      { name: 'Starlight', stock: 2, inStock: true },
      { name: 'Silver', stock: 2, inStock: true },
      { name: 'Red', stock: 1, inStock: true }
    ],
    status: 'published'
  },
  {
    id: '3',
    name: 'AirPods Pro 2nd Gen',
    price: 749,
    originalPrice: 949,
    discount: 20,
    category: 'Audio',
    stockCount: 22,
    images: ['/iphone14c-removebg-preview.png'],
    description: 'Advanced wireless earbuds with adaptive audio and noise cancellation',
    inStock: true,
    rating: 4.7,
            reviewCount: 156,
    colors: [
      { name: 'White', stock: 22, inStock: true }
    ],
    status: 'published'
  }
]



// Mock customers data
const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ahmed Al Mansouri',
    email: 'ahmed@example.com',
    phone: '+971-50-123-4567',
    address: 'Dubai Marina, Dubai, UAE',
    joinDate: '2023-06-15',
    totalOrders: 5,
    totalSpent: 5247,
    lastOrderDate: '2024-01-15',
    status: 'vip'
  },
  {
    id: '2',
    name: 'Fatima Al Zahra',
    email: 'fatima@example.com',
    phone: '+971-50-234-5678',
    address: 'Abu Dhabi Corniche, Abu Dhabi, UAE',
    joinDate: '2023-08-22',
    totalOrders: 3,
    totalSpent: 2998,
    lastOrderDate: '2024-01-18',
    status: 'active'
  },
  {
    id: '3',
    name: 'Omar Al Rashid',
    email: 'omar@example.com',
    phone: '+971-50-345-6789',
    address: 'Sharjah City, Sharjah, UAE',
    joinDate: '2023-11-10',
    totalOrders: 2,
    totalSpent: 2198,
    lastOrderDate: '2024-01-20',
    status: 'active'
  },
  {
    id: '4',
    name: 'Aisha Al Qasimi',
    email: 'aisha@example.com',
    phone: '+971-50-456-7890',
    address: 'Ajman City, Ajman, UAE',
    joinDate: '2024-01-05',
    totalOrders: 1,
    totalSpent: 749,
    lastOrderDate: '2024-01-22',
    status: 'active'
  },
  {
    id: '5',
    name: 'Khalid Al Falasi',
    email: 'khalid@example.com',
    phone: '+971-50-567-8901',
    address: 'Fujairah City, Fujairah, UAE',
    joinDate: '2023-09-18',
    totalOrders: 4,
    totalSpent: 3747,
    lastOrderDate: '2024-01-25',
    status: 'inactive'
  }
]

export default function AdminPage() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activeTab, setActiveTab] = useState('products')
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Order and Customer search/filter states
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('All')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [customerStatusFilter, setCustomerStatusFilter] = useState('All')

  // Order and Customer edit modal states
  const [isOrderEditModalOpen, setIsOrderEditModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isCustomerEditModalOpen, setIsCustomerEditModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Order edit form state
  const [orderEditForm, setOrderEditForm] = useState({
    status: 'pending' as Order['status'],
    paymentStatus: 'pending' as Order['paymentStatus'],
    trackingNumber: '',
    notes: ''
  })

  // Customer edit form state
  const [customerEditForm, setCustomerEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as Customer['status']
  })

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isReviewEditModalOpen, setIsReviewEditModalOpen] = useState(false)
  const [reviewSearchQuery, setReviewSearchQuery] = useState('')
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All')

  // Form state for add/edit product
  const [formData, setFormData] = useState<FormData>({
    name: '',
    originalPrice: '',
    discount: '',
    category: '',
    description: '',
    images: [],
    rating: '',
    reviewCount: '',
    features: [''],
    specifications: {},
    colors: [
      { name: '', stock: 0, inStock: true }
    ],
    inStock: true,
    showFeatures: false,
    showSpecifications: false,
    showColors: true,
    status: 'draft'
  })

  const categories = ['All', 'Mobile', 'Audio', 'Wearables', 'Tablets', 'Computers', 'Entertainment', 'Smart Home', 'Accessories']

  // Helper functions for price and discount extraction
  const extractPriceValue = (priceString: string): number => {
    if (!priceString) return 0
    const match = priceString.match(/[\d,]+\.?\d*/)
    return match ? parseFloat(match[0].replace(/,/g, '')) : 0
  }

  const extractDiscountValue = (discountString: string): number => {
    if (!discountString) return 0
    const match = discountString.match(/\d+/)
    return match ? parseInt(match[0]) : 0
  }

  // Common specification fields
  const specFields = [
    'Display', 'Chip', 'Storage', 'Camera', 'Battery', 'Connectivity', 
    'Weight', 'Dimensions', 'Water Resistance', 'Warranty', 'Color Options',
    'Operating System', 'RAM', 'Processor', 'Graphics', 'Ports'
  ]

  // Dashboard stats
  const stats = {
    totalProducts: products.length,
    totalRevenue: products.reduce((sum, p) => sum + p.price * p.stockCount, 0),
    totalOrders: 156,
    totalCustomers: 89
  }

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = orderSearchQuery === '' || 
      order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(orderSearchQuery.toLowerCase())
    const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter
    return matchesSearch && matchesStatus
  })

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customerSearchQuery === '' || 
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone.includes(customerSearchQuery)
    const matchesStatus = customerStatusFilter === 'All' || customer.status === customerStatusFilter
    return matchesSearch && matchesStatus
  })

  // Load products from API
  const loadProducts = async () => {
    try {
      // For admin, we need to fetch all products (both draft and published)
      const response = await fetch('/api/products?status=all')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const apiProducts = await response.json()
      
      // Convert API products to match our interface
      const convertedProducts: Product[] = apiProducts.map(product => ({
        id: product._id,
        name: product.name,
        price: extractPriceValue(product.price),
        originalPrice: extractPriceValue(product.originalPrice),
        discount: extractDiscountValue(product.discount),
        category: product.category || 'Uncategorized',
        stockCount: 100, // Default stock count
        images: product.images || [product.image], // Use images array if available
        description: product.description || 'No description available',
        inStock: product.inStock !== false,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        features: product.features || [],
        specifications: product.specifications || {},
        colors: product.colors || [{ name: 'Default', stock: 100, inStock: true }],
        showFeatures: product.showFeatures || false,
        showSpecifications: product.showSpecifications || false,
        showColors: product.showColors !== undefined ? product.showColors : true,
        status: product.status || 'draft'
      }))
      
      setProducts(convertedProducts)
      console.log('Products loaded successfully:', convertedProducts.length)
    } catch (error) {
      console.error('Error loading products:', error)
      showToast('Failed to load products. Please refresh the page.', 'error')
      // Keep using initial products if API fails
    }
  }

  // Load products and orders from API on component mount
  useEffect(() => {
    loadProducts()
    loadOrders()
  }, [])

  const handleAddProduct = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Validate required fields
      if (!formData.name || !formData.originalPrice || !formData.category || !formData.description) {
        showToast('Please fill in all required fields', 'warning')
        return
      }

      // Validate images
      if (formData.images.length === 0) {
        showToast('Please upload at least one product image', 'warning')
        return
      }

      // Validate colors - at least one color with stock is required
      const validColors = formData.colors.filter(c => c.name.trim() !== '' && c.stock > 0)
      if (validColors.length === 0) {
        showToast('Please add at least one color with stock quantity greater than 0', 'warning')
        return
      }

      // Calculate final price from original price and discount
      const originalPrice = parseFloat(formData.originalPrice)
      const discountPercent = parseFloat(formData.discount) || 0
      const finalPrice = originalPrice - (originalPrice * discountPercent / 100)

      // Convert blob URLs to files for upload
      const imageFiles: File[] = []
      console.log('Processing images:', formData.images)
      
      for (const imageUrl of formData.images) {
        // Skip empty or invalid URLs
        if (!imageUrl || imageUrl.trim() === '') {
          console.log('Skipping empty image URL')
          continue
        }
        
        try {
          const response = await fetch(imageUrl)
          if (!response.ok) {
            console.error('Failed to fetch image:', response.status, response.statusText)
            continue
          }
          
          const blob = await response.blob()
          const file = new File([blob], `image-${Date.now()}-${Math.random()}.jpg`, { type: blob.type })
          imageFiles.push(file)
          console.log('Successfully converted image to file:', file.name)
        } catch (error) {
          console.error('Error converting image URL to file:', error)
        }
      }
      
      console.log('Total image files processed:', imageFiles.length)

      if (imageFiles.length === 0) {
        showToast('Failed to process images. Please try again.', 'error')
        return
      }

      // Upload images to Cloudinary
      const validImageUrls = await uploadImages(imageFiles)

      if (validImageUrls.length === 0) {
        showToast('Failed to upload images. Please try again.', 'error')
        return
      }

      // Prepare product data for API
      const apiProductData = {
        name: formData.name,
        price: `AED ${finalPrice.toFixed(0)}`,
        originalPrice: `AED ${originalPrice.toFixed(0)}`,
        discount: discountPercent > 0 ? `${discountPercent.toFixed(0)}% OFF` : '0% OFF',
        image: validImageUrls[0], // Use first valid image as main image
        images: validImageUrls, // Send all images
        description: formData.description,
        category: formData.category,
        inStock: formData.inStock,
        rating: parseInt(formData.rating) || 0,
        reviewCount: parseInt(formData.reviewCount) || 0,
        features: formData.showFeatures ? formData.features.filter(f => f.trim() !== '') : [],
        specifications: formData.showSpecifications ? formData.specifications : {},
        colors: validColors.map(c => ({
          name: c.name,
          stock: c.stock,
          inStock: c.stock > 0
        })),
        showFeatures: formData.showFeatures,
        showSpecifications: formData.showSpecifications,
        showColors: formData.showColors,
        status: formData.status
      }

      // Add product via API
      const response = await productsApi.create(apiProductData)
      
      if (response._id) {
        // Refresh products list
        const updatedProducts = await productsApi.getAll()
        
        // Convert API response to local Product format
        const convertedProducts = updatedProducts.map(product => ({
          id: product._id,
          name: product.name,
          price: parseInt(product.price.replace(/[^\d]/g, '')) || 0,
          originalPrice: parseInt(product.originalPrice.replace(/[^\d]/g, '')) || 0,
          discount: parseInt(product.discount.replace(/[^\d]/g, '')) || 0,
          category: product.category || 'Uncategorized',
          stockCount: 0,
          images: product.images || [product.image],
          description: product.description || 'No description available',
          inStock: product.inStock !== false,
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          features: product.features || [],
          specifications: product.specifications || {},
          colors: product.colors || [],
          showFeatures: product.showFeatures || false,
          showSpecifications: product.showSpecifications || false,
          showColors: product.showColors !== undefined ? product.showColors : true,
          status: product.status || 'draft'
        }))

        setProducts(convertedProducts)
        setIsAddModalOpen(false)
        resetForm()
        showToast('Product added successfully!', 'success')
      } else {
        showToast('Failed to add product', 'error')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      showToast('Error adding product. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return

    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Validate required fields
      if (!formData.name || !formData.originalPrice || !formData.category || !formData.description) {
        showToast('Please fill in all required fields', 'warning')
        return
      }

      // Validate images
      if (formData.images.length === 0) {
        showToast('Please upload at least one product image', 'warning')
        return
      }

      // Validate colors - at least one color with stock is required
      const validColors = formData.colors.filter(c => c.name.trim() !== '' && c.stock > 0)
      if (validColors.length === 0) {
        showToast('Please add at least one color with stock quantity greater than 0', 'warning')
        return
      }

      // Calculate final price from original price and discount
      const originalPrice = parseFloat(formData.originalPrice)
      const discountPercent = parseFloat(formData.discount) || 0
      const finalPrice = originalPrice - (originalPrice * discountPercent / 100)

      // Convert blob URLs to files for upload
      const imageFiles: File[] = []
      console.log('Processing images:', formData.images)
      
      for (const imageUrl of formData.images) {
        // Skip empty or invalid URLs
        if (!imageUrl || imageUrl.trim() === '') {
          console.log('Skipping empty image URL')
          continue
        }
        
        try {
          const response = await fetch(imageUrl)
          if (!response.ok) {
            console.error('Failed to fetch image:', response.status, response.statusText)
            continue
          }
          
          const blob = await response.blob()
          const file = new File([blob], `image-${Date.now()}-${Math.random()}.jpg`, { type: blob.type })
          imageFiles.push(file)
          console.log('Successfully converted image to file:', file.name)
        } catch (error) {
          console.error('Error converting image URL to file:', error)
        }
      }
      
      console.log('Total image files processed:', imageFiles.length)

      if (imageFiles.length === 0) {
        showToast('Failed to process images. Please try again.', 'error')
        return
      }

      // Upload images to Cloudinary
      const validImageUrls = await uploadImages(imageFiles)

      if (validImageUrls.length === 0) {
        showToast('Failed to upload images. Please try again.', 'error')
        return
      }

      // Prepare product data for API
      const apiProductData = {
        name: formData.name,
        price: `AED ${finalPrice.toFixed(0)}`,
        originalPrice: `AED ${originalPrice.toFixed(0)}`,
        discount: discountPercent > 0 ? `${discountPercent.toFixed(0)}% OFF` : '0% OFF',
        image: validImageUrls[0], // Use first valid image as main image
        images: validImageUrls, // Send all images
        description: formData.description,
        category: formData.category,
        inStock: formData.inStock,
        rating: parseInt(formData.rating) || 0,
        reviewCount: parseInt(formData.reviewCount) || 0,
        features: formData.showFeatures ? formData.features.filter(f => f.trim() !== '') : [],
        specifications: formData.showSpecifications ? formData.specifications : {},
        colors: validColors.map(c => ({
          name: c.name,
          stock: c.stock,
          inStock: c.stock > 0
        })),
        showFeatures: formData.showFeatures,
        showSpecifications: formData.showSpecifications,
        showColors: formData.showColors,
        status: formData.status
      }

      // Update product via API
      const response = await productsApi.update(selectedProduct.id, apiProductData)
      
      if (response._id) {
        // Refresh products list
        await loadProducts()
        
        setIsEditModalOpen(false)
        setSelectedProduct(null)
        resetForm()
        showToast('Product updated successfully!', 'success')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      showToast('Failed to update product. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      // Remove from local state first for immediate UI update
      const updatedProducts = products.filter(product => product.id !== id)
      setProducts(updatedProducts)
      
      // Try to delete from API
      await productsApi.delete(id)
      
      setProducts(updatedProducts)
      showToast('Product deleted successfully!', 'success')
    } catch (err) {
      console.error('Error deleting product:', err)
      showToast(`Failed to delete product: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error')
      // Revert the local state change if API call failed
      loadProducts()
    }
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      originalPrice: product.originalPrice.toString(),
      discount: product.discount.toString(),
      category: product.category,
      description: product.description,
      images: [...product.images],
      rating: product.rating.toString(),
      reviewCount: product.reviewCount.toString(),
      features: product.features || [''],
      specifications: product.specifications || {},
      colors: product.colors.map(c => ({ ...c })),
      inStock: product.inStock,
      showFeatures: !!(product.features && product.features.length > 0),
      showSpecifications: !!(product.specifications && Object.keys(product.specifications).length > 0),
      showColors: !!(product.colors && product.colors.length > 0),
      status: product.status
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      originalPrice: '',
      discount: '',
      category: '',
      description: '',
      images: [],
      rating: '',
      reviewCount: '',
      features: [''],
      specifications: {},
      colors: [
        { name: '', stock: 0, inStock: true },
        { name: '', stock: 0, inStock: true }
      ],
      inStock: true,
      showFeatures: false,
      showSpecifications: false,
      showColors: true, // Make colors mandatory by default
      status: 'draft'
    })
  }

  // Image management functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      
      // Limit to maximum 4 images total
      const maxImages = 4
      const currentCount = formData.images.length
      const availableSlots = maxImages - currentCount
      
      console.log('Image upload - Current count:', currentCount, 'Available slots:', availableSlots)
      
      if (availableSlots <= 0) {
        showToast('Maximum 4 images allowed. Please remove some images first.', 'warning')
        return
      }
      
      // Process files up to available slots
      const filesToProcess = Array.from(files).slice(0, availableSlots)
      console.log('Files to process:', filesToProcess.length)
      
      filesToProcess.forEach((file, index) => {
        // Create a temporary URL for preview
        const url = URL.createObjectURL(file)
        newImages.push(url)
        console.log(`Created URL for file ${index + 1}:`, url.substring(0, 50) + '...')
      })
      
      // Update images array - if this is the first upload, replace empty array
      // If adding to existing images, append new ones
      const updatedImages = currentCount === 0 ? newImages : [...formData.images, ...newImages]
      console.log('Updated images array length:', updatedImages.length)
      
      setFormData({...formData, images: updatedImages})
      
      // Clear the input value to allow re-uploading the same file
      e.target.value = ''
    }
  }

  const handleImageRemove = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({...formData, images: newImages})
  }

  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setFormData({...formData, images: newImages})
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (toIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      handleImageReorder(draggedIndex, toIndex)
    }
    setDraggedIndex(null)
  }

  const openImageModal = (product: Product, index: number = 0) => {
    setSelectedImage(product.images[index])
    setIsImageModalOpen(true)
  }

  // Upload images to Cloudinary
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const formData = new FormData()
    
    files.forEach((file) => {
      formData.append('images', file)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      showToast('Images uploaded successfully!', 'success')
      return result.files
    } catch (error) {
      console.error('Upload error:', error)
      showToast('Failed to upload images. Please try again.', 'error')
      throw new Error('Failed to upload images to Cloudinary')
    }
  }

  // Order management functions
  // Load orders from API
  const loadOrders = async () => {
    try {
      // For admin, we'll load all orders (in a real app, you might want pagination)
      const response = await fetch('/api/orders/admin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to load orders')
      }
      
      const data = await response.json()
      
      // Map MongoDB _id to id and convert dates to strings
      const mappedOrders: Order[] = data.map((order: any) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        orderDate: new Date(order.orderDate).toISOString(),
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber,
        notes: order.notes
      }))
      
      setOrders(mappedOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
      showToast('Failed to load orders', 'error')
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update order status')
      }
      
      const updatedOrder = await response.json()
      
      // Map the updated order to match our interface
      const mappedUpdatedOrder: Order = {
        id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        customerId: updatedOrder.customerId,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        items: updatedOrder.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        totalAmount: updatedOrder.totalAmount,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        orderDate: new Date(updatedOrder.orderDate).toISOString(),
        shippingAddress: updatedOrder.shippingAddress,
        trackingNumber: updatedOrder.trackingNumber,
        notes: updatedOrder.notes
      }
      
      setOrders(orders.map(order => 
        order.id === orderId ? mappedUpdatedOrder : order
      ))
      showToast('Order status updated successfully', 'success')
    } catch (error) {
      console.error('Error updating order status:', error)
      showToast('Failed to update order status', 'error')
    }
  }

  // Update payment status
  const updatePaymentStatus = async (orderId: string, newPaymentStatus: Order['paymentStatus']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update payment status')
      }
      
      const updatedOrder = await response.json()
      
      // Map the updated order to match our interface
      const mappedUpdatedOrder: Order = {
        id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        customerId: updatedOrder.customerId,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        items: updatedOrder.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        totalAmount: updatedOrder.totalAmount,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        orderDate: new Date(updatedOrder.orderDate).toISOString(),
        shippingAddress: updatedOrder.shippingAddress,
        trackingNumber: updatedOrder.trackingNumber,
        notes: updatedOrder.notes
      }
      
      setOrders(orders.map(order => 
        order.id === orderId ? mappedUpdatedOrder : order
      ))
      showToast('Payment status updated successfully', 'success')
    } catch (error) {
      console.error('Error updating payment status:', error)
      showToast('Failed to update payment status', 'error')
    }
  }

  // Add tracking number
  const addTrackingNumber = async (orderId: string, trackingNumber: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to add tracking number')
      }
      
      const updatedOrder = await response.json()
      
      // Map the updated order to match our interface
      const mappedUpdatedOrder: Order = {
        id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        customerId: updatedOrder.customerId,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        items: updatedOrder.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        totalAmount: updatedOrder.totalAmount,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        orderDate: new Date(updatedOrder.orderDate).toISOString(),
        shippingAddress: updatedOrder.shippingAddress,
        trackingNumber: updatedOrder.trackingNumber,
        notes: updatedOrder.notes
      }
      
      setOrders(orders.map(order => 
        order.id === orderId ? mappedUpdatedOrder : order
      ))
      showToast('Tracking number added successfully', 'success')
    } catch (error) {
      console.error('Error adding tracking number:', error)
      showToast('Failed to add tracking number', 'error')
    }
  }

  // Delete order
  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete order')
      }
      
      setOrders(orders.filter(order => order.id !== orderId))
      showToast('Order deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting order:', error)
      showToast('Failed to delete order', 'error')
    }
  }

  // Customer management functions
  const updateCustomerStatus = (customerId: string, newStatus: Customer['status']) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId ? { ...customer, status: newStatus } : customer
    ))
  }

  // Order edit functions
  const openOrderEditModal = (order: Order) => {
    setSelectedOrder(order)
    setOrderEditForm({
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || '',
      notes: order.notes || ''
    })
    setIsOrderEditModalOpen(true)
  }

  const handleOrderEdit = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: orderEditForm.status,
          paymentStatus: orderEditForm.paymentStatus,
          trackingNumber: orderEditForm.trackingNumber || undefined,
          notes: orderEditForm.notes || undefined
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update order')
      }
      
      const updatedOrder = await response.json()
      
      // Map the updated order to match our interface
      const mappedUpdatedOrder: Order = {
        id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        customerId: updatedOrder.customerId,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        items: updatedOrder.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        totalAmount: updatedOrder.totalAmount,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        orderDate: new Date(updatedOrder.orderDate).toISOString(),
        shippingAddress: updatedOrder.shippingAddress,
        trackingNumber: updatedOrder.trackingNumber,
        notes: updatedOrder.notes
      }
      
      setOrders(orders.map(order => 
        order.id === selectedOrder.id ? mappedUpdatedOrder : order
      ))
      setIsOrderEditModalOpen(false)
      setSelectedOrder(null)
      showToast('Order updated successfully', 'success')
    } catch (error) {
      console.error('Error updating order:', error)
      showToast('Failed to update order', 'error')
    }
  }

  // Customer edit functions
  const openCustomerEditModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      status: customer.status
    })
    setIsCustomerEditModalOpen(true)
  }

  const handleCustomerEdit = () => {
    if (!selectedCustomer) return

    const updatedCustomers = customers.map(customer => 
      customer.id === selectedCustomer.id 
        ? {
            ...customer,
            name: customerEditForm.name,
            email: customerEditForm.email,
            phone: customerEditForm.phone,
            address: customerEditForm.address,
            status: customerEditForm.status
          }
        : customer
    )
    setCustomers(updatedCustomers)
    setIsCustomerEditModalOpen(false)
    setSelectedCustomer(null)
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
      case 'active':
      case 'vip':
        return 'bg-green-100 text-green-800'
      case 'shipped':
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
      case 'failed':
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleToggleStatus = async (product: Product) => {
    try {
      const newStatus: 'draft' | 'published' = product.status === 'published' ? 'draft' : 'published'
      
      // Update via API
      await productsApi.updateStatus(product.id, newStatus)
      
      // Update local state
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, status: newStatus } : p
      )
      setProducts(updatedProducts)
      
      showToast(`Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`, 'success')
    } catch (error) {
      console.error('Error updating product status:', error)
      showToast('Failed to update product status', 'error')
    }
  }

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      showToast('Failed to download invoice', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your products, orders, and customers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-amber-400" />
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">AED {stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Customers</p>
                <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <div className="flex space-x-8">
              <button 
                onClick={() => setActiveTab('products')}
                className={`py-4 font-semibold transition-colors ${
                  activeTab === 'products' 
                    ? 'text-amber-400 border-b-2 border-amber-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Products
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`py-4 font-semibold transition-colors ${
                  activeTab === 'orders' 
                    ? 'text-amber-400 border-b-2 border-amber-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Orders
              </button>
              <button 
                onClick={() => setActiveTab('customers')}
                className={`py-4 font-semibold transition-colors ${
                  activeTab === 'customers' 
                    ? 'text-amber-400 border-b-2 border-amber-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Customers
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`py-4 font-semibold transition-colors ${
                  activeTab === 'reviews' 
                    ? 'text-amber-400 border-b-2 border-amber-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Reviews
              </button>
            </div>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Images</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-600 rounded-lg mr-3 overflow-hidden">
                              {product.images && product.images[0] && (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{product.name}</div>
                              <div className="text-sm text-gray-400">{product.description.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-600 text-gray-300 rounded-full">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">AED {product.price}</div>
                          <div className="text-sm text-gray-400 line-through">AED {product.originalPrice}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{product.stockCount}</div>
                          <div className={`text-xs ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-300">{product.images?.length || 0}</span>
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                            <button
                              onClick={() => openImageModal(product)}
                              className="text-amber-400 hover:text-amber-300 text-xs"
                            >
                              View
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              product.status === 'published'
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {product.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                            <button
                              onClick={() => handleToggleStatus(product)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                product.status === 'published'
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                              title={product.status === 'published' ? 'Unpublish' : 'Publish'}
                            >
                              {product.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-amber-400 hover:text-amber-300"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <Link href={`/product/${product.id}`}>
                              <Eye className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search orders by number, customer name, or email..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="All">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{order.orderNumber}</div>
                            <div className="text-sm text-gray-400">{order.shippingAddress}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{order.customerName}</div>
                            <div className="text-sm text-gray-400">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-400">
                            {order.items.map(item => item.productName).join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">AED {order.totalAmount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{new Date(order.orderDate).toLocaleDateString()}</div>
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <div className="flex space-x-2">
                             <button
                               onClick={() => openOrderEditModal(order)}
                               className="text-amber-400 hover:text-amber-300"
                               title="Edit Order"
                             >
                               <Edit className="w-4 h-4" />
                             </button>
                             <button
                               className="text-blue-400 hover:text-blue-300"
                               title="View Details"
                             >
                               <Eye className="w-4 h-4" />
                             </button>
                             <button
                               onClick={() => deleteOrder(order.id)}
                               className="text-red-400 hover:text-red-300"
                               title="Delete Order"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                             {order.trackingNumber && (
                               <span className="text-green-400 text-xs">✓ Tracked</span>
                             )}
                             {order.status === 'delivered' && (
                               <button
                                 onClick={() => handleDownloadInvoice(order.id)}
                                 className="text-blue-400 hover:text-blue-300"
                                 title="Download Invoice"
                               >
                                 <Download className="w-4 h-4" />
                               </button>
                             )}
                           </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Orders Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">Total Orders</div>
                <div className="text-2xl font-bold text-white">{filteredOrders.length}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">Total Revenue</div>
                <div className="text-2xl font-bold text-white">
                  AED {filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">Pending Orders</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {filteredOrders.filter(order => order.status === 'pending').length}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">Delivered Orders</div>
                <div className="text-2xl font-bold text-green-400">
                  {filteredOrders.filter(order => order.status === 'delivered').length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search customers by name, email, or phone..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={customerStatusFilter}
                  onChange={(e) => setCustomerStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="All">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Join Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-medium">
                                {customer.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{customer.name}</div>
                              <div className="text-sm text-gray-400">{customer.address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-300">{customer.email}</div>
                            <div className="text-sm text-gray-400">{customer.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{customer.totalOrders}</div>
                          {customer.lastOrderDate && (
                            <div className="text-xs text-gray-400">
                              Last: {new Date(customer.lastOrderDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">AED {customer.totalSpent.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{new Date(customer.joinDate).toLocaleDateString()}</div>
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <div className="flex space-x-2">
                             <button
                               onClick={() => openCustomerEditModal(customer)}
                               className="text-amber-400 hover:text-amber-300"
                               title="Edit Customer"
                             >
                               <Edit className="w-4 h-4" />
                             </button>
                             <button
                               className="text-blue-400 hover:text-blue-300"
                               title="View Details"
                             >
                               <Eye className="w-4 h-4" />
                             </button>
                           </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customers Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">Total Customers</div>
                <div className="text-2xl font-bold text-white">{filteredCustomers.length}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">Total Revenue</div>
                <div className="text-2xl font-bold text-white">
                  AED {filteredCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">Active Customers</div>
                <div className="text-2xl font-bold text-green-400">
                  {filteredCustomers.filter(customer => customer.status === 'active').length}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400">VIP Customers</div>
                <div className="text-2xl font-bold text-purple-400">
                  {filteredCustomers.filter(customer => customer.status === 'vip').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Product</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Price field removed - calculated automatically from original price and discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Original Price (AED)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                
                {/* Status Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'draft' | 'published'})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Draft products are not visible to customers. Published products appear in the store.
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Features Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Key Features</label>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, showFeatures: !formData.showFeatures})}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.showFeatures 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {formData.showFeatures ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                
                {formData.showFeatures && (
                  <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...formData.features]
                            newFeatures[index] = e.target.value
                            setFormData({...formData, features: newFeatures})
                          }}
                          placeholder={`Feature ${index + 1}`}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFeatures = formData.features.filter((_, i) => i !== index)
                            setFormData({...formData, features: newFeatures})
                          }}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, features: [...formData.features, '']})}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </button>
                  </div>
                )}
              </div>

              {/* Specifications Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Specifications</label>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, showSpecifications: !formData.showSpecifications})}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.showSpecifications 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {formData.showSpecifications ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                
                {formData.showSpecifications && (
                  <div className="space-y-3">
                    {Object.entries(formData.specifications).map(([key, value], index) => (
                      <div key={index} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newSpecs = {...formData.specifications}
                            delete newSpecs[key]
                            newSpecs[e.target.value] = value
                            setFormData({...formData, specifications: newSpecs})
                          }}
                          placeholder="Specification name"
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const newSpecs = {...formData.specifications}
                              newSpecs[key] = e.target.value
                              setFormData({...formData, specifications: newSpecs})
                            }}
                            placeholder="Value"
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newSpecs = {...formData.specifications}
                              delete newSpecs[key]
                              setFormData({...formData, specifications: newSpecs})
                            }}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newSpecs = {...formData.specifications}
                        newSpecs[`New Spec ${Object.keys(formData.specifications).length + 1}`] = ''
                        setFormData({...formData, specifications: newSpecs})
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Specification
                    </button>
                  </div>
                )}
              </div>
              
              {/* Colors Section - Stock is managed per color */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Product Colors & Stock *</label>
                  <span className="text-red-400 text-xs">Required</span>
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-400 mb-3">
                    💡 At least one color with stock quantity is required. Stock is managed per color.
                  </div>
                  {formData.colors.map((color, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => {
                          const newColors = [...formData.colors]
                          newColors[index].name = e.target.value
                          setFormData({...formData, colors: newColors})
                        }}
                        placeholder="Color name"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="number"
                        value={color.stock}
                        onChange={(e) => {
                          const newColors = [...formData.colors]
                          newColors[index].stock = parseInt(e.target.value) || 0
                          newColors[index].inStock = (parseInt(e.target.value) || 0) > 0
                          setFormData({...formData, colors: newColors})
                        }}
                        placeholder="Stock quantity"
                        min="0"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newColors = formData.colors.filter((_, i) => i !== index)
                          setFormData({...formData, colors: newColors})
                        }}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, colors: [...formData.colors, { name: '', stock: 0, inStock: true }]})}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Color
                  </button>
                </div>
              </div>
              
              {/* Image Management Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Product Images</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Images
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Image Gallery */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                        draggedIndex === index ? 'border-amber-400 bg-amber-400/20' : 'border-gray-600'
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                    >
                      {image ? (
                        <>
                          <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center">
                            <div className="opacity-0 hover:opacity-100 transition-opacity flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleImageRemove(index)}
                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                                title="Remove Image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="bg-gray-700 text-white p-1 rounded-full cursor-move" title="Drag to reorder">
                                <Move className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">
                              Main
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-400 mt-2">
                  Drag images to reorder. The first image will be the main product image.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isSubmitting 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Product</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleEditProduct(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  >
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Price field removed - calculated automatically from original price and discount */}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Original Price (AED)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                
                 
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Features Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Key Features</label>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, showFeatures: !formData.showFeatures})}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.showFeatures 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {formData.showFeatures ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                
                {formData.showFeatures && (
                  <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...formData.features]
                            newFeatures[index] = e.target.value
                            setFormData({...formData, features: newFeatures})
                          }}
                          placeholder={`Feature ${index + 1}`}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFeatures = formData.features.filter((_, i) => i !== index)
                            setFormData({...formData, features: newFeatures})
                          }}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, features: [...formData.features, '']})}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </button>
                  </div>
                )}
              </div>

              {/* Specifications Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Specifications</label>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, showSpecifications: !formData.showSpecifications})}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.showSpecifications 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {formData.showSpecifications ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                
                {formData.showSpecifications && (
                  <div className="space-y-3">
                    {Object.entries(formData.specifications).map(([key, value], index) => (
                      <div key={index} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newSpecs = {...formData.specifications}
                            delete newSpecs[key]
                            newSpecs[e.target.value] = value
                            setFormData({...formData, specifications: newSpecs})
                          }}
                          placeholder="Specification name"
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const newSpecs = {...formData.specifications}
                              newSpecs[key] = e.target.value
                              setFormData({...formData, specifications: newSpecs})
                            }}
                            placeholder="Value"
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newSpecs = {...formData.specifications}
                              delete newSpecs[key]
                              setFormData({...formData, specifications: newSpecs})
                            }}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newSpecs = {...formData.specifications}
                        newSpecs[`New Spec ${Object.keys(formData.specifications).length + 1}`] = ''
                        setFormData({...formData, specifications: newSpecs})
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Specification
                    </button>
                  </div>
                )}
              </div>
              
              {/* Colors Section - Stock is managed per color */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Product Colors & Stock *</label>
                  <span className="text-red-400 text-xs">Required</span>
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-400 mb-3">
                    💡 At least one color with stock quantity is required. Stock is managed per color.
                  </div>
                  {formData.colors.map((color, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => {
                          const newColors = [...formData.colors]
                          newColors[index].name = e.target.value
                          setFormData({...formData, colors: newColors})
                        }}
                        placeholder="Color name"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="number"
                        value={color.stock}
                        onChange={(e) => {
                          const newColors = [...formData.colors]
                          newColors[index].stock = parseInt(e.target.value) || 0
                          newColors[index].inStock = (parseInt(e.target.value) || 0) > 0
                          setFormData({...formData, colors: newColors})
                        }}
                        placeholder="Stock quantity"
                        min="0"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newColors = formData.colors.filter((_, i) => i !== index)
                          setFormData({...formData, colors: newColors})
                        }}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, colors: [...formData.colors, { name: '', stock: 0, inStock: true }]})}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Color
                  </button>
                </div>
              </div>
              
              {/* Image Management Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Product Images</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Images
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Image Gallery */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                        draggedIndex === index ? 'border-amber-400 bg-amber-400/20' : 'border-gray-600'
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                    >
                      {image ? (
                        <>
                          <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center">
                            <div className="opacity-0 hover:opacity-100 transition-opacity flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleImageRemove(index)}
                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                                title="Remove Image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="bg-gray-700 text-white p-1 rounded-full cursor-move" title="Drag to reorder">
                                <Move className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">
                              Main
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-400 mt-2">
                  Drag images to reorder. The first image will be the main product image.
                </p>
              </div>
              
              {/* Status Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'draft' | 'published'})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Draft products are not visible to customers. Published products appear in the store.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {isImageModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Product Images - {selectedProduct.name}</h2>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Image */}
              <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                {selectedProduct.images && selectedProduct.images[selectedImageIndex] ? (
                  <Image
                    src={selectedProduct.images[selectedImageIndex]}
                    alt={`${selectedProduct.name} ${selectedImageIndex + 1}`}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-16 h-16 text-gray-500" />
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">All Images ({selectedProduct.images?.length || 0})</h3>
                <div className="grid grid-cols-4 gap-3">
                  {selectedProduct.images?.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index ? 'border-amber-400' : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-gray-400">
                  <p>Image {selectedImageIndex + 1} of {selectedProduct.images?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Edit Modal */}
      {isOrderEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Order - {selectedOrder.orderNumber}</h2>
              <button
                onClick={() => setIsOrderEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleOrderEdit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order Status</label>
                  <select
                    value={orderEditForm.status}
                    onChange={(e) => setOrderEditForm({...orderEditForm, status: e.target.value as Order['status']})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Status</label>
                  <select
                    value={orderEditForm.paymentStatus}
                    onChange={(e) => setOrderEditForm({...orderEditForm, paymentStatus: e.target.value as Order['paymentStatus']})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={orderEditForm.trackingNumber}
                  onChange={(e) => setOrderEditForm({...orderEditForm, trackingNumber: e.target.value})}
                  placeholder="Enter tracking number"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={orderEditForm.notes}
                  onChange={(e) => setOrderEditForm({...orderEditForm, notes: e.target.value})}
                  rows={3}
                  placeholder="Add order notes..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Order Details Summary */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Customer:</span>
                    <div className="text-white">{selectedOrder.customerName}</div>
                    <div className="text-gray-300">{selectedOrder.customerEmail}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Amount:</span>
                    <div className="text-white font-semibold">AED {selectedOrder.totalAmount}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Items:</span>
                    <div className="text-white">{selectedOrder.items.length} items</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Order Date:</span>
                    <div className="text-white">{new Date(selectedOrder.orderDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsOrderEditModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Edit Modal */}
      {isCustomerEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Customer</h2>
              <button
                onClick={() => setIsCustomerEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCustomerEdit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={customerEditForm.name}
                    onChange={(e) => setCustomerEditForm({...customerEditForm, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={customerEditForm.email}
                    onChange={(e) => setCustomerEditForm({...customerEditForm, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={customerEditForm.phone}
                    onChange={(e) => setCustomerEditForm({...customerEditForm, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={customerEditForm.status}
                    onChange={(e) => setCustomerEditForm({...customerEditForm, status: e.target.value as Customer['status']})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <textarea
                  value={customerEditForm.address}
                  onChange={(e) => setCustomerEditForm({...customerEditForm, address: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Customer Details Summary */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Customer Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total Orders:</span>
                    <div className="text-white font-semibold">{selectedCustomer.totalOrders}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Spent:</span>
                    <div className="text-white font-semibold">AED {selectedCustomer.totalSpent.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Join Date:</span>
                    <div className="text-white">{new Date(selectedCustomer.joinDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCustomerEditModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
} 