import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiGet } from '../services/api.js'

export function PaymentSuccess() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      apiGet(`/bookings/${id}`)
        .then((res) => setBooking(res.data))
        .catch(() => setBooking(null))
        .finally(() => setLoading(false))
    }
  }, [id])

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-4xl shadow-lg animate-in zoom-in-50 duration-300">
        ✓
      </div>

      <h1 className="mt-6 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        Booking Confirmed &amp; Paid!
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Thank you! Your bespoke tailoring request has been confirmed and scheduled with your master tailor.
      </p>

      {loading ? (
        <div className="mt-8 py-8 text-sm text-slate-500">Loading order summary...</div>
      ) : booking ? (
        <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-left shadow-md space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Number</span>
              <p className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                {booking.orderNumber || `#TW-${booking._id?.slice(-8)}`}
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-bold px-3 py-1">
              PAID ₹{booking.price}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Service</span>
              <span className="font-bold text-slate-900 dark:text-white">{booking.serviceType}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Master Tailor</span>
              <span className="font-bold text-slate-900 dark:text-white">{booking.tailor?.name || 'Assigned Tailor'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Home Visit Appointment</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString() : '—'} ({booking.timeSlot || 'Morning'})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Method</span>
              <span className="font-bold text-slate-900 dark:text-white uppercase">{booking.paymentMethod || 'UPI'}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to={`/bookings/${id}`}
          className="w-full sm:w-auto rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all"
        >
          Track Live Progress →
        </Link>
        <Link
          to="/bookings"
          className="w-full sm:w-auto rounded-2xl border border-slate-200 dark:border-slate-700 px-8 py-3.5 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          View All Bookings
        </Link>
      </div>
    </div>
  )
}

export default PaymentSuccess
