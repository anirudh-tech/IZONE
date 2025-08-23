'use client'

import { useState, useEffect } from 'react'
import { Star, Send, Edit3, Trash2 } from 'lucide-react'
import { reviewsApi, Review } from '@/lib/api'

interface ReviewFormProps {
  productId: string
  orderId: string
  customerId: string
  customerName: string
  customerEmail: string
  existingReview?: Review
  onReviewSubmitted?: (review: Review) => void
  onReviewUpdated?: (review: Review) => void
  onReviewDeleted?: () => void
}

export default function ReviewForm({
  productId,
  orderId,
  customerId,
  customerName,
  customerEmail,
  existingReview,
  onReviewSubmitted,
  onReviewUpdated,
  onReviewDeleted
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [title, setTitle] = useState(existingReview?.title || '')
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    
    if (!title.trim()) {
      setError('Please enter a review title')
      return
    }
    
    if (!comment.trim()) {
      setError('Please enter a review comment')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      if (existingReview && isEditing) {
        // Update existing review
        const updatedReview = await reviewsApi.update(existingReview._id, {
          rating,
          title: title.trim(),
          comment: comment.trim()
        })
        onReviewUpdated?.(updatedReview)
        setIsEditing(false)
      } else {
        // Create new review
        const newReview = await reviewsApi.create({
          productId,
          orderId,
          customerId,
          customerName,
          customerEmail,
          rating,
          title: title.trim(),
          comment: comment.trim()
        })
        onReviewSubmitted?.(newReview)
        // Reset form
        setRating(0)
        setTitle('')
        setComment('')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingReview) return
    
    if (!confirm('Are you sure you want to delete this review?')) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      await reviewsApi.delete(existingReview._id)
      onReviewDeleted?.()
      // Reset form
      setRating(0)
      setTitle('')
      setComment('')
    } catch (error: any) {
      setError(error.message || 'Failed to delete review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setRating(existingReview?.rating || 0)
    setTitle(existingReview?.title || '')
    setComment(existingReview?.comment || '')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setRating(existingReview?.rating || 0)
    setTitle(existingReview?.title || '')
    setComment(existingReview?.comment || '')
    setError('')
  }

  // If there's an existing review and we're not editing, show the review
  if (existingReview && !isEditing) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-white">{existingReview.customerName}</span>
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                Verified
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < existingReview.rating ? 'text-amber-400 fill-current' : 'text-gray-600'
                  }`}
                />
              ))}
              <span className="text-gray-400 text-sm">
                {new Date(existingReview.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="text-gray-400 hover:text-amber-400 transition-colors p-1"
              title="Edit review"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <h4 className="font-semibold text-white mb-2">{existingReview.title}</h4>
        <p className="text-gray-300">{existingReview.comment}</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rating *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating ? 'text-amber-400 fill-current' : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
            <span className="text-gray-400 ml-2">{rating}/5</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
            placeholder="Summarize your experience"
            maxLength={100}
            required
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
            Review Comment *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none resize-none"
            placeholder="Share your detailed experience with this product..."
            maxLength={1000}
            required
          />
          <div className="text-right text-sm text-gray-400 mt-1">
            {comment.length}/1000
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {existingReview ? 'Update Review' : 'Submit Review'}
          </button>
          
          {existingReview && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
} 