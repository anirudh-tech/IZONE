'use client'

import { ShoppingCart, User, Heart, MapPin, LogOut, Shield, Package, Menu, X, Search, Sun, Moon, Laptop } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useToast } from '@/contexts/ToastContext'

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, signOut, loading, initialized } = useAuth()
  const { cartItemCount } = useCart()
  const { favoritesCount } = useFavorites()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { showToast } = useToast()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const adminEmail=process.env.NEXT_PUBLIC_ADMIN_EMAIL

  const handleSignOut = async () => {
    if (isSigningOut) return // Prevent multiple logout attempts
    
    try {
      setIsSigningOut(true)
      setIsUserMenuOpen(false)
      await signOut()
      
      // Redirect to home page after successful logout
      router.push('/')
      
    } catch (error) {
      console.error('Logout error:', error)
      showToast('Logout failed. Please try again.', 'error')
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleSearchSubmit = () => {
    const query = searchQuery.trim()
    if (!query) return
    router.push(`/shop?q=${encodeURIComponent(query)}`)
    setIsMobileMenuOpen(false)
  }

  const getUserDisplayName = () => {
    if (!user) return 'User'
    
    // First, try to get names from user metadata
    const firstName = user.user_metadata?.first_name
    const lastName = user.user_metadata?.last_name
    
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim()
    }
    
    // Fallback: extract from email
    if (user.email) {
      const localPart = user.email.split('@')[0]
      const cleanedName = localPart
        .replace(/[0-9]+/g, '') // Remove numbers
        .replace(/[._-]+/g, ' ') // Replace separators with spaces
        .trim()
      
      const words = cleanedName.split(' ').filter(word => word.length > 0)
      if (words.length > 0) {
        const capitalizedFirst = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase()
        return capitalizedFirst
      }
    }
    
    return 'User'
  }

  // Close menus when user changes
  useEffect(() => {
    if (!user) {
      setIsUserMenuOpen(false)
      setIsMobileMenuOpen(false)
    }
  }, [user])

  // Don't render auth-dependent UI until we're initialized
  const shouldShowAuthUI = initialized && !loading

  return (
    <header className={"bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="hidden lg:block flex items-center">
            <Link href="/" className="flex items-center space-x-2 group mr-10">
              <div className={"hidden sm:block logo-tile bg-gray-400 rounded-lg p-0.5"}>
                <img src="/Logo.png" alt="logo" className="sm:w-25 w-10" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/shop" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Shop
            </Link>
            <Link 
              href="/faq" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              FAQ
            </Link>
            {user&&user?.email === adminEmail && (
            <Link 
              href="/admin" 
              className="text-red-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Admin
            </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                onClick={handleSearchSubmit}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative group">
              <ShoppingCart className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Favorites Icon */}
            <Link href="/favorites" className="relative group">
              <Heart className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Section - Only show when initialized */}
            {shouldShowAuthUI ? (
              user ? (
                /* User Menu */
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-300 group flex items-center gap-2"
                  >
                    <User className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                    <span className="hidden md:block text-sm text-gray-300 group-hover:text-white">
                      {getUserDisplayName()}
                    </span>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50 animate-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">
                          Welcome back, {getUserDisplayName()}!
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      {/* Theme selector */}
                      <div className="px-4 py-3">
                        <p className="text-xs text-gray-400 mb-2">Appearance</p>
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => setTheme('system')}
                            className={`flex cursor-pointer w-full items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors hover:bg-gray-700 ${theme === 'system' ? 'text-amber-400' : 'text-gray-300'}`}
                          >
                            <Laptop className="w-4 h-4" /> Default (System)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTheme('light')}
                            className={`flex cursor-pointer w-full items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors hover:bg-gray-700 ${theme === 'light' ? 'text-amber-400' : 'text-gray-300'}`}
                          >
                            <Sun className="w-4 h-4" /> Light
                          </button>
                          <button
                            type="button"
                            onClick={() => setTheme('dark')}
                            className={`flex cursor-pointer w-full items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors hover:bg-gray-700 ${theme === 'dark' ? 'text-amber-400' : 'text-gray-300'}`}
                          >
                            <Moon className="w-4 h-4" /> Dark
                          </button>
                        </div>
                      </div>
                      
                      <Link 
                        href="/profile" 
                        className="flex cursor-pointer items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        My Profile
                      </Link>
                      <Link 
                        href="/orders" 
                        className="flex cursor-pointer items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-3" />
                        My Orders
                      </Link>
                      <Link 
                        href="/address" 
                        className="flex cursor-pointer items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <MapPin className="w-4 h-4 mr-3" />
                        Manage Address
                      </Link>
                      
                      <div className="border-t border-gray-700 my-2"></div>
                      
                      <button 
                        className="flex cursor-pointer items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {isSigningOut ? 'Signing out...' : 'Logout'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Sign In/Up Buttons */
                <div className="flex items-center space-x-2">
                  <Link
                    href="/sign-in"
                    className="px-4 cursor-pointer py-2 text-gray-300 hover:text-white font-medium transition-all duration-300 hover:bg-gray-700 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-4 cursor-pointer py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )
            ) : (
              /* Loading state for auth */
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-amber-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 relative z-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                onClick={handleSearchSubmit}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-700 pt-4 relative z-50">
            <div className="space-y-2">
              <Link 
                href="/" 
                className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
               
              >
                Home
              </Link>
              <Link 
                href="/shop" 
                className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
               
              >
                Shop
              </Link>
              <Link 
                href="/faq" 
                className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
               
              >
                FAQ
              </Link>
              {user&&user?.email === adminEmail && (
              <Link 
                href="/admin" 
                className="block text-red-500 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
               
              >
                Admin
              </Link>
              )}
              
           
             
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay to close menus when clicking outside */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setIsUserMenuOpen(false)
            setIsMobileMenuOpen(false)
          }}
        />
      )}
    </header>
  )
} 