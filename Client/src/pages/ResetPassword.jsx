import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { apiPut } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const { token } = useParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const TAILOR_IMAGE = "/brain/2da912ba-a3ba-47a5-a538-0f69108e5cec/tailor_at_work_1772962010224.png"

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }
    
    setLoading(true)
    setError('')
    try {
      const data = await apiPut(`/auth/reset-password/${token}`, { password })
      localStorage.setItem('token', data.token)
      setUser(data.user)
      if (data.user?.role === 'tailor') navigate('/tailor')
      else navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden w-1/2 flex-col justify-between p-12 lg:flex bg-blue-600 text-white relative overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 z-0">
           <img src={TAILOR_IMAGE} alt="Tailor at work" className="h-full w-full object-cover opacity-60" />
           <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-transparent"></div>
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
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">Secure your account with a new password.</h1>
          <p className="mt-6 text-lg text-blue-100">Make sure to use a strong and memorable password.</p>
        </div>
        <div className="relative z-10 text-sm text-blue-200">
           <span>© 2024 TailorOnDemand. Handcrafted style delivered.</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white`}>
              <span className="text-xl font-bold">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TailorOnDemand</span>
          </div>

          <div className="mb-8 flex flex-col items-center lg:items-start">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center lg:text-left">Set New Password</h2>
            <p className="mt-2 text-slate-500 text-center lg:text-left">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">New Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input type={showPassword ? "text" : "password"} name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? (
                     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" required />
              </div>
            </div>

            {error && <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className={`w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 bg-blue-600 hover:bg-blue-700 shadow-blue-600/20`}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-600">
            <Link to="/auth" className="font-bold text-blue-600 hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
