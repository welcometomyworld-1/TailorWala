import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const OFFERS = [
  {
    code: 'FIRST20',
    title: 'New Customer Welcome',
    desc: 'Get Flat 20% OFF on your first bespoke tailoring order.',
    tag: '🎉 Welcome Offer',
    color: 'from-blue-500 to-indigo-600',
    min: 'Applicable on orders above ₹500',
    validity: 'Lifetime valid for first-time users',
  },
  {
    code: 'FEST300',
    title: 'Wedding & Festive Spree',
    desc: 'Flat ₹300 OFF on Wedding & Festive Collections (Sherwanis, Lehengas, Suits).',
    tag: '👑 Premium Festive',
    color: 'from-amber-500 to-rose-500',
    min: 'Applicable on orders above ₹2,000',
    validity: 'Valid across Delhi NCR & Meerut',
  },
  {
    code: 'STITCH50',
    title: 'Weekend Tailoring Special',
    desc: 'Flat ₹50 OFF on any home measurement appointment.',
    tag: '⚡ Weekend Flash',
    color: 'from-emerald-500 to-teal-500',
    min: 'Applicable on all services',
    validity: 'Valid on all doorstep bookings',
  },
]

export function OffersPage() {
  const [copied, setCopied] = useState(null)

  const copy = (c) => {
    try {
      navigator.clipboard?.writeText?.(c)
    } catch {
      // silent
    }
    setCopied(c)
    setTimeout(() => setCopied((x) => (x === c ? null : x)), 1800)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-900 text-white">
        <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100 backdrop-blur">
            💰 Limited Time Deals
          </span>
          <h1 className="mt-5 text-3xl md:text-5xl font-black tracking-tight">
            Active Offers &amp; Promo Coupons
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-blue-100/90 leading-relaxed">
            Apply these promotional coupon codes directly at checkout to enjoy discounts on custom tailoring.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {OFFERS.map((o, i) => (
            <div
              key={i}
              className="group relative rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all"
            >
              <div className={`h-32 bg-gradient-to-br ${o.color} relative`}>
                <div className="absolute inset-0 flex items-center justify-between px-6">
                  <div className="text-white/90 text-xs font-bold uppercase tracking-wider">{o.tag}</div>
                  <div className="text-6xl opacity-30">🎁</div>
                </div>
              </div>
              <div className="-mt-8 px-6 pb-6 relative">
                <button
                  onClick={() => copy(o.code)}
                  className="relative w-full rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 px-4 flex items-center justify-between font-mono font-extrabold shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  <span className="text-lg tracking-widest">{o.code}</span>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-bold font-sans transition-all ${
                    copied === o.code ? 'bg-emerald-500 text-white' : 'bg-white/10 dark:bg-slate-900/10'
                  }`}>
                    {copied === o.code ? '✓ Copied' : 'Copy Code'}
                  </span>
                </button>

                <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">{o.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{o.desc}</p>

                <div className="mt-4 space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-emerald-600">●</span> {o.min}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-amber-600">●</span> {o.validity}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight">Ready to book a bespoke tailoring appointment?</h3>
          <p className="mt-2 text-sm text-slate-300">Choose your favorite artisan and enter your code on the checkout screen.</p>
          <Link
            to="/search"
            className="inline-block mt-6 rounded-2xl bg-blue-600 hover:bg-blue-700 px-8 py-3.5 font-bold text-white shadow-xl shadow-blue-600/30 transition-all active:scale-95 text-xs uppercase tracking-wider"
          >
            Find Tailors &amp; Redeem →
          </Link>
        </div>
      </section>
    </div>
  )
}

export default OffersPage
