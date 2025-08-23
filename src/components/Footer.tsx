import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full relative z-10">
    

      {/* Social Icons */}
      <div className="w-full flex justify-end mt-4 sm:mt-6 px-4 sm:px-6 lg:px-8 space-x-2 sm:space-x-3 pb-4">
      <Link href="https://www.facebook.com/share/16sLXPWxtp/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors">
      <FaFacebookF className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </Link>
       
        {/* <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors">
          <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button> */}
        <Link href="https://www.instagram.com/tech.ssouquae?utm_source=qr&igsh=MTZ4MG0xeGg3Yjl1Yg==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors">
          <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </Link>
        <Link
          href="https://wa.me/971508024236"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
        >
          <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </Link>
      </div>
    </footer>
  )
} 