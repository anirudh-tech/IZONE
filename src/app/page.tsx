'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useToast } from '@/contexts/ToastContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import ProductGrid from '@/components/ProductGrid'
import FAQSection from '@/components/FAQSection'
import CookieBanner from '@/components/CookieBanner'
import { Loader2, Package, Truck, CheckCircle, AlertCircle, Star, Heart, ShoppingCart } from 'lucide-react'
import { productsApi, Product } from '@/lib/api'
import AedIcon from '@/components/AedIcon'

export default function Home() {



  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 fixed inset-0">
      <div className="relative h-full overflow-y-auto">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-gray-800 to-transparent opacity-50"></div>
          <div className="absolute right-0 top-0 w-1/4 h-full bg-gradient-to-l from-gray-800 to-transparent opacity-50"></div>
        </div>
        
        {/* Main content container - Full width */}
        <div className="relative z-10 w-full">
          <Header />
          <Hero />
          <Footer />
        </div>
      </div>
    </div>
  )
}
