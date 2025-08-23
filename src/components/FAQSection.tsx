'use client'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    id: 1,
    question: "What is Techssouq?",
    answer: "Techssouq is an online marketplace in the UAE where you can buy phones, watches, perfumes, and other electronics – both new and second-hand."
  },
  {
    id: 2,
    question: "Where does Techssouq operate?",
    answer: "We currently operate only within the UAE."
  },
  {
    id: 3,
    question: "How can I pay for my order?",
    answer: "We only offer Cash on Delivery (COD). You can pay after checking your product, giving you complete peace of mind."
  },
  {
    id: 4,
    question: "Do you sell both new and used products?",
    answer: "Yes, we sell both new and used products. All our items go through quality checks to ensure they meet high standards, so whether new or pre-owned, you can shop with confidence."
  },
  {
    id: 5,
    question: "How fast is the delivery?",
    answer: "We provide fast and reliable delivery across the UAE."
  },
  {
    id: 6,
    question: "Can I check the product before paying?",
    answer: "Absolutely ✅. With Techssouq, you only pay once you’ve checked and are satisfied with your order"
  },
  {
    id: 7,
    question: "Why is there no return policy?",
    answer: "Since Techssouq allows you to inspect and check the product before making payment, returns are not required. This way, you are fully satisfied before completing your purchase."
  },
  {
    id: 8,
    question: "How can I contact Techssouq?",
    answer: "You can reach us anytime via: techssouquae@gmail.com"
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