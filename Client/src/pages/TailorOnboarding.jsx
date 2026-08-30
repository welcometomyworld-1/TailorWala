import React, { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'

const STEPS = ['PERSONAL', 'SKILLS', 'PORTFOLIO', 'BANKING', 'VERIFICATION']

export function TailorOnboarding() {
  const { success, error } = useToast()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    experienceYears: '5',
    specializations: ['Bespoke Suits', 'Sherwanis'],
    bio: '',
    basePrice: '499',
    city: 'Delhi',
    pincode: '110001',
  })
  const [loading, setLoading] = useState(false)

  const skills = ['Bespoke Suits', 'Sherwanis', 'Tuxedos', 'Formal Shirts', 'Alterations', 'Bridal Lehengas', 'Designer Blouses', 'Kurtas', 'Blazers']

  useEffect(() => {
    apiGet('/tailors/profile/me')
      .then((res) => {
        const p = res?.data
        if (p) {
          setForm({
            name: p.user?.name || '',
            phone: p.user?.phone || '',
            email: p.user?.email || '',
            experienceYears: p.experienceYears || '5',
            specializations: p.specializations?.length ? p.specializations : ['Bespoke Suits'],
            bio: p.bio || '',
            basePrice: p.basePrice || '499',
            city: p.city || 'Delhi',
            pincode: p.pincode || '',
          })
        }
      })
      .catch(() => {})
  }, [])

  const toggleSkill = (s) => {
    setForm((f) => ({
      ...f,
      specializations: f.specializations.includes(s)
        ? f.specializations.filter((x) => x !== s)
        : [...f.specializations, s],
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await apiPost('/tailors/profile', {
        bio: form.bio,
        experienceYears: Number(form.experienceYears || 0),
        specializations: form.specializations,
        basePrice: Number(form.basePrice || 0),
        city: form.city,
        pincode: form.pincode,
      })
      success('Profile saved successfully.')
      if (step < 5) setStep((s) => s + 1)
    } catch (err) {
      error(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Tailor Partner Network</span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Partner Onboarding &amp; Verification
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Set up your master profile to start receiving home visit tailoring appointments.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-slate-500 uppercase">STEP {step} OF 5</span>
        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${step * 20}%` }} />
        </div>
        <span className="text-xs font-bold text-blue-600">{step * 20}% Done</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i + 1)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              step === i + 1
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Personal &amp; Contact Details</h2>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold dark:text-white outline-none"
                placeholder="Master Ustad Rafiq"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold dark:text-white outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold dark:text-white outline-none"
                  placeholder="tailor@tailorwala.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Years of Experience</label>
              <select
                value={form.experienceYears}
                onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold dark:text-white outline-none"
              >
                {[1, 2, 3, 5, 8, 10, 15, 20, 25].map((n) => (
                  <option key={n} value={n}>{n}+ years</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Core Specializations &amp; Bio</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                    form.specializations.includes(s)
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Artisan Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white outline-none"
                placeholder="4th-generation master craftsman specializing in bespoke suits and wedding sherwanis..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Starting Price (₹)</label>
              <input
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold dark:text-white outline-none"
              />
            </div>
          </div>
        )}

        {(step === 3 || step === 4 || step === 5) && (
          <div className="space-y-4">
            {step === 3 && (
              <>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Portfolio Showcase</h2>
                <p className="text-xs text-slate-500">Upload high-resolution images of your past bespoke tailoring work.</p>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs font-bold p-2 text-center">
                      <span className="text-xl block mb-1">📷</span>
                      <span>Portfolio Sample #{i}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Direct Bank Payout Details</h2>
                <p className="text-xs text-slate-500">Weekly payouts are transferred directly to this bank account.</p>
                <div className="space-y-3 pt-2">
                  <input type="text" placeholder="Account Holder Name" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold dark:text-white" />
                  <input type="text" placeholder="Account Number" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold dark:text-white" />
                  <input type="text" placeholder="IFSC Code (e.g. HDFC0001234)" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-mono font-bold dark:text-white" />
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Identity &amp; Skill Verification</h2>
                <p className="text-xs text-slate-500">TailorWala verifies all partner artisans to maintain 5-star standard quality.</p>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                  ✓ Profile submitted for verification. Admin team will review and activate your partner badge within 24 hours.
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-60"
          >
            {step < 5 ? `Continue to ${STEPS[step]}` : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TailorOnboarding
