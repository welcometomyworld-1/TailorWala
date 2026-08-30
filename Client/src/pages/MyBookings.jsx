import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../services/api.js'

const STATUS_BADGES = {
  pending: { label: 'Pending Confirmation', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  accepted: { label: 'Order Accepted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
  measurement_required: { label: 'Measurement Required', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
  fabric_selected: { label: 'Fabric Selected', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
  in_progress: { label: 'In Progress', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' },
  stitching: { label: 'Stitching Active', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
  quality_check: { label: 'Quality Check', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300' },
  ready: { label: 'Ready for Dispatch', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  delivered: { label: 'Delivered ✓', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' },
}

export function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState('all')

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await apiGet('/bookings/my')
      setBookings(res.data || [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const filtered = bookings.filter((b) => {
    if (filterTab === 'active') {
      return !['delivered', 'cancelled'].includes(b.status)
    }
    if (filterTab === 'completed') {
      return b.status === 'delivered'
    }
    if (filterTab === 'cancelled') {
      return b.status === 'cancelled'
    }
    return true
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-4 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-bold">My Bookings</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Orders &amp; Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track real-time stitching progress, delivery estimates, and past bespoke orders.
          </p>
        </div>
        <Link
          to="/search"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all text-center"
        >
          + Book New Tailor
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: `All Orders (${bookings.length})` },
          { id: 'active', label: `In Progress (${bookings.filter((b) => !['delivered', 'cancelled'].includes(b.status)).length})` },
          { id: 'completed', label: `Delivered (${bookings.filter((b) => b.status === 'delivered').length})` },
          { id: 'cancelled', label: `Cancelled (${bookings.filter((b) => b.status === 'cancelled').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              filterTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading your orders...</div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-12 text-center">
          <span className="text-5xl block mb-3">📦</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No bookings found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {filterTab === 'all'
              ? "You haven't placed any bespoke tailoring orders yet."
              : `No orders currently matching the '${filterTab}' filter.`}
          </p>
          <Link
            to="/search"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            Find a Tailor Now
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((b) => {
            const badge = STATUS_BADGES[b.status] || { label: b.status, color: 'bg-slate-100 text-slate-800' }
            const tailorName = b.tailorProfile?.shopName || b.tailor?.name || 'Master Tailor'

            return (
              <div
                key={b._id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-black text-lg">
                      ✂️
                    </span>
                    <div>
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {b.orderNumber || `#TW-${b._id.slice(-8)}`}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {b.serviceType}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-bold">
                      {b.paymentStatus === 'paid' ? 'PAID' : 'PAYMENT PENDING'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Master Tailor</span>
                    <span className="font-bold text-slate-900 dark:text-white">{tailorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Home Visit Appointment</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {b.scheduledAt ? new Date(b.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'} ({b.timeSlot || '10 AM'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Amount</span>
                    <span className="text-base font-black text-blue-600 dark:text-blue-400">₹{b.price}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Order Placed: {new Date(b.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'delivered' && !b.rating && (
                      <Link
                        to={`/rate/${b._id}`}
                        className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-4 py-2 text-xs font-bold hover:bg-amber-100 transition-colors"
                      >
                        ⭐ Rate Fit &amp; Tailor
                      </Link>
                    )}
                    <Link
                      to={`/bookings/${b._id}`}
                      className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 text-xs font-bold hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-xs"
                    >
                      Track Order Details →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyBookings
