import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Scissors,
  Search,
  ShoppingBag,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Ruler,
  LayoutDashboard,
  Wallet,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { NotificationDrawer } from './layout/NotificationDrawer.jsx'
import { apiGet } from '../services/api.js'

export function Header() {
  const { user, logout, isCustomer, isTailor, isAdmin, isEmployee } = useAuth()
  const { itemCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  // Poll notifications count when logged in
  useEffect(() => {
    if (!user) return

    let isMounted = true
    const fetchUnread = async () => {
      try {
        const res = await apiGet('/notifications')
        if (isMounted) setUnreadCount(res.unreadCount || 0)
      } catch {
        // silent
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [user])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/search?search=${encodeURIComponent(search.trim())}`)
      setIsDrawerOpen(false)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Tailor<span className="text-blue-600 dark:text-blue-400">Wala</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                Bespoke at Doorstep
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <input
              type="search"
              placeholder="Search tailors, suits, blouses, fabrics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:bg-slate-800"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </form>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1.5 sm:gap-3">
          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/search"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/search')
                  ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Find Tailors
            </Link>

            <Link
              to="/how-it-works"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/how-it-works')
                  ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              How It Works
            </Link>

            <Link
              to="/offers"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/offers')
                  ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Offers
            </Link>

            {/* Role specific links */}
            {isCustomer && (
              <>
                <Link
                  to="/bookings"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/bookings')
                      ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/60 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  My Orders
                </Link>
                <Link
                  to="/profile/measurements"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/profile/measurements')
                      ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/60 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  Measurements
                </Link>
              </>
            )}

            {isTailor && (
              <>
                <Link
                  to="/tailor"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/tailor')
                      ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/60 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/tailor/earnings"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/tailor/earnings')
                      ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/60 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  Earnings
                </Link>
              </>
            )}

            {isEmployee && (
              <Link
                to="/employee"
                className={`px-3 py-2 rounded-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 transition-colors ${
                  isActive('/employee')
                    ? 'bg-blue-50 dark:bg-blue-950/60'
                    : 'hover:bg-blue-50 dark:hover:bg-blue-950/40'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Employee Portal</span>
              </Link>
            )}

            {isAdmin && !isEmployee && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 transition-colors ${
                  isActive('/admin')
                    ? 'bg-purple-50 dark:bg-purple-950/60'
                    : 'hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>

          {/* Cart Icon (Customer / Guest) */}
          {(!user || isCustomer) && (
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {/* Notifications Bell */}
          {user && (
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User Account / Auth Buttons */}
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1 pl-1 pr-3 text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors">
                <span className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {user.name?.charAt(0) || 'U'}
                </span>
                <span className="hidden sm:inline font-semibold max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <div className="absolute right-0 top-full mt-1.5 hidden w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 shadow-2xl group-hover:block animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{user.role}</p>
                </div>

                {isCustomer && (
                  <>
                    <Link to="/bookings" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40">
                      <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                      <span>My Orders &amp; Bookings</span>
                    </Link>
                    <Link to="/profile/measurements" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40">
                      <Ruler className="h-3.5 w-3.5 text-slate-400" />
                      <span>Measurement Profiles</span>
                    </Link>
                  </>
                )}

                {isTailor && (
                  <>
                    <Link to="/tailor" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40">
                      <LayoutDashboard className="h-3.5 w-3.5 text-blue-500" />
                      <span>Tailor Dashboard</span>
                    </Link>
                    <Link to="/tailor/profile" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40">
                      <Scissors className="h-3.5 w-3.5 text-slate-400" />
                      <span>Shop Profile &amp; Pricing</span>
                    </Link>
                    <Link to="/tailor/earnings" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40">
                      <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Earnings &amp; Payouts</span>
                    </Link>
                  </>
                )}

                {isEmployee && (
                  <Link to="/employee" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40">
                    <Shield className="h-3.5 w-3.5 text-blue-600" />
                    <span>Employee Dashboard</span>
                  </Link>
                )}

                {isAdmin && !isEmployee && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40">
                    <Shield className="h-3.5 w-3.5 text-purple-600" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Notification Drawer Modal */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Mobile Navigation Drawer */}
      {isDrawerOpen && (
        <>
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Scissors className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">TailorWala</span>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search tailors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-xs"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </form>

              <div className="space-y-1 text-xs font-semibold">
                <Link to="/" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Home</Link>
                <Link to="/search" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Find Tailors</Link>
                <Link to="/how-it-works" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">How It Works</Link>
                <Link to="/offers" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Offers &amp; Discounts</Link>

                {isCustomer && (
                  <>
                    <Link to="/bookings" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">My Orders</Link>
                    <Link to="/profile/measurements" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Measurement Profiles</Link>
                  </>
                )}

                {isTailor && (
                  <>
                    <Link to="/tailor" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg text-blue-600 font-semibold hover:bg-blue-50">Tailor Dashboard</Link>
                    <Link to="/tailor/profile" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100">Shop Settings</Link>
                    <Link to="/tailor/earnings" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100">Earnings</Link>
                  </>
                )}

                {isEmployee && (
                  <Link to="/employee" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg font-bold text-blue-600 hover:bg-blue-50">Employee Portal</Link>
                )}

                {isAdmin && !isEmployee && (
                  <Link to="/admin" onClick={() => setIsDrawerOpen(false)} className="block py-2.5 px-3 rounded-lg font-bold text-purple-600 hover:bg-purple-50">Admin Portal</Link>
                )}
              </div>
            </div>

            {user ? (
              <button
                onClick={() => {
                  logout()
                  setIsDrawerOpen(false)
                }}
                className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsDrawerOpen(false)}
                className="block text-center w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md text-xs"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </>
      )}
    </header>
  )
}

export default Header
