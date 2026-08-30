import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../services/api.js'

export function TailorEarnings() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/tailors/earnings')
      .then((res) => {
        // Axios interceptor returns response.data
        const raw = res?.data || res || {}
        setData(raw)
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading your earnings metrics...</div>
  }

  const totalGross = data?.totalEarnings || data?.earnings?.totalGross || 0
  const platformFee = Math.round(totalGross * 0.15)
  const netEarnings = Math.round(totalGross - platformFee)
  const totalOrders = data?.totalDeliveredCount || data?.earnings?.totalOrders || data?.transactions?.length || 0
  const transactions = data?.transactions || data?.completedBookings || []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <nav className="text-xs font-medium text-slate-500">
        <Link to="/tailor" className="hover:text-blue-600">Tailor Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-bold">Earnings &amp; Payouts</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Financial Reports</span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Tailor Earnings &amp; Payouts
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Automated direct weekly bank transfers and order payout breakdown.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Tailoring Revenue</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">₹{totalGross}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">From {totalOrders} delivered orders</span>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Fee (15%)</span>
          <p className="text-3xl font-black text-red-500 mt-2">-₹{platformFee}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Hosting, payments, and client leads</span>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Take-Home Pay</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">₹{netEarnings}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Disbursed to linked bank account</span>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Next Payout Date</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">Every Monday</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Automatic NEFT / IMPS transfer</span>
        </div>
      </div>

      {/* Completed Orders Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delivered Orders &amp; Disbursal History</h2>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No delivered orders yet to generate payout history.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3 text-right">Gross Price</th>
                  <th className="py-3 px-3 text-right">Fee (15%)</th>
                  <th className="py-3 px-3 text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((b) => {
                  const gross = b.amount || b.price || 0
                  const fee = b.platformFee || Math.round(gross * 0.15)
                  const net = b.netEarnings || (gross - fee)

                  return (
                    <tr key={b._id || b.bookingId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">{b.orderNumber || (b._id || b.bookingId)?.slice(-8)}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{b.customer?.name || b.customerName || 'Customer'}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{b.serviceType || b.service || 'Tailoring'}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">₹{gross}</td>
                      <td className="py-3 px-3 text-right text-red-500 font-semibold">-₹{fee}</td>
                      <td className="py-3 px-3 text-right font-black text-emerald-600">₹{net}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TailorEarnings
