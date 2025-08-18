'use client'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    id: 1,
    question: "What makes GADZOO products different?",
    answer: "Our products are designed with cutting-edge technology and premium materials to provide an exceptional user experience. Each gadget is carefully crafted to redefine how you interact with technology."
  },
  {
    id: 2,
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to most countries worldwide. Shipping times and costs vary by location. You can check shipping options during checkout."
  },
  {
    id: 3,
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all products in their original condition. If you're not satisfied with your purchase, you can return it for a full refund."
  },
  {
    id: 4,
    question: "Are your products covered by warranty?",
    answer: "All our products come with a minimum 1-year warranty. Premium products may have extended warranty options available."
  },
  {
    id: 5,
    question: "How can I contact customer support?",
    answer: "You can reach our customer support team through email at support@gadzoo.com or through our contact form. We typically respond within 24 hours."
  }
]

function FAQItem({ faq }: { faq: typeof faqs[0] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-600">
      <button
        className="w-full py-4 px-6 text-left flex justify-between items-center text-white hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{faq.question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQSection() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {faqs.map((faq) => (
          <FAQItem key={faq.id} faq={faq} />
        ))}
      </div>
    </div>
  )
} 