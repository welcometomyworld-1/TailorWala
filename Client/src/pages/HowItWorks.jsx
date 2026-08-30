import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    step: '01',
    title: 'Search & Pick a Master Artisan',
    desc: 'Browse verified tailors in your neighborhood. Compare specializations, customer reviews, turnaround days, and transparent price cards.',
    icon: '🔍',
  },
  {
    step: '02',
    title: 'Book Doorstep Fitting & Measurements',
    desc: 'Pick your preferred date and 2-hour window. A professional master measuring assistant visits your residence with fabric swatches and styling guides.',
    icon: '🏠',
  },
  {
    step: '03',
    title: 'Master Pattern Drafting & Stitching',
    desc: 'Your custom garments are hand-canvassed, cut, and stitched by master craftsmen. Track all 11 stages live in your customer dashboard.',
    icon: '✂️',
  },
  {
    step: '04',
    title: 'Doorstep Delivery & Perfect Fit Guarantee',
    desc: 'Garments are steam-pressed and delivered in luxury wardrobe bags. If the fit is not 100% perfect, free doorstep alterations are guaranteed within 7 days.',
    icon: '✨',
  },
]

const FAQS = [
  {
    q: 'How does doorstep measurement work?',
    a: 'Once you book an appointment, a trained measurement assistant visits your home at the selected time. They record 15+ anatomical dimensions, discuss necklines, pocket cuts, and fit preferences.',
  },
  {
    q: 'Can I provide my own fabric or buy from TailorWala?',
    a: 'You can do both! You can either give your own fabric material directly to the measuring assistant during the home visit, or browse our luxury fabric catalog (Egyptian Cotton, Pure Banarasi Silk, Linen).',
  },
  {
    q: 'What if the garment does not fit perfectly?',
    a: 'Every order on TailorWala is covered by our 100% Fit Guarantee. If you need any tweaks or tapering, we arrange a free doorstep pickup and alteration within 7 days.',
  },
  {
    q: 'How long does custom stitching take?',
    a: 'Standard tailoring takes 5-7 business days. We also offer Express Delivery (3-5 days) for urgent wedding and festive timelines.',
  },
]

export function HowItWorks() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 px-4 py-16 md:py-24 text-white text-center">
        <div className="relative mx-auto max-w-4xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            Simple 4-Step Process
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            How Tailor<span className="text-blue-400">Wala</span> Works
          </h1>
          <p className="mx-auto max-w-2xl text-base md:text-lg text-slate-300">
            From your living room to the master cutting table. Experience bespoke custom tailoring without ever stepping into a crowded market.
          </p>
        </div>
      </section>

      {/* 4 Steps Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs relative flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-800 font-mono">{s.step}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">{s.title}</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl bg-blue-600 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-600/20">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Peace of Mind Guarantee</span>
            <h2 className="text-2xl md:text-3xl font-black">100% Free Doorstep Alteration Guarantee</h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              If your garment requires slight adjustments, we collect, adjust, and redeliver to your doorstep completely free of charge.
            </p>
          </div>
          <Link
            to="/search"
            className="rounded-2xl bg-white text-blue-600 px-8 py-4 text-xs font-black uppercase tracking-wider shadow-lg hover:bg-slate-50 active:scale-95 transition-all whitespace-nowrap"
          >
            Find a Tailor Near You →
          </Link>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400">{openFaq === idx ? '▲' : '▼'}</span>
              </button>
              {openFaq === idx && (
                <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HowItWorks
