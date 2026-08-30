import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Users,
  Scissors,
  Layers,
  CreditCard,
  Star,
  Tag,
  User,
  Shield,
  Bell,
  Settings,
  LogOut,
  Camera,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Save,
  Key,
  ShieldCheck,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  QrCode,
  Sparkles,
  Lock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { apiGet, apiPatch, apiPost, apiPut } from '../services/api.js'
import DigitalIdCard from '../components/DigitalIdCard.jsx'
import PhotoUploadModal from '../components/PhotoUploadModal.jsx'

export function EmployeeDashboard() {
  const { user, logout, updateProfile } = useAuth()
  const { success, error, info } = useToast()
  const navigate = useNavigate()

  // Dynamic permitted tabs calculation
  const permissions = useMemo(() => user?.permissions || [], [user?.permissions])
  const isSuperAdminOrAdmin = user?.role === 'super_admin' || user?.role === 'admin'

  const hasPerm = (permKey) => {
    if (isSuperAdminOrAdmin) return true
    return permissions.includes(permKey)
  }

  // Determine initial active tab
  const getInitialTab = () => {
    if (hasPerm('dashboard')) return 'dashboard'
    if (hasPerm('orders')) return 'orders'
    if (hasPerm('users') || hasPerm('customers')) return 'customers'
    if (hasPerm('tailors')) return 'tailors'
    if (hasPerm('services')) return 'services'
    if (hasPerm('payments')) return 'payments'
    return 'profile'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [idModalOpen, setIdModalOpen] = useState(false)

  // Data states for permitted modules
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [orderFilter, setOrderFilter] = useState('')
  const [measuringOrder, setMeasuringOrder] = useState(null)
  const [measurementNotes, setMeasurementNotes] = useState('')
  const [orderSearch, setOrderSearch] = useState('')

  const [customers, setCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')

  const [tailors, setTailors] = useState([])
  const [tailorsLoading, setTailorsLoading] = useState(false)

  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(false)

  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    address: user?.address || '',
    pincode: user?.pincode || '',
  })
  const [profileSaving, setProfileSaving] = useState(false)

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordSaving, setPasswordSaving] = useState(false)

  // Sync profile form when user object updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
        address: user.address || '',
        pincode: user.pincode || '',
      })
    }
  }, [user])

  // Load Orders
  const loadOrders = async () => {
    if (!hasPerm('orders') && !hasPerm('dashboard')) return
    setOrdersLoading(true)
    try {
      const res = await apiGet('/admin/bookings')
      setOrders(res.data || [])
    } catch (err) {
      if (err.status === 403) {
        error("You don't have permission to access this section.")
      }
    } finally {
      setOrdersLoading(false)
    }
  }

  // Load Customers
  const loadCustomers = async () => {
    if (!hasPerm('users') && !hasPerm('customers')) return
    setCustomersLoading(true)
    try {
      const res = await apiGet('/admin/users')
      setCustomers(res.data || [])
    } catch (err) {
      if (err.status === 403) {
        error("You don't have permission to access this section.")
      }
    } finally {
      setCustomersLoading(false)
    }
  }

  // Load Tailors
  const loadTailors = async () => {
    if (!hasPerm('tailors')) return
    setTailorsLoading(true)
    try {
      const res = await apiGet('/admin/tailors')
      setTailors(res.data || [])
    } catch (err) {
      if (err.status === 403) {
        error("You don't have permission to access this section.")
      }
    } finally {
      setTailorsLoading(false)
    }
  }

  // Load Services
  const loadServices = async () => {
    if (!hasPerm('services')) return
    setServicesLoading(true)
    try {
      const res = await apiGet('/admin/services')
      setServices(res.data || [])
    } catch (err) {
      if (err.status === 403) {
        error("You don't have permission to access this section.")
      }
    } finally {
      setServicesLoading(false)
    }
  }

  // Load Payments
  const loadPayments = async () => {
    if (!hasPerm('payments')) return
    setPaymentsLoading(true)
    try {
      const res = await apiGet('/admin/payments')
      setPayments(res.data || [])
    } catch (err) {
      if (err.status === 403) {
        error("You don't have permission to access this section.")
      }
    } finally {
      setPaymentsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'dashboard') loadOrders()
    if (activeTab === 'customers') loadCustomers()
    if (activeTab === 'tailors') loadTailors()
    if (activeTab === 'services') loadServices()
    if (activeTab === 'payments') loadPayments()
  }, [activeTab])

  // Update Order Status
  const handleUpdateOrderStatus = async (bookingId, newStatus) => {
    try {
      await apiPatch(`/admin/bookings/${bookingId}/status`, { status: newStatus })
      success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`)
      loadOrders()
    } catch (err) {
      error(err.message || 'Failed to update order status')
    }
  }

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      await updateProfile(profileForm)
      success('Personal information updated successfully!')
    } catch (err) {
      error(err.message || 'Failed to save profile changes')
    } finally {
      setProfileSaving(false)
    }
  }

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('New passwords do not match.')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      error('Password must be at least 6 characters.')
      return
    }

    setPasswordSaving(true)
    try {
      await apiPost('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      error(err.message || 'Failed to change password')
    } finally {
      setPasswordSaving(false)
    }
  }

  const getGreetingTime = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const employeeId = user?.employeeId || `TW-EMP-${String(user?._id || '0001').slice(-4).toUpperCase()}`
  const uniqueNo = user?.uniqueNumber || `EMP-${String(user?._id || '741926').slice(-6).toUpperCase()}`
  const designation = user?.employeeDesignation || 'Operations Staff'
  const department = user?.department || 'Order Fulfillment'
  const photo = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = !orderFilter || o.status === orderFilter
    const matchQuery =
      !orderSearch ||
      (o._id && o._id.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.user?.name && o.user.name.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.tailor?.name && o.tailor.name.toLowerCase().includes(orderSearch.toLowerCase()))
    return matchStatus && matchQuery
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Top Brand Logo */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/30">
                TW
              </div>
              <div>
                <span className="font-black text-slate-900 dark:text-white text-base tracking-tight block">
                  Tailor<span className="text-blue-600">Wala</span>
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Employee Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Dynamic Navigation Menu Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Modules
            </div>

            {hasPerm('dashboard') && (
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}

            {hasPerm('orders') && (
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>Orders</span>
                </div>
                {orders.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {orders.length}
                  </span>
                )}
              </button>
            )}

            {(hasPerm('users') || hasPerm('customers')) && (
              <button
                type="button"
                onClick={() => setActiveTab('customers')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'customers'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customers</span>
              </button>
            )}

            {hasPerm('tailors') && (
              <button
                type="button"
                onClick={() => setActiveTab('tailors')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'tailors'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span>Tailor Partners</span>
              </button>
            )}

            {hasPerm('services') && (
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Services &amp; Catalog</span>
              </button>
            )}

            {hasPerm('payments') && (
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payments &amp; COD</span>
              </button>
            )}

            <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Personal &amp; Security
            </div>

            {/* Always Available Modules */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('idcard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'idcard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>My ID Card</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom User Bar & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-3">
            <img
              src={photo}
              alt={user?.name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500"
            />
            <div className="overflow-hidden">
              <span className="text-xs font-bold truncate block text-slate-900 dark:text-white">
                {user?.name}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block truncate">
                {employeeId}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/')
              success('Logged out successfully.')
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WORKSPACE ================= */}
      <main className="flex-1 overflow-y-auto max-h-screen p-4 sm:p-8 space-y-6">
        {/* Top Greeting Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <img
                  src={photo}
                  alt={user?.name}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-4 ring-white/30 shadow-2xl"
                />
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(true)}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 transition-all cursor-pointer"
                  title="Upload / Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{getGreetingTime()}, {user?.name?.split(' ')[0]} 👋</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  {user?.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/15 text-white font-mono text-xs font-bold border border-white/20">
                    {employeeId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-blue-200 font-mono text-xs">
                    {uniqueNo}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {designation} • {department}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('idcard')}
                className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>My ID Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-black shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Update Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= TAB: DASHBOARD OVERVIEW ================= */}
        {activeTab === 'dashboard' && hasPerm('dashboard') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-bold uppercase text-slate-400">Total Bookings</span>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">{orders.length}</p>
                <span className="text-xs text-slate-500 mt-1 block">Live queue processing</span>
              </div>

              <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-bold uppercase text-slate-400">In Stitching</span>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
                  {orders.filter((o) => ['in_progress', 'stitching'].includes(o.status)).length}
                </p>
                <span className="text-xs text-slate-500 mt-1 block">Active workshop tailoring</span>
              </div>

              <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-bold uppercase text-slate-400">Ready for Delivery</span>
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                  {orders.filter((o) => ['ready', 'out_for_delivery'].includes(o.status)).length}
                </p>
                <span className="text-xs text-slate-500 mt-1 block">Logistics dispatch queue</span>
              </div>

              <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-bold uppercase text-slate-400">Delivered Bespoke</span>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  {orders.filter((o) => o.status === 'delivered').length}
                </p>
                <span className="text-xs text-slate-500 mt-1 block">Fulfilled orders</span>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
                Assigned Operational Shortcuts
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {hasPerm('orders') && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-left transition-all group cursor-pointer"
                  >
                    <Package className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Manage Orders</span>
                    <span className="text-[10px] text-slate-400">Update stitching pipeline</span>
                  </button>
                )}

                {(hasPerm('users') || hasPerm('customers')) && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('customers')}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-left transition-all group cursor-pointer"
                  >
                    <Users className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Customers</span>
                    <span className="text-[10px] text-slate-400">Customer directory</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('idcard')}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left transition-all group cursor-pointer"
                >
                  <Shield className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs block text-slate-900 dark:text-white">Security ID Card</span>
                  <span className="text-[10px] text-slate-400">View / download badge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition-all group cursor-pointer"
                >
                  <User className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs block text-slate-900 dark:text-white">My Profile</span>
                  <span className="text-[10px] text-slate-400">Settings &amp; photo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: ORDERS ================= */}
        {activeTab === 'orders' && hasPerm('orders') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Order Management ({filteredOrders.length})
                </h2>
                <p className="text-xs text-slate-500">Live order progression and doorstep measurements.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order ID or customer..."
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="stitching">Stitching</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>

                <button
                  type="button"
                  onClick={loadOrders}
                  className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 cursor-pointer"
                  title="Refresh Orders"
                >
                  <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${ordersLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3">Order ID</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Tailor</th>
                      <th className="px-5 py-3">Garment</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400">
                          No orders matching the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-5 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                            #{String(order._id).slice(-6).toUpperCase()}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {order.user?.name || 'Customer'}
                            </span>
                            <span className="text-[10px] text-slate-400">{order.user?.phone || order.user?.email}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {order.tailor?.name || 'Tailor Partner'}
                            </span>
                            <span className="text-[10px] text-slate-400">{order.tailor?.city || 'Delhi'}</span>
                          </td>
                          <td className="px-5 py-3.5 font-semibold">
                            {order.service?.name || order.garmentType || 'Bespoke Suit'}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                            ₹{order.price || order.totalAmount || 1299}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : order.status === 'in_progress' || order.status === 'stitching'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {order.status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-1">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold py-1 px-2 outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="in_progress">In Progress</option>
                              <option value="stitching">Stitching</option>
                              <option value="quality_check">Quality Check</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: CUSTOMERS ================= */}
        {activeTab === 'customers' && (hasPerm('users') || hasPerm('customers')) && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Customer Records</h2>
                <p className="text-xs text-slate-500">View customer accounts and activity history.</p>
              </div>
              <button
                type="button"
                onClick={loadCustomers}
                className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${customersLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold uppercase text-slate-400 border-b">
                  <tr>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{String(c._id).slice(-6)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="block">{c.email}</span>
                        <span className="text-slate-400 text-[10px]">{c.phone || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-3.5">{c.city || 'Delhi NCR'}</td>
                      <td className="px-5 py-3.5 font-mono text-[10px] uppercase font-bold text-slate-500">{c.role}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {c.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: TAILORS ================= */}
        {activeTab === 'tailors' && hasPerm('tailors') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Tailor Partners</h2>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold uppercase text-slate-400 border-b">
                  <tr>
                    <th className="px-5 py-3">Tailor Name</th>
                    <th className="px-5 py-3">Shop / Atelier</th>
                    <th className="px-5 py-3">City</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tailors.map((t) => (
                    <tr key={t._id}>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{t.name}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-300">{t.shopName || `${t.name}'s Studio`}</td>
                      <td className="px-5 py-3.5">{t.city || 'Delhi'}</td>
                      <td className="px-5 py-3.5 font-bold text-amber-500">★ {t.ratingAverage || '4.9'}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          ✓ Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: SERVICES ================= */}
        {activeTab === 'services' && hasPerm('services') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Services &amp; Tailoring Catalog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {services.map((s) => (
                <div key={s._id} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-blue-600">{s.category}</span>
                  <h3 className="font-black text-base text-slate-900 dark:text-white mt-1">{s.name}</h3>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">₹{s.price}</p>
                  <span className="text-xs text-slate-500 mt-1 block">Turnaround: {s.turnaroundDays || 7} days</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: PAYMENTS ================= */}
        {activeTab === 'payments' && hasPerm('payments') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Payment &amp; COD Verification</h2>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold uppercase text-slate-400 border-b">
                  <tr>
                    <th className="px-5 py-3">Transaction</th>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600">#{String(p._id).slice(-6)}</td>
                      <td className="px-5 py-3.5 font-bold">{p.user?.name || 'Customer'}</td>
                      <td className="px-5 py-3.5 uppercase font-mono text-[10px]">{p.paymentMethod || 'UPI'}</td>
                      <td className="px-5 py-3.5 font-bold">₹{p.amount}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {p.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: MY PROFILE ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card View */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col items-center text-center">
                <div className="relative group">
                  <img
                    src={photo}
                    alt={user?.name}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-600/30 shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoModalOpen(true)}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-500 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="mt-4 text-xl font-black text-slate-900 dark:text-white">{user?.name}</h3>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{designation}</p>
                <span className="text-xs text-slate-500 mt-0.5">{department}</span>

                <div className="mt-6 w-full space-y-2.5 text-xs text-left bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Employee ID</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{employeeId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Unique Security No</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{uniqueNo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Work Email</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Role</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-bold uppercase">{user?.role}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Account Status</span>
                    <span className="font-bold text-emerald-600">✓ Operational Active</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(true)}
                  className="mt-5 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Profile Photo</span>
                </button>
              </div>

              {/* Edit Personal Information & Change Password */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information Form */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-500 mb-5">
                    Update your official contact phone and address.
                  </p>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Contact Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+91 9876543210"
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          City / Operating Base
                        </label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          placeholder="Delhi NCR"
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          value={profileForm.pincode}
                          onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                          placeholder="110001"
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Residential / Operational Address
                      </label>
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        placeholder="House / Street / Area"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password Form */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-4 h-4 text-amber-500" />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Security &amp; Password
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-5">
                    Update your account password securely.
                  </p>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="Min 6 characters"
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Repeat new password"
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Key className="w-4 h-4" />
                        <span>{passwordSaving ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: MY ID CARD ================= */}
        {activeTab === 'idcard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-extrabold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>TailorWala Official Digital ID Card</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Official Digital Identity Badge
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your authenticated credentials, anti-fraud QR code, and downloadable high-resolution badge.
              </p>
            </div>

            <div className="flex justify-center">
              <DigitalIdCard user={user} type="employee" embedded={true} />
            </div>
          </div>
        )}

        {/* ================= TAB: NOTIFICATIONS ================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Operational Notifications</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Permissions Synced</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Your assigned module access permissions have been verified by Super Admin.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Digital Security ID Badge Active</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Your security badge #{uniqueNo} is live on the public QR verification registry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Portal Settings &amp; Preferences</h2>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Session Security</h4>
                  <p className="text-[11px] text-slate-500">Active session token and role authentication</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600">Active</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Emergency Support Hotline</h4>
                  <p className="text-[11px] text-slate-500">Contact platform administrator</p>
                </div>
                <span className="text-xs font-bold text-blue-600">+91 8789682127</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= PHOTO UPLOAD MODAL ================= */}
      <PhotoUploadModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        currentPhoto={user?.avatar}
        onPhotoUpdated={() => {
          // Toast and update handled inside PhotoUploadModal
        }}
      />
    </div>
  )
}

export default EmployeeDashboard
