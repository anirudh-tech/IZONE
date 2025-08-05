'use client'

import { useState, useEffect } from 'react'
import { productsApi, Product } from '@/lib/api'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    image: '',
    discount: '',
    description: '',
    category: '',
    inStock: true
  })

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productsApi.getAll()
      setProducts(data)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form submission started")
    e.preventDefault()
    if (submitting) return // Prevent multiple submissions
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Product name is required')
      return
    }
    if (!formData.price.trim()) {
      setError('Price is required')
      return
    }
    if (!formData.originalPrice.trim()) {
      setError('Original price is required')
      return
    }
    if (!formData.image.trim()) {
      setError('Image URL is required')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      
      console.log("Form submission started")
      console.log("Form data:", formData)
      console.log("Editing product:", editingProduct)
      
      // Format data for API
      const apiData = {
        name: formData.name,
        price: `AED ${formData.price}`,
        originalPrice: `AED ${formData.originalPrice}`,
        image: formData.image,
        discount: `${formData.discount}% OFF`,
        description: formData.description,
        category: formData.category,
        inStock: formData.inStock
      }
      
      if (editingProduct) {
        console.log("Updating product with ID:", editingProduct._id)
        const result = await productsApi.update(editingProduct._id, apiData)
        console.log("Update result:", result)
      } else {
        console.log("Creating new product")
        const result = await productsApi.create(apiData)
        console.log("Create result:", result)
      }
      
      console.log("API call successful")
      setShowForm(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (err) {
      console.error('Error saving product:', err)
      setError(`Failed to save product: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsApi.delete(id)
        fetchProducts()
      } catch (err) {
        console.error('Error deleting product:', err)
        setError('Failed to delete product')
      }
    }
  }

  // Handle edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.replace(/[^\d]/g, ''), // Extract numeric value from "AED 1,099"
      originalPrice: product.originalPrice.replace(/[^\d]/g, ''), // Extract numeric value from "AED 1,499"
      image: product.image,
      discount: product.discount.replace(/[^\d]/g, ''), // Extract numeric value from "25% OFF"
      description: product.description || '',
      category: product.category || '',
      inStock: product.inStock !== false
    })
    setShowForm(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      image: '',
      discount: '',
      description: '',
      category: '',
      inStock: true
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <div className="flex gap-4">
            <button
              onClick={async () => {
                try {
                  console.log('Testing API connection...')
                  const result = await productsApi.getAll()
                  console.log('API test successful:', result)
                  alert('API connection working! Found ' + result.length + ' products')
                } catch (err) {
                  console.error('API test failed:', err)
                  alert('API test failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test API
            </button>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingProduct(null)
                resetForm()
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add New Product
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Product Form */}
        {showForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="AED 1,099"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Original Price</label>
                <input
                  type="text"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="AED 1,499"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="https://example.com/image.jpg or /product-image.png"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount</label>
                <input
                  type="text"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="25% OFF"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Smartphones"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-20"
                  placeholder="Product description..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                    className="mr-2"
                  />
                  In Stock
                </label>
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    submitting 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  } text-white`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingProduct ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingProduct ? 'Update Product' : 'Add Product'
                  )}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowForm(false)
                    setEditingProduct(null)
                    resetForm()
                  }}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    submitting 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  } text-white`}
                >
                  Cancelllll
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
            <span className="ml-2">Loading products...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Price:</span> {product.price}</p>
                  <p><span className="text-gray-400">Original:</span> {product.originalPrice}</p>
                  <p><span className="text-gray-400">Discount:</span> {product.discount}</p>
                  {product.category && (
                    <p><span className="text-gray-400">Category:</span> {product.category}</p>
                  )}
                  <p><span className="text-gray-400">Stock:</span> {product.inStock ? 'In Stock' : 'Out of Stock'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 