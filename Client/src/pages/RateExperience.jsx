import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'

export function RateExperience() {
  const { id } = useParams()
  const { success, error } = useToast()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      apiGet(`/bookings/${id}`)
        .then((res) => {
          setBooking(res.data)
          if (res.data.status !== 'delivered') {
            error('You can only review orders that have been successfully delivered.')
            navigate(`/bookings/${id}`)
          }
        })
        .catch(() => setBooking(null))
        .finally(() => setLoading(false))
    }
  }, [id, error, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) {
      error('Please write a short review comment.')
      return
    }

    setSubmitting(true)
    try {
      await apiPost('/reviews', {
        bookingId: id,
        rating,
        title,
        comment,
      })
      success('Thank you for rating your tailor! Your review is now live.')
      navigate(`/bookings/${id}`)
    } catch (err) {
      error(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading order...</div>
  }

  if (!booking) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Booking Not Found</h2>
        <Link to="/bookings" className="text-blue-600 underline mt-2 block">Return to Bookings</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <nav className="mb-4 text-xs font-medium text-slate-500">
        <Link to="/bookings" className="hover:text-blue-600">My Bookings</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-bold">Rate Experience</span>
      </nav>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Rate Your Fit &amp; Tailor Experience
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Order #{booking.orderNumber || booking._id} • {booking.serviceType} by {booking.tailorProfile?.shopName || booking.tailor?.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-3xl sm:text-4xl transition-transform hover:scale-110"
                >
                  <span className={(hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}>
                    ★
                  </span>
                </button>
              ))}
              <span className="ml-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                {rating === 5 ? 'Exceptional Fit! 🌟' : rating === 4 ? 'Great Service 👍' : rating === 3 ? 'Average' : 'Needs Improvement'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Review Headline / Title</label>
            <input
              type="text"
              placeholder="e.g. Perfect bespoke fit and high quality stitching"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Detailed Review Feedback</label>
            <textarea
              placeholder="How was the measurement process, fit accuracy, stitching quality, and doorstep communication?"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to={`/bookings/${id}`}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Post Verified Review →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RateExperience
