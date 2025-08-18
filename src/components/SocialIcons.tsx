import { Facebook, Twitter, Instagram } from 'lucide-react'

export default function SocialIcons() {
  return (
    <div className="w-full flex justify-end mt-4 sm:mt-6 px-4 sm:px-6 lg:px-8 space-x-2 sm:space-x-3">
      <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors">
        <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>
      <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors">
        <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>
      <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors">
        <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>
    </div>
  )
} 