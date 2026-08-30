import React from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white">
              <span className="text-2xl">✂️</span>
              <span>Tailor<span className="text-blue-600">Wala</span></span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              India&apos;s premier on-demand custom tailoring platform. Bringing skilled artisan tailors directly to your doorstep for perfect measurements and bespoke fit.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
              <span>🔒 256-Bit SSL Secure</span>
              <span>•</span>
              <span>⚡ 100% Fit Guarantee</span>
              <span>•</span>
              <span>🏠 Doorstep Service</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">For Customers</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-blue-600 dark:hover:text-blue-400">Find Tailors</Link></li>
              <li><Link to="/how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400">How It Works</Link></li>
              <li><Link to="/profile/measurements" className="hover:text-blue-600 dark:hover:text-blue-400">Measurement Profiles</Link></li>
              <li><Link to="/offers" className="hover:text-blue-600 dark:hover:text-blue-400">Coupons &amp; Offers</Link></li>
              <li><Link to="/bookings" className="hover:text-blue-600 dark:hover:text-blue-400">Track Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">For Tailors</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/tailor/onboarding" className="hover:text-blue-600 dark:hover:text-blue-400">Join as a Partner</Link></li>
              <li><Link to="/tailor" className="hover:text-blue-600 dark:hover:text-blue-400">Tailor Dashboard</Link></li>
              <li><Link to="/tailor/earnings" className="hover:text-blue-600 dark:hover:text-blue-400">Earnings &amp; Payouts</Link></li>
              <li><Link to="/safety" className="hover:text-blue-600 dark:hover:text-blue-400">Tailor Standards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Administration</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/admin" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">🔐 Admin Portal</Link></li>
              <li><Link to="/auth" className="hover:text-blue-600 dark:hover:text-blue-400">Employee Login</Link></li>
              <li><Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">Contact Support</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TailorWala Inc. All rights reserved. Handcrafted with precision.</p>
          <div className="mt-2 sm:mt-0 flex gap-4">
            <span>Serving Delhi NCR, Meerut, Ghaziabad, Noida, Gurgaon</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
