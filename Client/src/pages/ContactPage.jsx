import React, { useState } from 'react'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  return (
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="relative mx-auto max-w-5xl px-4 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100 backdrop-blur">
            📞 Get In Touch
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">Contact Us</h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-blue-100 leading-relaxed">
            Have questions or need assistance with your booking? We're here to help!
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reach Out</h2>

          <div className="space-y-4">
            {[
              { icon: '📧', label: 'Email Support', value: 'sk8789682127@gmail.com / aryankumarkashyap6@gmail.com' },
              { icon: '📱', label: 'Phone / WhatsApp', value: '+91 8789 682127 / +91 62076 00462' },
              { icon: '🕒', label: 'Support Hours', value: 'Monday to Sunday, 9:00 AM – 8:00 PM' },
              { icon: '📍', label: 'Office Location', value: 'Meerut / New Delhi, India' },
            ].map((row, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-2xl">{row.icon}</div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{row.label}</div>
                  <div className="mt-1 font-semibold text-slate-900 break-words">{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
            <h3 className="font-bold text-amber-900 flex items-center gap-2">💬 Quick Support</h3>
            <p className="mt-2 text-sm text-amber-800 leading-relaxed">
              For instant updates on active orders, please use the live chat option in your dashboard.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true) }}
          className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl"
        >
          <h2 className="text-2xl font-extrabold text-slate-900">Send us a message</h2>
          <p className="mt-1 text-slate-500 text-sm">We usually respond within 24 hours.</p>
          <div className="mt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
                <input required className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Your full name" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <input type="email" required className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Subject</label>
              <input required className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="How can we help?" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Message</label>
              <textarea required rows="5" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Write your message here…" />
            </div>
            <button type="submit" disabled={sent} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-60">
              {sent ? '✅ Message Sent — We\'ll be in touch!' : 'Send Message →'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
