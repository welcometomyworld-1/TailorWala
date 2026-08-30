import React from 'react'
import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #60a5fa 0, transparent 40%), radial-gradient(circle at 80% 70%, #a78bfa 0, transparent 40%)" }} />
        <div className="relative mx-auto max-w-5xl px-4 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur">
            🏠 About Us
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">About TailorOnDemand</h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-slate-300 leading-relaxed">
            Bringing master craftsmanship and bespoke tailoring straight to your doorstep.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 md:py-24 space-y-14">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
            🎯 Our Mission
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Our Mission</h2>
          <p className="mt-5 text-slate-600 text-lg leading-relaxed">
            We believe <strong className="text-slate-900">everyone deserves clothes that fit perfectly</strong>. Our platform connects you with top-rated, local artisan tailors for custom stitching, measurement visits, and hassle-free doorstep delivery.
          </p>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider mb-4">
            ✨ Why Choose Us
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Why Choose TailorOnDemand?</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { icon: '🧵', title: 'Expert Master Tailors', desc: 'Handpicked and verified tailors with decades of experience.' },
              { icon: '🚪', title: 'Doorstep Convenience', desc: 'Home measurement visits at your preferred time slot.' },
              { icon: '👌', title: 'Perfect Fit Guarantee', desc: 'Free alterations if the fit isn\'t 100% spot on.' },
            ].map((x, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="text-4xl">{x.icon}</div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{x.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{x.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold">Ready for your perfect fit?</h3>
          <p className="mt-3 text-slate-300">Join thousands of happy customers today.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth" className="rounded-xl bg-blue-600 hover:bg-blue-700 px-8 py-3 font-bold text-white transition-all active:scale-95">Book Your Tailor</Link>
            <Link to="/contact" className="rounded-xl border border-white/20 hover:bg-white/10 px-8 py-3 font-bold text-white transition-all">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
