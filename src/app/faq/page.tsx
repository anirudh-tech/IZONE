'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Loader2, HelpCircle, ChevronDown, ChevronUp, Search, Filter, Home, Package, Truck, CheckCircle, AlertCircle } from 'lucide-react'
import FAQSection from '@/components/FAQSection'
import AedIcon from '@/components/AedIcon'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-gray-800 to-transparent opacity-50"></div>
          <div className="absolute right-0 top-0 w-1/4 h-full bg-gradient-to-l from-gray-800 to-transparent opacity-50"></div>
        </div>
        
        {/* Main content container - Full width */}
        <div className="relative z-10 w-full">
          <Header />
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 min-h-[600px] p-8">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h1>
            <FAQSection />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
} 