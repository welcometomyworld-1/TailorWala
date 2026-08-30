import React from 'react'

const PILLARS = [
  {
    icon: '🛡️',
    title: 'Background Verified Staff',
    desc: 'All tailors and measurement agents undergo strict background checks before onboarding — including police verification, ID checks, and reference validation.',
  },
  {
    icon: '🧼',
    title: 'Hygiene & Standards',
    desc: 'Sanitized measuring tools, shoe covers, masks, and a strict professional code of conduct during every home visit to keep your family safe.',
  },
  {
    icon: '🔒',
    title: 'Secure Handling',
    desc: 'Your valuable fabrics are safely tagged, handled, and tracked digitally from pickup to delivery — with insurance cover for every order.',
  },
]

export function SafetyPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-red-600 to-orange-600 text-white">
        <div className="relative mx-auto max-w-5xl px-4 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-100 backdrop-blur">
            🛡️ Your Safety Matters
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">Safety &amp; Quality Assurance</h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-rose-100 leading-relaxed">
            Your safety and trust are our top priorities when our professionals visit your home.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-4xl shadow-lg shadow-rose-500/20">
                {p.icon}
              </div>
              <h3 className="mt-6 text-xl font-extrabold text-slate-900">{p.title}</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Every Professional, Fully Trained &amp; Audited
              </h2>
              <ul className="mt-6 space-y-4">
                {[
                  'Mandatory police & ID verification',
                  'Monthly quality audits & mystery shopper checks',
                  'Trained in hygiene protocols & COVID-safe SOPs',
                  'Real-time GPS tracked pickup & delivery',
                  'Digital tagging of your fabrics & garments',
                ].map((v, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-md">
              <div className="flex items-center justify-center h-56 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-8xl">🔐</div>
              <p className="mt-4 text-center font-bold text-slate-900">Trust Score: 98.4% Customer Confidence</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
