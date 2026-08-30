import React, { useState } from 'react'

const POSITIONS = [
  {
    tag: 'Full-Time',
    title: 'Fashion Designer / Measurement Specialist',
    loc: 'Meerut · New Delhi · NCR',
    salary: '₹35,000 – ₹55,000 / month',
    points: [
      'Take precise client measurements for bespoke men\'s & women\'s wear',
      'Guide clients on fabric selection, styles & fit recommendations',
      'Coordinate with master tailors to ensure perfect execution',
      'Maintain client measurement records & design portfolios',
    ],
    reqs: [
      'Diploma/Degree in Fashion Design or equivalent experience',
      '2+ years of hands-on measurement & fitting experience',
      'Excellent communication & client-facing skills',
      'Willingness to travel for home visits across Delhi NCR',
    ],
    icon: '👗',
    color: 'from-pink-500 to-rose-600',
  },
  {
    tag: 'Contractual',
    title: 'Partner Tailor / Artisan',
    loc: 'Meerut · New Delhi · NCR (Work from your own workshop)',
    salary: 'Per-piece payment · Earn ₹25K – ₹80K+ monthly',
    points: [
      'Accept stitching orders through our platform at your preferred rates',
      'Deliver high-quality finished garments within committed timelines',
      'Maintain quality standards & participate in periodic audits',
      'Get exposure to high-value premium clientele',
    ],
    reqs: [
      '3+ years of professional tailoring experience',
      'Expertise in at least one domain: Men\'s, Women\'s, Bridal, Suits',
      'Own workshop/stitching setup with sewing machine & staff (optional)',
      'Smartphone access for order management via our portal',
    ],
    icon: '🧵',
    color: 'from-emerald-500 to-teal-600',
  },
]

export function CareersPage() {
  const [sent, setSent] = useState(false)
  return (
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-700 to-cyan-700 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #fff 0, transparent 40%), radial-gradient(circle at 80% 70%, #fff 0, transparent 40%)" }} />
        <div className="relative mx-auto max-w-5xl px-4 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-100 backdrop-blur">
            👩‍💼 Join Our Team
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">Join Our Team</h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-sky-100 leading-relaxed">
            We are expanding rapidly across Meerut, Delhi &amp; NCR!
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24 space-y-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Open Positions</h2>
          <p className="mt-2 text-slate-500">Great roles. Craft-obsessed team. Unlimited room to grow.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {POSITIONS.map((p, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-2xl transition-all">
              <div className={`bg-gradient-to-br ${p.color} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">{p.tag}</div>
                  <div className="text-5xl">{p.icon}</div>
                </div>
                <h3 className="mt-4 text-2xl font-extrabold">{p.title}</h3>
                <div className="mt-3 space-y-1 text-sm text-white/90">
                  <div>📍 {p.loc}</div>
                  <div className="font-bold">💵 {p.salary}</div>
                </div>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">What You'll Do</h4>
                  <ul className="mt-3 space-y-2">
                    {p.points.map((pt, k) => (
                      <li key={k} className="flex gap-2 text-slate-700">
                        <span className="text-sky-500 mt-1 font-bold">✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Requirements</h4>
                  <ul className="mt-3 space-y-2">
                    {p.reqs.map((r, k) => (
                      <li key={k} className="flex gap-2 text-slate-700">
                        <span className="text-amber-500 mt-1 font-bold">★</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Send Us Your Application</h2>
              <p className="mt-4 text-slate-300 leading-relaxed">
                Interested in working with us? Send your portfolio or resume directly to our team — we're always looking for exceptional craftspeople.
              </p>
              <div className="mt-6 space-y-3 text-slate-200">
                <p className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">📧</span>
                  <a href="mailto:careers@tailorondemand.com" className="text-blue-300 hover:text-blue-200 font-bold text-lg underline">careers@tailorondemand.com</a>
                </p>
                <p className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">📞</span>
                  <span className="font-semibold">+91 8789 682127</span>
                </p>
              </div>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true) }}
              className="rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
            >
              <h3 className="text-xl font-extrabold">Quick Apply</h3>
              <p className="text-sm text-slate-500 mt-1">We'll reach out within 48 hours.</p>
              <div className="mt-5 space-y-3">
                <input required placeholder="Full name" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all" />
                <input required type="email" placeholder="Email" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all" />
                <input placeholder="Phone (optional)" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all" />
                <select required className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all">
                  <option value="">Select position applying for…</option>
                  {POSITIONS.map((p, k) => <option key={k}>{p.title}</option>)}
                  <option>Other / Internship</option>
                </select>
                <textarea required rows="3" placeholder="Tell us about yourself / Why you'd be a great fit…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all" />
                <button
                  type="submit"
                  disabled={sent}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 px-6 py-4 font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {sent ? '✅ Application Sent! 🎉' : 'Submit Application →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
