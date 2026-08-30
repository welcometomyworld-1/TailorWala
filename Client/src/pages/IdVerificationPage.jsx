import React, { useEffect, useState } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  QrCode,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react'
import { apiGet } from '../services/api.js'

export function IdVerificationPage() {
  const [searchParams] = useSearchParams()
  const { idNumber: paramId } = useParams()

  const initialQuery = searchParams.get('id') || searchParams.get('idNumber') || paramId || 'TW-EMP-0001'
  const [searchId, setSearchId] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleVerify = async (idToVerify) => {
    const id = (idToVerify || searchId || '').trim()
    if (!id) return

    setLoading(true)
    setErrorMsg('')
    try {
      const res = await apiGet(`/auth/verify-id/${encodeURIComponent(id)}`)
      if (res.status === 'not_found' || !res.isValid && !res.data) {
        setVerificationResult({ notFound: true, message: res.message })
      } else {
        setVerificationResult(res)
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification service unreachable. Please try again.')
      setVerificationResult(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      handleVerify(initialQuery)
    }
  }, [])

  const data = verificationResult?.data
  const isValid = verificationResult?.isValid
  const isEmployee = verificationResult?.type === 'employee'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-950/60 px-4 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>TailorWala Official ID Verification Portal</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            Identity &amp; Badge Authenticator
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Scan or enter any TailorWala Staff ID (<code className="font-mono text-blue-600 font-bold">TW-EMP-XXXX</code>) or Master Tailor ID to verify official employment &amp; workshop accreditation.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleVerify(searchId)
            }}
            className="mt-6 flex gap-2 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                placeholder="Enter ID (e.g. TW-EMP-0001)"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 shadow-md shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>

        {/* Verification Display Card */}
        {verificationResult && !verificationResult.notFound && data && (
          <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in duration-300">
            {/* Top Status Strip */}
            <div
              className={`p-4 sm:p-5 flex items-center justify-between ${
                isValid
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {isValid ? (
                  <CheckCircle2 className="w-7 h-7 shrink-0 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-7 h-7 shrink-0" />
                )}
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-wide uppercase">
                    {isValid ? verificationResult.badgeTitle || 'VERIFIED CREDENTIAL' : '⚠️ ID NOT ACTIVE / SUSPENDED'}
                  </h2>
                  <p className="text-xs text-white/90">
                    {isValid
                      ? 'Officially registered and authorized by TailorWala Trust Directorate.'
                      : 'This identification credential is deactivated, suspended, or revoked.'}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
                {data.idNumber}
              </span>
            </div>

            {/* ID Card Visual & Info Details */}
            <div className="p-6 sm:p-8 grid gap-8 md:grid-cols-3 items-center">
              {/* Left Column: ID Photo & Badges */}
              <div className="flex flex-col items-center text-center md:border-r md:border-slate-100 dark:md:border-slate-800 md:pr-8">
                <div className="relative mb-4">
                  <img
                    src={data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                    alt={data.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-blue-500/20 shadow-md"
                  />
                  {isValid && (
                    <span className="absolute -bottom-2 -right-2 rounded-full bg-emerald-500 p-1.5 text-white shadow-lg">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">{data.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {data.idNumber}
                  </span>
                  {data.uniqueNumber && (
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                      {data.uniqueNumber}
                    </span>
                  )}
                </div>

                <span
                  className={`mt-2.5 inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold uppercase ${
                    isValid
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  ● {data.status}
                </span>
              </div>

              {/* Middle/Right Column: Metadata Fields */}
              <div className="md:col-span-2 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Designation &amp; Role</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{data.designation}</span>
                    <span className="block text-[11px] text-slate-500 uppercase font-semibold">{data.role}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      {isEmployee ? 'Department' : 'Workshop / Studio'}
                    </span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {isEmployee ? data.department : data.shopName}
                    </span>
                    <span className="block text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {data.city}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 font-semibold">Authorized Activities</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isEmployee ? 'Platform Operations, Home Delivery, Customer Support' : 'Custom Measurement, Home Visit, Master Stitching'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 font-semibold">Credential Issued Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {new Date(data.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-semibold">Accreditation Body</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{data.verifiedBy}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    🖨️ Print Verification Certificate
                  </button>
                  <Link
                    to="/"
                    className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Back to TailorWala Home</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not Found Display */}
        {verificationResult?.notFound && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/20 p-8 text-center">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-rose-900 dark:text-rose-300">Invalid or Unknown ID</h3>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 max-w-md mx-auto">
              {verificationResult.message || 'No active employee, staff associate or master tailor was found matching this identification number.'}
            </p>
            <p className="text-[11px] text-slate-500 mt-4">
              If someone is presenting an ID with this number, please report it immediately to <a href="mailto:security@tailorwala.com" className="font-bold text-rose-600 underline">security@tailorwala.com</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default IdVerificationPage
