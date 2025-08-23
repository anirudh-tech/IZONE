import { ChevronDown } from 'lucide-react'

export default function CookieBanner() {
  return (
    <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm border-t border-gray-700">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left side - Scroll down */}
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="text-sm">Scroll down</span>
          <ChevronDown className="w-4 h-4" />
        </div>

        {/* Center - Cookie text */}
        <div className="flex-1 max-w-2xl mx-8">
          <p className="text-sm text-gray-300 leading-relaxed">
            We use cookies to enhance your experience on our website. Cookies help us understand your preferences and provide you with tailored content and ads. By continuing to browse our site, you agree to our use of cookies.
          </p>
        </div>

        {/* Right side - Buttons */}
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors">
            Decline
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
} 