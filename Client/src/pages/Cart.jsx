import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { apiGet } from '../services/api.js'

export function Cart() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    updateItemNotes,
    clearCart,
    selectedMeasurementProfile,
    setSelectedMeasurementProfile,
    coupon,
    applyCouponCode,
    removeCoupon,
    stitchingTotal,
    fabricTotal,
    homeVisitFee,
    deliveryFee,
    discount,
    grandTotal,
  } = useCart()

  const { user } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [profiles, setProfiles] = useState([])

  // Load user measurement profiles for assignment
  useEffect(() => {
    if (user) {
      apiGet('/measurements')
        .then((res) => {
          const list = res.data || []
          setProfiles(list)
          if (!selectedMeasurementProfile && list.length > 0) {
            const def = list.find((p) => p.isDefault) || list[0]
            setSelectedMeasurementProfile(def)
          }
        })
        .catch(() => setProfiles([]))
    }
  }, [user, selectedMeasurementProfile, setSelectedMeasurementProfile])

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    setCouponLoading(true)
    try {
      const res = await applyCouponCode(couponInput.trim())
      success(`Coupon ${res.code} applied! Saved ₹${res.discountAmount}`)
      setCouponInput('')
    } catch (err) {
      error(err.message || 'Invalid coupon code')
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🛒</span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Your Shopping Cart is Empty</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Explore skilled tailors in your city and book a custom bespoke fit with home measurement.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/search"
            className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700"
          >
            Find Master Tailors →
          </Link>
          <Link
            to="/offers"
            className="rounded-2xl border border-slate-200 dark:border-slate-700 px-6 py-3 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            View Active Offers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-4 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-bold">Shopping Cart</span>
      </nav>

      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Shopping Cart ({items.length} {items.length === 1 ? 'service' : 'services'})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-2xl shrink-0">
                    ✂️
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.serviceType}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Master Tailor: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.tailorName}</span></p>
                    {item.scheduledAt && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                        🗓️ Visit Date: {new Date(item.scheduledAt).toLocaleDateString()} {item.timeSlot ? `(${item.timeSlot})` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ₹{item.price * (item.quantity || 1)}
                  </span>
                  <span className="block text-[11px] text-slate-400">₹{item.price} each</span>
                </div>
              </div>

              {/* Quantity and Custom notes */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                      className="px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-black text-slate-900 dark:text-white">{item.quantity || 1}</span>
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                      className="px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Special styling notes (e.g. Slim fit, pocket styling)"
                  value={item.customizationNotes || ''}
                  onChange={(e) => updateItemNotes(item.id, e.target.value)}
                  className="flex-1 min-w-[200px] text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 dark:text-white outline-none"
                />
              </div>
            </div>
          ))}

          {/* Measurement Profile Assignment Section */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Select Measurement Profile</h3>
                <p className="text-xs text-slate-500">Attach saved measurements or request a doorstep measurement visit.</p>
              </div>
              <Link to="/profile/measurements" className="text-xs font-bold text-blue-600 hover:underline">
                + Manage Sizes
              </Link>
            </div>

            {profiles.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {profiles.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => setSelectedMeasurementProfile(p)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedMeasurementProfile?._id === p._id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{p.profileName}</span>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                        {p.garmentCategory}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {p.measurements?.length || 0} fields • Fit: {p.fitPreference || 'regular'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
                <span>No saved measurement profiles yet. Our tailor will measure you during the home visit.</span>
                <Link to="/profile/measurements" className="font-bold underline ml-2">Create Profile</Link>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Right Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Order Summary</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Stitching Charges</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{stitchingTotal}</span>
              </div>
              {fabricTotal > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Fabric Materials</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{fabricTotal}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Doorstep Measurement Visit</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{homeVisitFee}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Garment Delivery &amp; Pickup</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{deliveryFee}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Promo Discount ({coupon?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-2xl text-blue-600 dark:text-blue-400">₹{grandTotal}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div>
              {coupon ? (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <span>🎉</span>
                    <span>{coupon.code} applied (Saved ₹{discount})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo / Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs uppercase font-bold dark:text-white outline-none"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 text-xs font-bold hover:bg-slate-800"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={() => {
                if (!user) {
                  navigate('/auth', { state: { from: '/checkout' } })
                } else {
                  navigate('/checkout')
                }
              }}
              className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
            >
              Proceed to Secure Checkout →
            </button>

            <div className="space-y-1 text-center text-[11px] text-slate-400">
              <p>🔒 256-Bit SSL Encrypted Checkout</p>
              <p>100% Fit &amp; Alteration Guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
