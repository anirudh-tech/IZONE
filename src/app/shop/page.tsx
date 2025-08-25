'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useToast } from '@/contexts/ToastContext'
import Header from '@/components/Header'
import CookieBanner from '@/components/CookieBanner'
import ProductGrid from '@/components/ProductGrid'
import ProductList from '@/components/ProductList'
import Footer from '@/components/Footer'
import { Search, Filter, Grid, List } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { categoriesApi, Category } from '@/lib/api'

function ShopContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [priceRange, setPriceRange] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [categories, setCategories] = useState<string[]>(['All'])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const apiCategories = await categoriesApi.getAll()
        const names = apiCategories.filter(c => c.isActive).map(c => c.name)
        setCategories(['All', ...names])
      } catch (e) {
        // keep default ['All'] on failure
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Sync search input with `q` query param
  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearchQuery(q)
    setCurrentPage(1)
  }, [searchParams])
  const priceRanges = ['All', 'Under AED 500', 'AED 500 - AED 1,000', 'AED 1,000 - AED 2,000', 'Over AED 2,000']

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-gray-800 to-transparent opacity-50"></div>
          <div className="absolute right-0 top-0 w-1/4 h-full bg-gradient-to-l from-gray-800 to-transparent opacity-50"></div>
        </div>
        
        {/* Main content container - Full width like home page */}
        <div className="relative z-10 w-full">
          <Header />
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 min-h-[600px] p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8 text-center">Our Shop</h1>
              
              {/* Search and Filters */}
              <div className="mb-8 space-y-6">
                {/* Search Bar */}
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none placeholder-gray-400"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
                      disabled={loadingCategories}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      {loadingCategories && <option>Loading...</option>}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Price:</span>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
                    >
                      {priceRanges.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">View:</span>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                      }`}
                      title="List View"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Display */}
              {viewMode === 'grid' ? (
                <ProductGrid
                  currentPage={currentPage}
                  itemsPerPage={8}
                  onPageChange={handlePageChange}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  priceRange={priceRange}
                />
              ) : (
                <ProductList
                  currentPage={currentPage}
                  itemsPerPage={8}
                  onPageChange={handlePageChange}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  priceRange={priceRange}
                />
              )}
            </div>
          </div>
          
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="relative">
            <div className="relative z-10 w-full">
              <Header />
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 min-h-[400px] p-8">
                <div className="max-w-6xl mx-auto">
                  <h1 className="text-3xl font-bold text-white mb-4 text-center">Loading shop…</h1>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  </div>
                </div>
              </div>
              <Footer />
            </div>
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}