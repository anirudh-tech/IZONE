'use client'

import { ShoppingCart, User, Heart, MapPin, Settings, LogOut, Shield, Package, Menu, X, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
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
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group mr-10">
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  IZONE
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              HOME
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/shop" 
              className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              OUR SHOP
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/faq" 
              className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              FAQ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/admin" 
              className="text-red-400 hover:text-red-300 font-medium transition-all duration-300 hover:scale-105 flex items-center gap-1 relative group"
            >
              <Shield className="w-4 h-4" />
              ADMIN
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Shop Now Button */}
            <Link 
              href="/shop" 
              className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
            >
              SHOP NOW
            </Link>

            {/* Favorites */}
            <Link 
              href="/favorites" 
              className="relative p-2 hover:bg-gray-700 rounded-lg transition-all duration-300 group"
            >
              <Heart className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                4
              </span>
            </Link>

            {/* Cart */}
            <Link 
              href="/cart" 
              className="relative p-2 hover:bg-gray-700 rounded-lg transition-all duration-300 group"
            >
              <ShoppingCart className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                3
              </span>
            </Link>
            
            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-300 group"
              >
                <User className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              </button>
              
              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50 animate-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">Welcome back!</p>
                    <p className="text-xs text-gray-400">Manage your account</p>
                  </div>
                  
                  <Link 
                    href="/profile" 
                    className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    My Profile
                  </Link>
                  <Link 
                    href="/orders" 
                    className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Package className="w-4 h-4 mr-3" />
                    My Orders
                  </Link>
                  <Link 
                    href="/address" 
                    className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <MapPin className="w-4 h-4 mr-3" />
                    Manage Address
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  
                  <div className="border-t border-gray-700 my-2"></div>
                  
                  <button 
                    className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      // Handle logout logic here
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-xl">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link 
                  href="/" 
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  HOME
                </Link>
                <Link 
                  href="/shop" 
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  OUR SHOP
                </Link>
                <Link 
                  href="/faq" 
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link 
                  href="/admin" 
                  className="block px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  ADMIN
                </Link>
              </nav>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <Link 
                  href="/shop" 
                  className="flex-1 mr-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg text-center transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  SHOP NOW
                </Link>
                <div className="flex space-x-2">
                  <Link 
                    href="/favorites" 
                    className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5 text-gray-300" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      4
                    </span>
                  </Link>
                  <Link 
                    href="/cart" 
                    className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-300" />
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      3
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay to close menus when clicking outside */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsUserMenuOpen(false)
            setIsMobileMenuOpen(false)
          }}
        />
      )}
    </header>
  )
} 