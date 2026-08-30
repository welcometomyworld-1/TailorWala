import React, { useState } from 'react'

const FAQS = [
  {
    q: 'How does doorstep tailoring work?',
    a: 'Book a tailor online, choose your preferred fabric or provide your own, schedule a measurement visit, and get your custom garment delivered to your door.',
  },
  {
    q: 'What if the fitting isn\'t perfect?',
    a: 'We offer a 100% Perfect Fit Guarantee. If any alteration is needed, our tailor will collect the garment and alter it for free within 3 days.',
  },
  {
    q: 'How long does stitching take?',
    a: 'Standard delivery takes 5–7 days. Express wedding and urgent stitching options are available at checkout.',
  },
  {
    q: 'Which cities do you serve?',
    a: 'We are live across Meerut, Delhi, and the NCR region — with more cities coming soon.',
  },
  {
    q: 'Can I supply my own fabric?',
    a: 'Absolutely! You can provide your own fabric during the measurement visit, or select from our premium materials.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We accept UPI, debit/credit cards, net banking, and Cash on Measurement pickup.',
  },
]

export function HelpCenterPage() {
  const [open, setOpen] = useState(0)
  return (
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="relative mx-auto max-w-5xl px-4 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-100 backdrop-blur">
            ❓ Help & FAQ
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">Help Center &amp; FAQ</h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-emerald-100 leading-relaxed">
            Quick answers to the most common questions. Still stuck? Contact us.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:py-24 space-y-3">
        {FAQS.map((f, i) => (
          <div key={i} className={`rounded-2xl border transition-all ${open === i ? 'border-emerald-300 bg-emerald-50/60 shadow-md' : 'border-slate-200 bg-white hover:shadow-sm'}`}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-start justify-between gap-4 p-6 text-left"
            >
              <div className="flex items-start gap-3">
                <span className="h-8 w-8 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">{i + 1}</span>
                <h3 className="font-bold text-lg text-slate-900 leading-snug">{f.q}</h3>
              </div>
              <svg className={`h-6 w-6 shrink-0 mt-0.5 text-slate-500 transition-transform ${open === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open === i && (
              <div className="px-6 pb-6 pl-[5.25rem]">
                <p className="text-slate-700 leading-relaxed">{f.a}</p>
              </div>
            )}
          </div>
        ))}

        <div className="mt-10 rounded-3xl bg-slate-900 text-white p-8 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold">Still need help?</h3>
          <p className="mt-2 text-slate-300">Our team is just a message away.</p>
          <a href="mailto:sk8789682127@gmail.com" className="inline-block mt-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-8 py-3 font-bold text-white transition-all active:scale-95">
            Email Support →
          </a>
        </div>
      </section>
    </div>
  )
}
