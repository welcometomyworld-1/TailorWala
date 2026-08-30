import React from 'react'

export function TermsOfServicePage() {
  const TERMS = [
    {
      n: 1,
      title: 'Orders & Payments',
      points: [
        'All bookings are confirmed upon receipt of upfront online payment OR Cash on Measurement pickup.',
        'Prices shown include stitching, doorstep pickup & standard delivery unless otherwise stated.',
        'Premium materials, express delivery, and rush-order charges are billed as applicable.',
        'Taxes and government levies will be added at checkout based on the order value.',
      ],
    },
    {
      n: 2,
      title: 'Alteration Policy',
      points: [
        'Free alterations are applicable within 7 days of delivery of the finished garment.',
        'Alterations must be requested via your order dashboard or by contacting our support team.',
        'Alterations beyond the originally ordered style (e.g., new design, additional embroidery) may incur extra charges.',
        'Garments must be returned in clean, unworn condition to qualify for free alterations.',
      ],
    },
    {
      n: 3,
      title: 'Cancellation & Refunds',
      points: [
        'Orders can be cancelled <strong>free of charge</strong> prior to fabric cutting / stitching commencement.',
        'Once stitching has started, a partial cancellation fee (up to 50% of order value) may apply to cover materials used.',
        'No refunds are applicable once the garment has been delivered, except as covered under the alteration policy.',
        'Refunds are processed within 7–10 working days to the original payment method.',
      ],
    },
  ]
  return (
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 text-white">
        <div className="relative mx-auto max-w-5xl px-4 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-100 backdrop-blur">
            📜 Terms of Service
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">Terms of Service</h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-indigo-100 leading-relaxed">
            Please read these Terms carefully before using TailorOnDemand.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 md:py-24 space-y-6">
        {TERMS.map((t) => (
          <div key={t.n} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-indigo-500/30">
                {t.n}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{t.title}</h2>
            </div>
            <ul className="space-y-3">
              {t.points.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{
                  __html: `<span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 inline-block"></span><span>${p}</span>`
                }} />
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center text-sm text-slate-600">
          Last updated: January 2026 • By using TailorOnDemand you agree to these Terms &amp; our Privacy Policy.
        </div>
      </section>
    </div>
  )
}
