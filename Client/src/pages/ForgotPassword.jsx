import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '../services/api.js'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const TAILOR_IMAGE = "/brain/2da912ba-a3ba-47a5-a538-0f69108e5cec/tailor_at_work_1772962010224.png"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const data = await apiPost('/auth/forgot-password', { email })
      console.log(data)
      setMessage(data.message || 'If an account exists, a reset link has been sent to your email.')
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden w-1/2 flex-col justify-between p-12 lg:flex bg-slate-900 text-white relative overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 z-0">
           <img src={TAILOR_IMAGE} alt="Tailor at work" className="h-full w-full object-cover opacity-60" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="text-xl font-bold">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight">TailorOnDemand</span>
          </div>
        </div>
        <div className="relative z-10 mb-20 max-w-md">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">Crafting Excellence, One Stitch at a Time.</h1>
          <p className="mt-6 text-lg text-slate-300">Manage your custom tailoring requests and connect with expert artisans worldwide.</p>
        </div>
        <div className="relative z-10 flex gap-8 text-sm text-slate-400">
           <span>© 2024 TailorOnDemand. Handcrafted style delivered.</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white`}>
              <span className="text-xl font-bold">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TailorOnDemand</span>
          </div>

          <div className="mb-8 flex flex-col items-center lg:items-start">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center lg:text-left">Forgot Password</h2>
            <p className="mt-2 text-slate-500 text-center lg:text-left">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" required />
              </div>
            </div>

            {error && <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">{error}</p>}
            {message && <p className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-600">{message}</p>}

            <button type="submit" disabled={loading} className={`w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 bg-slate-900 hover:bg-slate-800 shadow-slate-900/20`}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-600">
            Remembered your password? <Link to="/auth" className="font-bold text-blue-600 hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
