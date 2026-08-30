import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiGet, apiPost } from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'

const STAGES = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'measurement_required', label: 'Measurements' },
  { key: 'in_progress', label: 'Pattern Cut' },
  { key: 'stitching', label: 'Stitching' },
  { key: 'quality_check', label: 'Quality Check' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

export function BookingDetail() {
  const { id } = useParams()
  const { success, error } = useToast()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelModal, setCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const loadBooking = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiGet(`/bookings/${id}`)
      setBooking(res.data)
    } catch (err) {
      error(err.message || 'Failed to load order details')
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }, [id, error])

  useEffect(() => {
    if (id) loadBooking()
  }, [id, loadBooking])

  const handleCancelOrder = async () => {
    try {
      await apiPost(`/bookings/${id}/cancel`, { reason: cancelReason })
      success('Booking cancelled successfully')
      setCancelModal(false)
      loadBooking()
    } catch (err) {
      error(err.message || 'Failed to cancel booking')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="animate-spin text-4xl mb-3">✂️</div>
        <p className="text-sm font-semibold text-slate-500">Loading order timeline...</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Order Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">The requested order does not exist or you do not have permission.</p>
        <Link to="/bookings" className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md">
          Back to My Bookings
        </Link>
      </div>
    )
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === booking.status)
  const isCancelled = booking.status === 'cancelled'
  const tailorName = booking.tailorProfile?.shopName || booking.tailor?.name || 'Master Tailor'

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/bookings" className="hover:text-blue-600">My Bookings</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-bold">{booking.orderNumber || `#TW-${booking._id.slice(-8)}`}</span>
      </nav>

      {/* Header Info */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {booking.orderNumber || `#TW-${booking._id.slice(-8)}`}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {booking.serviceType}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {new Date(booking.createdAt).toLocaleDateString()} with {tailorName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3.5 py-1 text-xs font-bold ${
              isCancelled
                ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                : booking.status === 'delivered'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
            }`}>
              {booking.status.replace(/_/g, ' ').toUpperCase()}
            </span>
            <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold">
              ₹{booking.price} PAID
            </span>
          </div>
        </div>

        {/* 11-Stage Progress Tracker Visual */}
        {!isCancelled && (
          <div className="mt-8 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Stitching Progress Timeline</h3>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-0">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              {/* Progress Step Icons */}
              <div className="relative z-10 flex justify-between">
                {STAGES.map((s, idx) => {
                  const isDone = idx <= currentStageIndex
                  const isCurrent = idx === currentStageIndex

                  return (
                    <div key={s.key} className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 scale-110 shadow-md'
                            : isDone
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className={`mt-2 text-[10px] sm:text-xs font-bold text-center max-w-[60px] sm:max-w-none ${
                        isCurrent
                          ? 'text-blue-600 dark:text-blue-400'
                          : isDone
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Estimated Handover Notice */}
        {booking.estimatedDeliveryDate && !isCancelled && (
          <div className="mt-8 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 flex items-center gap-3">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Estimated Delivery Handover</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {new Date(booking.estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column: Measurements & Notes */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Recorded Measurements</h3>
          {booking.measurements?.length > 0 ? (
            <div className="space-y-2 text-xs">
              {booking.measurements.map((m, idx) => (
                <div key={idx} className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-1.5 text-slate-600 dark:text-slate-300">
                  <span>{m.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{m.value} {m.unit || 'in'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
              Home visit scheduled. Measurements will be taken by the assistant and recorded on this order sheet.
            </p>
          )}

          {booking.measurementNotes && (
            <div className="pt-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Tailoring Styling Notes:</span>
              <p className="text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                &ldquo;{booking.measurementNotes}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Address & Timeline Audit Log */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Home Visit &amp; Shipping</h3>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">{booking.shippingAddress?.fullName || 'Customer'}</span>
            <p className="text-slate-600 dark:text-slate-300">{booking.shippingAddress?.street}</p>
            <p className="text-slate-600 dark:text-slate-300">{booking.shippingAddress?.city} {booking.shippingAddress?.pincode}</p>
            <p className="text-slate-500 mt-1">Phone: {booking.shippingAddress?.phone}</p>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-base pt-2">Audit History Log</h3>
          <div className="space-y-3 text-xs max-h-48 overflow-y-auto pr-1">
            {(booking.timeline || []).slice().reverse().map((t, idx) => (
              <div key={idx} className="border-l-2 border-blue-500 pl-3 py-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {t.status?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(t.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link to="/bookings" className="text-xs font-bold text-blue-600 hover:underline">
          ← Back to All Bookings
        </Link>

        <div className="flex items-center gap-3">
          {booking.status === 'delivered' && !booking.rating && (
            <Link
              to={`/rate/${booking._id}`}
              className="rounded-xl bg-amber-500 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:bg-amber-600"
            >
              ⭐ Rate Your Tailor Experience
            </Link>
          )}

          {!['delivered', 'cancelled'].includes(booking.status) && (
            <button
              onClick={() => setCancelModal(true)}
              className="rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 text-xs font-bold"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Tailoring Order</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel this order? Once cancelled, your refund will be processed to the original payment method.
            </p>
            <textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModal(false)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingDetail
