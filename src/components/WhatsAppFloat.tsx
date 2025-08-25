'use client'

import { useState, useEffect } from 'react'

interface WhatsAppFloatProps {
  phoneNumber: string // WhatsApp number with country code (e.g., "971501234567")
  message?: string // Default message
  position?: 'bottom-right' | 'bottom-left'
  showOnMobile?: boolean
}

export default function WhatsAppFloat({ 
  phoneNumber, 
  message = "Hello! I'm interested in your products.", 
  position = 'bottom-right',
  showOnMobile = true 
}: WhatsAppFloatProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showBubble, setShowBubble] = useState(true)

  useEffect(() => {
    // Check if device is mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)

    // Check localStorage for bubble preference
    const bubbleClosed = localStorage.getItem('whatsapp-bubble-closed')
    if (bubbleClosed === 'true') {
      setShowBubble(false)
    }

    // Show the button after a delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => {
      window.removeEventListener('resize', checkIfMobile)
      clearTimeout(timer)
    }
  }, [])

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCloseBubble = () => {
    setShowBubble(false)
    localStorage.setItem('whatsapp-bubble-closed', 'true')
  }

  // Only show on mobile if showOnMobile is true, or always show if showOnMobile is false
  if (showOnMobile && !isMobile) return null

  if (!isVisible) return null

  return (
    <>
      {/* WhatsApp Float Button */}
      <div
        className={`
          fixed z-50 transition-all duration-500 ease-in-out opacity-100 translate-y-0
          ${position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'}
        `}
      >
        {/* Main WhatsApp Button */}
        {!showBubble && (
        <button
          onClick={handleWhatsAppClick}
          className="group relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          aria-label="Contact us on WhatsApp"
        >
          {/* WhatsApp Icon */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="transition-transform group-hover:scale-110"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
          </svg>

          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></div>
        </button>
        )}
        {/* Single-line pill bubble with message - only show if showBubble is true */}
        {showBubble && (
          <div
            className={`absolute bottom-16 ${position === 'bottom-right' ? 'right-0' : 'left-0'}`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={handleWhatsAppClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleWhatsAppClick() } }}
              className="relative flex items-center gap-2 rounded-full px-4 py-2 shadow-xl cursor-pointer whitespace-nowrap outline-none focus:ring-2 focus:ring-white/60"
              style={{ background: 'linear-gradient(135deg, #25d366 0%, #20b658 100%)' }}
            >
              <div className="bg-white rounded-full p-1 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
                </svg>
              </div>
              <span className="text-white text-sm font-semibold">How can I help you?</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleCloseBubble() }}
                className="ml-2 bg-white/20 hover:bg-white/30 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                aria-label="Close message"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

    </>
  )
}
