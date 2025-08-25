'use client'

import { useState, useEffect } from 'react'
import { Star, Heart, Check, Filter, SortAsc, SortDesc, Trash2 } from 'lucide-react'
import { reviewsApi, Review } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
const adminEmail=process.env.NEXT_PUBLIC_ADMIN_EMAIL

interface ReviewsDisplayProps {
  productId: string
  onReviewSubmitted?: (review: Review) => void
  onReviewUpdated?: (review: Review) => void
  onReviewDeleted?: () => void
}

export default function ReviewsDisplay({
  productId,
  onReviewSubmitted,
  onReviewUpdated,
  onReviewDeleted
}: ReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewFilter, setReviewFilter] = useState('all')
  const [reviewSort, setReviewSort] = useState('newest')
  const { user } = useAuth()

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const fetchedReviews = await reviewsApi.getAll({ productId })
      setReviews(fetchedReviews)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch reviews'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const handleLike = async (reviewId: string) => {
    // Require auth to toggle like state
    if (!user?.id) return

    // Optimistic UI update
    const previous = [...reviews]
    setReviews(prev => prev.map(r => {
      if (r._id !== reviewId) return r
      const alreadyLiked = (r.likedBy || []).includes(user.id)
      const nextLikedBy = alreadyLiked
        ? (r.likedBy || []).filter(uid => uid !== user.id)
        : [ ...(r.likedBy || []), user.id ]
      const nextHelpful = Math.max(0, (r.helpful || 0) + (alreadyLiked ? -1 : 1))
      return { ...r, likedBy: nextLikedBy, helpful: nextHelpful }
    }))

    try {
      const updated = await reviewsApi.like(reviewId, user.id)
      setReviews(prev => prev.map(r => {
        if (r._id !== reviewId) return r
        // Merge server response with optimistic state to preserve likedBy when API omits it
        return {
          ...r,
          ...updated,
          likedBy: (updated as any).likedBy ?? r.likedBy,
        }
      }))
    } catch (error: unknown) {
      // Revert on failure
      setReviews(previous)
      const message = error instanceof Error ? error.message : 'Failed to like review'
      setError(message)
    }
  }

  const handleAdminDelete = async (reviewId: string) => {
    if (!(user?.email === 'techssouquae@gmail.com')) return
    try {
      await reviewsApi.delete(reviewId)
      setReviews(prev => prev.filter(r => r._id !== reviewId))
      onReviewDeleted?.()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete review'
      setError(message)
    }
  }

  const getFilteredAndSortedReviews = () => {
    let filteredReviews = [...reviews]

    // Apply filter
    if (reviewFilter !== 'all') {
      const rating = parseInt(reviewFilter)
      filteredReviews = filteredReviews.filter(review => review.rating === rating)
    }

    // Apply sorting
    switch (reviewSort) {
      case 'newest':
        filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filteredReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'helpful':
        filteredReviews.sort((a, b) => b.helpful - a.helpful)
        break
      default:
        break
    }

    return filteredReviews
  }

  const filteredReviews = getFilteredAndSortedReviews()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-8 bg-red-900/20 border border-red-500/30 rounded-lg">
        {error}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-lg">No reviews yet</p>
        <p className="text-gray-500 text-sm mt-2">Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex lg:flex-row flex-col items-center justify-between mb-8  gap-4 sm:flex-col xs:flex-col">
        <h3 className="text-xl font-bold text-white">
          Customer Reviews ({reviews.length})
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All Reviews</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {reviewSort === 'newest' ? (
              <SortDesc className="w-4 h-4 text-gray-400" />
            ) : reviewSort === 'oldest' ? (
              <SortAsc className="w-4 h-4 text-gray-400" />
            ) : (
              <SortDesc className="w-4 h-4 text-gray-400" />
            )}
            <select
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div key={review._id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-white">{review.customerName}</span>
                  {review.isVerified && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-gray-400 text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLike(review._id)}
                  className="text-gray-400 hover:text-amber-400 transition-colors"
                  title="Like this review"
                >
                  <Heart
                    className={`w-4 h-4 ${user && review.likedBy?.includes(user.id) ? 'text-red-500' : ''}`}
                    fill={user && review.likedBy?.includes(user.id) ? 'currentColor' : 'none'}
                  />
                </button>
                {user?.email === adminEmail && (
                  <button
                    onClick={() => handleAdminDelete(review._id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <h4 className="font-semibold text-white mb-2">{review.title}</h4>
            <p className="text-gray-300 mb-4">{review.comment}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <button
                onClick={() => handleLike(review._id)}
                className="flex items-center gap-1 hover:text-amber-400 transition-colors"
                title="Mark as helpful"
              >
                <Check className="w-4 h-4" />
                Helpful ({review.helpful})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 