import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Scissors,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Home as HomeIcon,
} from 'lucide-react'
import { apiPost } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    city: 'Delhi',
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()
  const { success, error } = useToast()

  const redirect = location.state?.from || (form.role === 'tailor' ? '/tailor' : '/')

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'register' && form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form
      const data = await apiPost(path, payload)

      if (data.token) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        success(mode === 'login' ? `Welcome back, ${data.user.name}!` : 'Account created successfully!')

        if (data.user.role === 'employee') {
          navigate('/employee')
        } else if (data.user.role === 'admin' || data.user.role === 'super_admin') {
          navigate('/admin')
        } else if (data.user.role === 'tailor') {
          navigate('/tailor')
        } else {
          navigate(redirect)
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.')
      error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left Column: Brand Hero Showcase */}
      <div
        className={`hidden w-1/2 flex-col justify-between p-12 lg:flex ${
          mode === 'login' ? 'bg-slate-900' : 'bg-blue-600'
        } text-white relative overflow-hidden transition-colors duration-500`}
      >
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            Tailor<span className="text-blue-300">Wala</span>
          </span>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Bespoke Tailoring &amp; Home Measurements
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            {mode === 'login'
              ? 'Crafting Excellence, One Bespoke Stitch at a Time.'
              : 'Experience Master Artisan Tailoring at Your Doorstep.'}
          </h1>
          <p className="text-base text-slate-300 dark:text-blue-100/90 leading-relaxed">
            Connect with verified master tailors across Delhi NCR, Meerut, Ghaziabad, and Noida. Enjoy precision measurements in the comfort of your home.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4 text-xs font-bold">
            <div className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/10 flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <HomeIcon className="h-4 w-4 text-blue-200" />
              </div>
              <div>
                <span className="block text-white">Doorstep Assistant</span>
                <span className="text-[11px] text-slate-300 font-normal">Expert measurement visits</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/10 flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
              </div>
              <div>
                <span className="block text-white">Perfect Fit Guarantee</span>
                <span className="text-[11px] text-slate-300 font-normal">Free alterations support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 dark:text-blue-200 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>© {new Date().getFullYear()} TailorWala Inc. Verified Artisan Marketplace.</span>
        </div>
      </div>

      {/* Right Column: Clean Auth Form */}
      <div className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">TailorWala</span>
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {mode === 'login' ? 'Sign In' : 'Create an Account'}
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login'
                ? 'Enter your credentials to access your bespoke orders and measurements'
                : 'Join TailorWala for personalized custom tailoring delivered to your door'}
            </p>
          </div>

          {/* Role selector on Register */}
          {mode === 'register' && (
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: 'customer' }))}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  form.role === 'customer'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: 'tailor' }))}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  form.role === 'tailor'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Tailor Partner
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Aarav Sharma"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3 text-xs font-bold dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3 text-xs font-bold dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Email Address or Employee ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com or TW-EMP-0001"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3 text-xs font-bold dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                {mode === 'login' && (
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-10 text-xs font-bold dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3 text-xs font-bold dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-3.5 font-bold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            {mode === 'login' ? (
              <>
                New to TailorWala?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
