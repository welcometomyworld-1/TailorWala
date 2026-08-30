import React from 'react'

export function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white">
        <div className="relative mx-auto max-w-5xl px-4 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 backdrop-blur">
            🕵️ Privacy Policy
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">Privacy Policy</h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-slate-300 leading-relaxed">
            Effective Date: January 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 md:py-24 space-y-10">
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
          <p className="text-xl text-slate-700">
            TailorOnDemand respects your privacy and is committed to protecting your personal data.
            This policy explains how we collect, use, and safeguard the information you share with us.
          </p>

          <div className="not-prose mt-10 space-y-6">
            {[
              {
                n: 1,
                title: 'Information We Collect',
                body: (
                  <ul className="mt-3 space-y-2 list-disc pl-5">
                    <li>Name &amp; email address for account creation</li>
                    <li>Phone number for appointment &amp; delivery coordination</li>
                    <li>Delivery address for doorstep pickup &amp; drop</li>
                    <li>Measurement preferences &amp; stitching style choices</li>
                  </ul>
                ),
              },
              {
                n: 2,
                title: 'How We Use Information',
                body: (
                  <ul className="mt-3 space-y-2 list-disc pl-5">
                    <li>To process stitching orders &amp; confirm bookings</li>
                    <li>To schedule home measurement &amp; delivery visits</li>
                    <li>To send order status updates (SMS, email, WhatsApp)</li>
                    <li>To personalize recommendations for your style preferences</li>
                  </ul>
                ),
              },
              {
                n: 3,
                title: 'Data Security',
                body: (
                  <p className="mt-3">
                    We <strong>never sell or share</strong> your personal contact details with third-party advertisers.
                    All data is stored securely on industry-standard encrypted servers with role-based access controls.
                    Payment information is handled directly by our PCI-DSS compliant payment gateway partners —
                    we never store your card or banking details on our own servers.
                  </p>
                ),
              },
            ].map((c) => (
              <div key={c.n} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xl">{c.n}</div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{c.title}</h3>
                    <div className="mt-2 text-slate-700">{c.body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-slate-900 text-white p-8">
            <h3 className="text-2xl font-extrabold">Questions about your data?</h3>
            <p className="mt-2 text-slate-300">You can request access, correction, or deletion of your personal data at any time.</p>
            <p className="mt-4 text-slate-200">
              📧 Email us:{' '}
              <a href="mailto:aryankumarkashyap6@gmail.com" className="text-blue-400 hover:text-blue-300 underline">aryankumarkashyap6@gmail.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
