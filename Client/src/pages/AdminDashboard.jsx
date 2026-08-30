import React, { useEffect, useState, useCallback, useId } from 'react'
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  Scissors,
  Users,
  ShoppingBag,
  Ticket,
  Star,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Banknote,
  Smartphone,
  QrCode,
  Shield,
  Download,
  Copy,
  UserCog,
  FileText,
  Truck,
  Shirt,
  X,
  Lock,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  Pencil,
  Printer,
  Sparkles,
  RotateCcw,
  Key,
  Check,
} from 'lucide-react'
import { apiGet, apiPatch, apiPost, apiPut, apiDelete } from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import ImageInputWithUpload from '../components/ImageInputWithUpload.jsx'

const ALL_PERMISSION_KEYS = [
  { key: 'dashboard', label: 'Dashboard & Overview' },
  { key: 'users', label: 'User & Customer Management' },
  { key: 'tailors', label: 'Tailor Partner Moderation' },
  { key: 'orders', label: 'Orders & Booking Pipeline' },
  { key: 'payments', label: 'Payments & COD Verification' },
  { key: 'services', label: 'Services & Cloth Catalog' },
  { key: 'reviews', label: 'Review Moderation' },
  { key: 'coupons', label: 'Discounts & Coupons' },
  { key: 'payment_settings', label: 'Payment Account & Gateways' },
  { key: 'delivery_settings', label: 'Delivery Zones & Pincodes' },
  { key: 'employees', label: 'Employee Accounts (Super Admin)' },
  { key: 'activity_logs', label: 'Audit Activity Logs' },
]

export function AdminDashboard() {
  const codeId = useId()
  const titleId = useId()
  const discountTypeId = useId()
  const discountValId = useId()
  const minOrderId = useId()
  const maxDiscountId = useId()
  const deliveryChargeId = useId()
  const codChargeId = useId()
  const homeVisitFeeId = useId()
  const minOrderAmountId = useId()
  const maxCodAmountId = useId()
  const taxRateId = useId()
  const platformCommId = useId()

  const { user } = useAuth()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [tailors, setTailors] = useState([])
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [settingsForm, setSettingsForm] = useState({
    codEnabled: true,
    upiEnabled: true,
    cardEnabled: true,
    qrEnabled: true,
    deliveryCharge: 49,
    expressDeliveryCharge: 149,
    standardDeliveryDays: 7,
    expressDeliveryDays: 3,
    codCharge: 0,
    homeVisitFee: 99,
    minOrderAmount: 199,
    maxCodAmount: 10000,
    taxRatePercent: 0,
    platformCommissionPercent: 15,
    deliveryZones: [],
    servicedPincodes: [],
  })
  const [reviews, setReviews] = useState([])
  const [coupons, setCoupons] = useState([])
  const [employees, setEmployees] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [servicesList, setServicesList] = useState([])
  const [paymentAccount, setPaymentAccount] = useState({
    businessName: 'TailorWala Bespoke Services',
    accountHolderName: 'TailorWala Enterprise Pvt Ltd',
    bankName: 'HDFC Bank',
    accountNumber: '•••• •••• 9184',
    ifscCode: 'HDFC0001234',
    upiId: 'tailorwala@icici',
    businessPhone: '+91 8789682127',
    businessEmail: 'billing@tailorwala.com',
    qrCodeUrl: '',
  })
  const [isEditingAccountNumber, setIsEditingAccountNumber] = useState(false)
  const [loading, setLoading] = useState(true)

  // Payment filters
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [paymentSearch, setPaymentSearch] = useState('')

  // Employee search and filter states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    designation: 'Operations Associate',
    department: 'Order Fulfillment',
    permissions: ['dashboard', 'orders', 'tailors', 'services'],
    customPassword: '',
    mustChangePassword: true,
    avatar: '',
  })
  const [createdCredentialsModal, setCreatedCredentialsModal] = useState(null)
  const [showNewEmpPassword, setShowNewEmpPassword] = useState(false)
  const [showEditEmpPassword, setShowEditEmpPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetPassMustChange, setResetPassMustChange] = useState(true)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeeDeptFilter, setEmployeeDeptFilter] = useState('')
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState('')
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [editingPermissionsModal, setEditingPermissionsModal] = useState(null)
  const [resetPassModal, setResetPassModal] = useState(null)
  const [newPasswordValue, setNewPasswordValue] = useState('')
  const [selectedIdCard, setSelectedIdCard] = useState(null)
  const [idCardEditMode, setIdCardEditMode] = useState(false)

  // Audit Logs filter states
  const [logEmployeeFilter, setLogEmployeeFilter] = useState('')
  const [logModuleFilter, setLogModuleFilter] = useState('')
  const [logSearch, setLogSearch] = useState('')

  // Service Modal
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'Men',
    price: 999,
    discountPrice: 849,
    turnaroundDays: 5,
    description: '',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    inStock: true,
  })

  // New Coupon Form
  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 500,
    maxDiscount: 500,
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, uRes, tRes, bRes, pRes, setRes, rRes, cRes, paRes, empRes, logRes, srvRes] =
        await Promise.allSettled([
          apiGet('/admin/stats'),
          apiGet('/admin/users'),
          apiGet('/admin/tailors'),
          apiGet('/admin/bookings'),
          apiGet('/admin/payments'),
          apiGet('/admin/settings'),
          apiGet('/admin/reviews'),
          apiGet('/admin/coupons'),
          apiGet('/admin/payment-account'),
          apiGet('/admin/employees'),
          apiGet('/admin/activity-logs'),
          apiGet('/admin/services'),
        ])

      if (sRes.status === 'fulfilled') setStats(sRes.value?.overview || sRes.value)
      if (uRes.status === 'fulfilled') setUsers(uRes.value?.users || uRes.value?.data || [])
      if (tRes.status === 'fulfilled') setTailors(tRes.value?.tailors || tRes.value?.data || [])
      if (bRes.status === 'fulfilled') setBookings(bRes.value?.bookings || bRes.value?.data || [])
      if (pRes.status === 'fulfilled') setPayments(pRes.value?.payments || pRes.value?.data || [])
      if (setRes.status === 'fulfilled' && setRes.value?.settings) {
        setSettingsForm(setRes.value.settings)
      }
      if (rRes.status === 'fulfilled') setReviews(rRes.value?.reviews || rRes.value?.data || [])
      if (cRes.status === 'fulfilled') setCoupons(cRes.value?.coupons || cRes.value?.data || [])
      if (paRes.status === 'fulfilled' && paRes.value?.data) {
        setPaymentAccount(paRes.value.data)
      }
      if (empRes.status === 'fulfilled') setEmployees(empRes.value?.employees || empRes.value?.data || [])
      if (logRes.status === 'fulfilled') setActivityLogs(logRes.value?.logs || logRes.value?.data || [])
      if (srvRes.status === 'fulfilled') setServicesList(srvRes.value?.services || srvRes.value?.data || [])
    } catch (err) {
      error(err.message || 'Failed to load admin datasets')
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleApproveTailor = async (tailorId, isApproved, isVerified) => {
    try {
      await apiPatch(`/admin/tailors/${tailorId}`, { isApproved, isVerified })
      success(`Tailor status updated`)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to update tailor status')
    }
  }

  const handleToggleUserActive = async (targetUser) => {
    if (targetUser.role === 'super_admin' || targetUser.email === 'admin@tailorwala.com') {
      error('Security Rule: Super Admin accounts cannot be suspended or deactivated.')
      return
    }

    try {
      await apiPatch(`/admin/users/${targetUser._id}`, { isActive: !targetUser.isActive })
      success(`User ${!targetUser.isActive ? 'activated' : 'deactivated'}`)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to update user status')
    }
  }

  const handleMarkPaymentPaid = async (paymentId) => {
    try {
      await apiPut(`/admin/payments/${paymentId}/verify-cod`, {})
      success('Payment marked as Paid')
      loadData()
    } catch (err) {
      error(err.message || 'Failed to update payment status')
    }
  }

  const handleRefundPayment = async (paymentId) => {
    try {
      await apiPost(`/admin/payments/${paymentId}/refund`, { reason: 'Admin initiated refund' })
      success('Refund processed successfully')
      loadData()
    } catch (err) {
      error(err.message || 'Failed to refund payment')
    }
  }

  const handleUpdatePaymentStatus = async (paymentId, status) => {
    try {
      await apiPatch(`/admin/payments/${paymentId}/status`, { status })
      success(`Payment status updated to '${status}'`)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to update payment status')
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      await apiPut('/admin/settings', settingsForm)
      success('Platform system & delivery settings updated successfully')
      loadData()
    } catch (err) {
      error(err.message || 'Failed to update settings')
    }
  }

  const handleSavePaymentAccount = async (e) => {
    e.preventDefault()
    try {
      await apiPost('/admin/payment-account', paymentAccount)
      success('Business receiving payment account and QR updated successfully!')
      setIsEditingAccountNumber(false)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to save payment account')
    }
  }

  const handleCreateEmployee = async (e) => {
    e.preventDefault()
    try {
      const res = await apiPost('/admin/employees', employeeForm)
      success(res.message || 'Employee account created!')
      setShowEmployeeModal(false)
      if (res.data?.temporaryPassword) {
        setCreatedCredentialsModal({
          name: res.data.name,
          employeeId: res.data.employeeId,
          email: res.data.email,
          password: res.data.temporaryPassword,
          designation: res.data.designation,
        })
      }
      setEmployeeForm({
        name: '',
        email: '',
        phone: '',
        employeeId: '',
        designation: 'Operations Associate',
        department: 'Order Fulfillment',
        permissions: ['dashboard', 'orders', 'tailors', 'services'],
        customPassword: '',
        mustChangePassword: true,
        avatar: '',
      })
      setShowNewEmpPassword(false)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to create employee')
    }
  }

  const handleUpdateEmployeeDetails = async (e) => {
    e.preventDefault()
    if (!editingEmployee) return
    try {
      await apiPatch(`/admin/employees/${editingEmployee._id}`, editingEmployee)
      success(`Employee ${editingEmployee.name} updated successfully!`)
      setEditingEmployee(null)
      setShowEditEmpPassword(false)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to update employee details')
    }
  }

  const handleUpdateEmployeePermissions = async (empId, newPermissions) => {
    try {
      await apiPatch(`/admin/employees/${empId}`, { permissions: newPermissions })
      success('Employee permissions updated successfully!')
      setEditingPermissionsModal(null)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to update permissions')
    }
  }

  const handleToggleEmployeeActive = async (emp) => {
    try {
      const nextStatus = !emp.isActive
      await apiPatch(`/admin/employees/${emp._id}`, { isActive: nextStatus })
      success(`Employee ${emp.name} ${nextStatus ? 'Activated' : 'Suspended'}`)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to update employee status')
    }
  }

  const handleCustomResetPassword = async (e) => {
    e.preventDefault()
    if (!resetPassModal || !newPasswordValue || newPasswordValue.length < 6) {
      error('Password must be at least 6 characters')
      return
    }
    try {
      const res = await apiPost(`/admin/employees/${resetPassModal._id}/reset-password`, {
        customPassword: newPasswordValue,
        mustChangePassword: resetPassMustChange,
      })
      success(`Password updated for ${resetPassModal.name}!`)
      setResetPassModal(null)
      setNewPasswordValue('')
      setShowResetPassword(false)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to set employee password')
    }
  }

  const handleToggleIdCardStatus = async (userObj, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'suspended' : 'active'
      await apiPatch(`/admin/employees/${userObj._id}`, { idCardStatus: nextStatus })
      success(`ID Card status updated to ${nextStatus.toUpperCase()}`)
      if (selectedIdCard) {
        setSelectedIdCard((prev) => ({
          ...prev,
          item: { ...prev.item, idCardStatus: nextStatus },
        }))
      }
      loadData()
    } catch (err) {
      error(err.message || 'Failed to update ID card status')
    }
  }

  const handleDeleteEmployee = async (empId) => {
    if (!window.confirm('Are you sure you want to remove this employee account?')) return
    try {
      await apiDelete(`/admin/employees/${empId}`)
      success('Employee removed successfully.')
      loadData()
    } catch (err) {
      error(err.message || 'Failed to delete employee')
    }
  }

  const handleResetEmpPassword = async (empId) => {
    try {
      const res = await apiPost(`/admin/employees/${empId}/reset-password`, {})
      success(`Password reset! New Temp Password: ${res.temporaryPassword}`)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to reset employee password')
    }
  }

  const handleCreateService = async (e) => {
    e.preventDefault()
    try {
      await apiPost('/admin/services', serviceForm)
      success('Service item added to catalog!')
      setShowServiceModal(false)
      loadData()
    } catch (err) {
      error(err.message || 'Failed to add service')
    }
  }

  const handleDeleteService = async (serviceId) => {
    try {
      await apiDelete(`/admin/services/${serviceId}`)
      success('Service removed.')
      loadData()
    } catch (err) {
      error(err.message || 'Failed to delete service')
    }
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    try {
      await apiPost('/admin/coupons', couponForm)
      success('Coupon created successfully')
      setCouponForm({
        code: '',
        title: '',
        discountType: 'percentage',
        discountValue: 15,
        minOrderValue: 500,
        maxDiscount: 500,
      })
      loadData()
    } catch (err) {
      error(err.message || 'Failed to create coupon')
    }
  }

  const handleDeleteCoupon = async (id) => {
    try {
      await apiDelete(`/admin/coupons/${id}`)
      success('Coupon deleted')
      loadData()
    } catch (err) {
      error(err.message || 'Failed to delete coupon')
    }
  }

  const handleDeleteReview = async (id) => {
    try {
      await apiDelete(`/admin/reviews/${id}`)
      success('Review removed')
      loadData()
    } catch (err) {
      error(err.message || 'Failed to remove review')
    }
  }

  const filteredPayments = payments.filter((p) => {
    const matchStatus = paymentStatusFilter ? p.status === paymentStatusFilter : true
    const matchSearch = paymentSearch
      ? (p.transactionId || '').toLowerCase().includes(paymentSearch.toLowerCase()) ||
        (p.user?.name || '').toLowerCase().includes(paymentSearch.toLowerCase()) ||
        (p.user?.email || '').toLowerCase().includes(paymentSearch.toLowerCase())
      : true
    return matchStatus && matchSearch
  })

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = employeeSearch
      ? (emp.name || '').toLowerCase().includes(employeeSearch.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(employeeSearch.toLowerCase()) ||
        (emp.employeeId || '').toLowerCase().includes(employeeSearch.toLowerCase()) ||
        (emp.employeeDesignation || '').toLowerCase().includes(employeeSearch.toLowerCase())
      : true
    const matchDept = employeeDeptFilter ? emp.department === employeeDeptFilter : true
    const matchStatus =
      employeeStatusFilter === 'active'
        ? emp.isActive
        : employeeStatusFilter === 'suspended'
        ? !emp.isActive
        : employeeStatusFilter === 'pending'
        ? emp.mustChangePassword
        : true
    return matchSearch && matchDept && matchStatus
  })

  const filteredLogs = activityLogs.filter((log) => {
    const matchEmp = logEmployeeFilter
      ? (log.employeeId || '').toLowerCase().includes(logEmployeeFilter.toLowerCase()) ||
        (log.userName || '').toLowerCase().includes(logEmployeeFilter.toLowerCase())
      : true
    const matchModule = logModuleFilter
      ? (log.action || '').toLowerCase().includes(logModuleFilter.toLowerCase()) ||
        (log.target || '').toLowerCase().includes(logModuleFilter.toLowerCase())
      : true
    const matchSearch = logSearch
      ? (log.action || '').toLowerCase().includes(logSearch.toLowerCase()) ||
        (log.userName || '').toLowerCase().includes(logSearch.toLowerCase()) ||
        (log.target || '').toLowerCase().includes(logSearch.toLowerCase()) ||
        (log.employeeId || '').toLowerCase().includes(logSearch.toLowerCase())
      : true
    return matchEmp && matchModule && matchSearch
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, count: null },
    { id: 'payments', label: 'Payments & COD', icon: CreditCard, count: stats?.pendingCount || payments.length },
    { id: 'payment_account', label: 'Payment Account & QR', icon: QrCode, count: null },
    { id: 'delivery_settings', label: 'Delivery Management', icon: Truck, count: null },
    { id: 'employees', label: 'Employees & RBAC', icon: UserCog, count: employees.length },
    { id: 'services', label: 'Services Catalog', icon: Shirt, count: servicesList.length },
    { id: 'activity_logs', label: 'Audit Logs', icon: FileText, count: activityLogs.length },
    { id: 'tailors', label: 'Tailor Partners', icon: Scissors, count: tailors.length },
    { id: 'users', label: 'Users & Customers', icon: Users, count: users.length },
    { id: 'bookings', label: 'Master Orders', icon: ShoppingBag, count: bookings.length },
    { id: 'coupons', label: 'Coupons', icon: Ticket, count: coupons.length },
    { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
    { id: 'settings', label: 'Platform Fees', icon: Settings, count: null },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Admin Header */}
      <header className="border-b border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-600/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  TailorWala Admin &amp; Management Portal
                </h1>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 uppercase">
                  {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'employee' ? 'Employee' : 'Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name} ({user?.email})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
                  <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    ₹{(stats?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Platform Gross Order Volume</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Commission (15%)</span>
                  <div className="rounded-2xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                    ₹{(stats?.platformCommission || 0).toLocaleString()}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Net Platform Earnings</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Orders Delivered</span>
                  <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {stats?.completedBookings || 0}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Out of {stats?.totalBookings || 0} bookings</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Artisans</span>
                  <div className="rounded-2xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/50">
                    <Scissors className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {stats?.activeTailorProfiles || tailors.length}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Verified Tailor Workshops</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PAYMENTS & COD ================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by transaction ID, customer..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                {['', 'paid', 'pending', 'refunded'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setPaymentStatusFilter(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                      paymentStatusFilter === st
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {st || 'All'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4">Transaction / Order</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        {p.transactionId || p._id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 dark:text-white">{p.user?.name || 'Customer'}</span>
                        <span className="block text-[10px] text-slate-400">{p.user?.email}</span>
                      </td>
                      <td className="px-6 py-4 uppercase font-bold text-slate-600 dark:text-slate-400">
                        {p.paymentMethod || 'Online'}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                        ₹{p.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            p.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : p.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        {p.status === 'pending' && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(p._id, 'paid')}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Mark Received / Paid
                          </button>
                        )}
                        {p.status === 'paid' && (
                          <>
                            <button
                              onClick={() => handleRefundPayment(p._id)}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1 text-[11px] font-bold"
                            >
                              Refund
                            </button>
                            <button
                              onClick={() => handleUpdatePaymentStatus(p._id, 'returned')}
                              className="inline-flex items-center gap-1 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 px-2.5 py-1 text-[11px] font-bold"
                            >
                              Return
                            </button>
                          </>
                        )}
                        {p.status === 'refunded' && (
                          <>
                            <button
                              onClick={() => handleUpdatePaymentStatus(p._id, 'paid')}
                              className="inline-flex items-center gap-1 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 px-2.5 py-1 text-[11px] font-bold"
                            >
                              Cancel Refund (Revert)
                            </button>
                            <button
                              onClick={() => handleUpdatePaymentStatus(p._id, 'returned')}
                              className="inline-flex items-center gap-1 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 px-2.5 py-1 text-[11px] font-bold"
                            >
                              Return
                            </button>
                          </>
                        )}
                        {p.status === 'returned' && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(p._id, 'paid')}
                            className="inline-flex items-center gap-1 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 px-2.5 py-1 text-[11px] font-bold"
                          >
                            Cancel Return (Revert)
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PAYMENT ACCOUNT & QR ================= */}
        {activeTab === 'payment_account' && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Business Payment Receiving Account</h3>
                  <p className="text-xs text-slate-500">Configure business bank receiving details and UPI ID for customer QR code generation.</p>
                </div>
              </div>

              <form onSubmit={handleSavePaymentAccount} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={paymentAccount.businessName || ''}
                      onChange={(e) => setPaymentAccount({ ...paymentAccount, businessName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={paymentAccount.accountHolderName || ''}
                      onChange={(e) => setPaymentAccount({ ...paymentAccount, accountHolderName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={paymentAccount.bankName || ''}
                      onChange={(e) => setPaymentAccount({ ...paymentAccount, bankName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Bank Account Number
                      </label>
                      {isEditingAccountNumber ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingAccountNumber(false)
                            setPaymentAccount((prev) => ({ ...prev, accountNumber: '' }))
                          }}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingAccountNumber(true)
                            setPaymentAccount((prev) => ({ ...prev, accountNumber: '', accountNumberMasked: '' }))
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit / Change</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={
                        isEditingAccountNumber
                          ? (paymentAccount.accountNumber ?? '')
                          : (paymentAccount.accountNumber || paymentAccount.accountNumberMasked || '')
                      }
                      onChange={(e) => {
                        setIsEditingAccountNumber(true)
                        setPaymentAccount({
                          ...paymentAccount,
                          accountNumber: e.target.value,
                          accountNumberMasked: '',
                        })
                      }}
                      onFocus={() => {
                        if (!isEditingAccountNumber && paymentAccount.accountNumberMasked) {
                          setIsEditingAccountNumber(true)
                          setPaymentAccount({
                            ...paymentAccount,
                            accountNumber: '',
                            accountNumberMasked: '',
                          })
                        }
                      }}
                      placeholder={isEditingAccountNumber ? "Enter new full bank account number" : "•••• •••• 9184"}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isEditingAccountNumber
                        ? 'Type the complete new account number and click "Save Payment Account".'
                        : 'Currently masked. Click field or "Edit / Change" to enter a new account number.'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={paymentAccount.ifscCode || ''}
                      onChange={(e) => setPaymentAccount({ ...paymentAccount, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Primary Business UPI ID</label>
                    <input
                      type="text"
                      value={paymentAccount.upiId || ''}
                      onChange={(e) => setPaymentAccount({ ...paymentAccount, upiId: e.target.value.toLowerCase() })}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold font-mono text-blue-600 dark:text-blue-400 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Save Payment Account
                  </button>
                </div>
              </form>
            </div>

            {/* QR Code Preview Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase text-slate-400 mb-2">Live Dynamic QR Preview</span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">{paymentAccount.businessName || 'TailorWala'}</h4>

              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 dark:border-slate-700 shadow-md mb-4">
                <img
                  src={
                    paymentAccount.qrCodeUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      `upi://pay?pa=${paymentAccount.upiId || 'tailorwala@icici'}&pn=${encodeURIComponent(
                        paymentAccount.businessName || 'TailorWala',
                      )}&cu=INR`,
                    )}`
                  }
                  alt="Business UPI QR"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>{paymentAccount.upiId || 'tailorwala@icici'}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(paymentAccount.upiId || 'tailorwala@icici')
                    success('UPI ID copied to clipboard!')
                  }}
                  className="p-1 hover:text-blue-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  window.open(paymentAccount.qrCodeUrl, '_blank')
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-800 dark:text-white"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 4: DELIVERY SETTINGS ================= */}
        {activeTab === 'delivery_settings' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Delivery Zones &amp; Serviceability</h3>
                <p className="text-xs text-slate-500">Configure standard &amp; express charges, turnaround days, and active pincodes.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Standard Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryCharge}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryCharge: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Express Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.expressDeliveryCharge || 149}
                    onChange={(e) => setSettingsForm({ ...settingsForm, expressDeliveryCharge: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Standard Delivery Days</label>
                  <input
                    type="number"
                    value={settingsForm.standardDeliveryDays || 7}
                    onChange={(e) => setSettingsForm({ ...settingsForm, standardDeliveryDays: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Express Turnaround Days</label>
                  <input
                    type="number"
                    value={settingsForm.expressDeliveryDays || 3}
                    onChange={(e) => setSettingsForm({ ...settingsForm, expressDeliveryDays: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-500 block mb-2">Active Serviceable Pincodes (Meerut, Delhi, Ghaziabad)</span>
                <div className="flex flex-wrap gap-2">
                  {(settingsForm.servicedPincodes || ['110001', '110006', '110016', '201001', '201002', '250001', '250002']).map(
                    (pin) => (
                      <span key={pin} className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border text-xs font-mono font-bold">
                        {pin}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Delivery Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 5: EMPLOYEES & RBAC ================= */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            {/* 1. Employee Overview Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">👥 Total Staff</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{employees.length}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Registered staff</span>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">🟢 Active</span>
                <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {employees.filter((e) => e.isActive).length}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Operational</span>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs dark:border-rose-950 dark:bg-rose-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">🔴 Suspended</span>
                <p className="mt-1 text-2xl font-black text-rose-700 dark:text-rose-300">
                  {employees.filter((e) => !e.isActive).length}
                </p>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Access revoked</span>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs dark:border-amber-950 dark:bg-amber-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">🕐 Pending Setup</span>
                <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300">
                  {employees.filter((e) => e.mustChangePassword).length}
                </p>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">First login pending</span>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-xs dark:border-purple-950 dark:bg-purple-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">🔐 Admins/Lead</span>
                <p className="mt-1 text-2xl font-black text-purple-700 dark:text-purple-300">
                  {users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length}
                </p>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">System Directors</span>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs dark:border-blue-950 dark:bg-blue-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">🧑‍💻 Staff Roles</span>
                <p className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-300">{employees.length}</p>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Assigned rights</span>
              </div>
            </div>

            {/* 2. Search, Filters & Add Employee Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="flex flex-1 flex-wrap gap-2.5 max-w-2xl w-full">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, employee ID..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <select
                  value={employeeDeptFilter}
                  onChange={(e) => setEmployeeDeptFilter(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">All Departments</option>
                  <option value="Order Fulfillment">Order Fulfillment</option>
                  <option value="Tailor Operations">Tailor Operations</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Platform Security">Platform Security</option>
                  <option value="Operations">Operations</option>
                </select>

                <div className="flex gap-1">
                  {['', 'active', 'suspended', 'pending'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEmployeeStatusFilter(st)}
                      className={`rounded-xl px-2.5 py-1 text-[11px] font-bold capitalize transition-all ${
                        employeeStatusFilter === st
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {st || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowEmployeeModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            </div>

            {/* 3. Comprehensive Employee Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5">Employee ID</th>
                    <th className="px-5 py-3.5">Department &amp; Role</th>
                    <th className="px-5 py-3.5">Permissions</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Last Login</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt=""
                            className="h-8 w-8 rounded-full bg-slate-100 object-cover ring-2 ring-blue-500/20 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{emp.name}</span>
                            <span className="text-[10px] text-slate-400">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {emp.employeeId || 'TW-EMP'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{emp.employeeDesignation || 'Associate'}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{emp.department || 'Operations'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setEditingPermissionsModal({ ...emp })}
                          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <span>{emp.permissions?.length || 0} Modules</span>
                          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            emp.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          ● {emp.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                        {emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pending Setup'}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-1">
                        {/* ID Card Button */}
                        <button
                          onClick={() => setSelectedIdCard({ type: 'employee', item: emp })}
                          className="px-2.5 py-1 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 text-[11px] font-bold inline-flex items-center gap-1"
                          title="View & Print Security ID Card"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>ID Card</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingEmployee({ ...emp, designation: emp.employeeDesignation || 'Operations Associate' })}
                          className="px-2.5 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300 inline-flex items-center gap-1"
                          title="Edit Details & Password"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {/* Change / Reset Password */}
                        <button
                          onClick={() => {
                            setResetPassModal(emp)
                            setNewPasswordValue('')
                            setShowResetPassword(false)
                          }}
                          className="px-2.5 py-1 rounded-xl border border-amber-300 text-amber-700 bg-amber-50/60 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[11px] font-bold inline-flex items-center gap-1"
                          title="Change / Set Password"
                        >
                          <Key className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Password</span>
                        </button>

                        {/* Toggle Suspend/Active */}
                        <button
                          onClick={() => handleToggleEmployeeActive(emp)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                            emp.isActive
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {emp.isActive ? 'Suspend' : 'Activate'}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteEmployee(emp._id)}
                          className="p-1 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Delete Employee Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEmployees.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No employee accounts found matching the filter criteria.
                </div>
              )}
            </div>

            {/* Add Employee Modal */}
            {showEmployeeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setShowEmployeeModal(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Create New Employee</h3>
                  <p className="text-xs text-slate-500 mb-6">Set up Employee ID, login credentials, department, and granular permissions.</p>

                  <form onSubmit={handleCreateEmployee} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={employeeForm.name}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Work Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="ramesh@tailorwala.com"
                          value={employeeForm.email}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Custom Employee ID <span className="font-normal text-slate-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. TW-EMP-0015 (Auto if blank)"
                          value={employeeForm.employeeId}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value.toUpperCase() })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+91 9876543210"
                          value={employeeForm.phone}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Designation</label>
                        <input
                          type="text"
                          placeholder="Operations Associate"
                          value={employeeForm.designation}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Department</label>
                        <select
                          value={employeeForm.department}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="Order Fulfillment">Order Fulfillment</option>
                          <option value="Tailor Operations">Tailor Operations</option>
                          <option value="Customer Support">Customer Support</option>
                          <option value="Platform Security">Platform Security</option>
                          <option value="Operations">Operations</option>
                        </select>
                      </div>
                    </div>

                    {/* Custom Initial Password Setting */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase text-blue-900 dark:text-blue-300">
                          Initial Password <span className="font-normal text-blue-700 dark:text-blue-400">(Optional / Auto-generates)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const gen = `TW@${Math.random().toString(36).substring(2, 7)}#7`
                            setEmployeeForm({ ...employeeForm, customPassword: gen })
                            setShowNewEmpPassword(true)
                          }}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          🎲 Generate Password
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showNewEmpPassword ? 'text' : 'password'}
                          placeholder="Leave empty for auto-generated strong password"
                          value={employeeForm.customPassword}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, customPassword: e.target.value })}
                          className="w-full rounded-xl border border-blue-200 dark:border-blue-800/60 bg-white dark:bg-slate-900 py-2 pl-3 pr-10 text-xs font-mono font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewEmpPassword(!showNewEmpPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewEmpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={employeeForm.mustChangePassword}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, mustChangePassword: e.target.checked })}
                          className="rounded text-blue-600"
                        />
                        <span>Require employee to change password on first login</span>
                      </label>
                    </div>

                    {/* Employee Avatar Photo */}
                    <div>
                      <ImageInputWithUpload
                        label="Employee Profile Photo / Avatar"
                        value={employeeForm.avatar}
                        onChange={(img) => setEmployeeForm({ ...employeeForm, avatar: img })}
                        placeholder="Paste direct URL or upload image file..."
                      />
                    </div>

                    {/* Permission Matrix */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">
                          Operational Permissions
                        </span>
                        <div className="space-x-2 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() =>
                              setEmployeeForm({ ...employeeForm, permissions: ALL_PERMISSION_KEYS.map((p) => p.key) })
                            }
                            className="text-blue-600 hover:underline"
                          >
                            Select All
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => setEmployeeForm({ ...employeeForm, permissions: [] })}
                            className="text-slate-400 hover:underline"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border">
                        {ALL_PERMISSION_KEYS.map((perm) => {
                          const isChecked = employeeForm.permissions.includes(perm.key)
                          return (
                            <label key={perm.key} className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEmployeeForm({ ...employeeForm, permissions: [...employeeForm.permissions, perm.key] })
                                  } else {
                                    setEmployeeForm({
                                      ...employeeForm,
                                      permissions: employeeForm.permissions.filter((p) => p !== perm.key),
                                    })
                                  }
                                }}
                                className="rounded text-blue-600"
                              />
                              <span className="text-slate-800 dark:text-slate-200">{perm.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowEmployeeModal(false)}
                        className="px-5 py-2.5 rounded-xl border text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:bg-blue-700"
                      >
                        Create Employee Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 6: SERVICES CATALOG ================= */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Services &amp; Tailoring Catalog</h3>
                <p className="text-xs text-slate-500">Configure public stitching services, base pricing, categories, and turnaround times.</p>
              </div>
              <button
                onClick={() => setShowServiceModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {servicesList.map((srv) => (
                <div
                  key={srv._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-slate-100 relative">
                      <img src={srv.image} alt={srv.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 text-slate-900 font-bold text-[10px] shadow-sm">
                        {srv.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{srv.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{srv.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Price</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹{srv.price}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteService(srv._id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Service Modal */}
            {showServiceModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setShowServiceModal(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Add Custom Service</h3>
                  <form onSubmit={handleCreateService} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Service Name</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                        <select
                          value={serviceForm.category}
                          onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option>Men</option>
                          <option>Women</option>
                          <option>Kids</option>
                          <option>Wedding</option>
                          <option>Alteration</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <ImageInputWithUpload
                        label="Service Image / Thumbnail"
                        value={serviceForm.image}
                        onChange={(img) => setServiceForm({ ...serviceForm, image: img })}
                        placeholder="Paste direct URL or upload service image..."
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowServiceModal(false)}
                        className="px-5 py-2.5 rounded-xl border text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                      >
                        Save Service
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 7: AUDIT LOGS ================= */}
        {activeTab === 'activity_logs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Employee &amp; Admin Audit Trail</h3>
                <p className="text-xs text-slate-500">Live immutable record of platform operations, status changes, and settings adjustments.</p>
              </div>
            </div>

            {/* Audit Log Filters */}
            <div className="flex flex-wrap gap-2.5 items-center">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter logs by actor, action, or target..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <select
                value={logEmployeeFilter}
                onChange={(e) => setLogEmployeeFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="">All Staff &amp; Admins</option>
                {employees.map((e) => (
                  <option key={e._id} value={e.employeeId || e.name}>
                    {e.name} ({e.employeeId || 'STAFF'})
                  </option>
                ))}
              </select>

              <select
                value={logModuleFilter}
                onChange={(e) => setLogModuleFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="">All Action Modules</option>
                <option value="Order">Orders</option>
                <option value="Tailor">Tailors</option>
                <option value="Service">Services</option>
                <option value="Payment">Payments &amp; Refunds</option>
                <option value="Employee">Employees</option>
                <option value="Settings">System Settings</option>
              </select>
            </div>

            {/* Timeline List */}
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{log.action}</span>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                          {log.userName || log.employeeId} ({log.role})
                        </span>
                      </div>
                      {log.target && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-semibold">
                          Target: {log.target}
                        </p>
                      )}
                      {log.details && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[11px] text-slate-400 font-mono self-end sm:self-center">
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-500">IP: {log.ip || '127.0.0.1'}</span>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="p-12 text-center text-xs text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  No activity logs found matching the filter criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 8: TAILORS ================= */}
        {activeTab === 'tailors' && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4">Shop &amp; Master Name</th>
                  <th className="px-6 py-4">City / Area</th>
                  <th className="px-6 py-4">Base Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tailors.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{t.shopName || t.user?.name}</span>
                      <span className="text-[10px] text-slate-400">{t.user?.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{t.city}</span>
                      <span className="block text-[10px] text-slate-400">{t.area}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-blue-600 dark:text-blue-400">
                      ₹{t.basePrice}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.isApproved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {t.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedIdCard({ type: 'tailor', item: t })}
                        className="px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 text-xs font-bold inline-flex items-center gap-1"
                        title="View & Print Master Tailor ID"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>ID Card</span>
                      </button>
                      <button
                        onClick={() => handleApproveTailor(t._id, !t.isApproved, true)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                          t.isApproved
                            ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        {t.isApproved ? 'Suspend Partner' : 'Approve Partner'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 9: USERS ================= */}
        {activeTab === 'users' && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono">{u.email}</td>
                    <td className="px-6 py-4 font-bold uppercase text-[10px] text-blue-600 dark:text-blue-400">
                      {u.role}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'super_admin' && u.email !== 'admin@tailorwala.com' && (
                        <button
                          onClick={() => handleToggleUserActive(u)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                            u.isActive
                              ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 10: BOOKINGS ================= */}
        {activeTab === 'bookings' && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4">Order Number</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Tailor Artisan</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {b.orderNumber || b._id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{b.customer?.name || 'Customer'}</span>
                      <span className="text-[10px] text-slate-400">{b.customer?.phone}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                      {b.tailorProfile?.shopName || b.tailor?.name}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                      ₹{b.price}
                    </td>
                    <td className="px-6 py-4 font-bold uppercase text-[10px] text-slate-700 dark:text-slate-300">
                      {b.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 11: COUPONS ================= */}
        {activeTab === 'coupons' && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4">Code / Title</th>
                    <th className="px-6 py-4">Discount</th>
                    <th className="px-6 py-4">Min Order</th>
                    <th className="px-6 py-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <span className="font-mono font-black text-blue-600 dark:text-blue-400 block">{c.code}</span>
                        <span className="text-[11px] text-slate-500">{c.title}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        ₹{c.minOrderValue}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c._id)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h4 className="font-black text-slate-900 dark:text-white text-base mb-4">Create Promo Coupon</h4>
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FESTIVE50"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={couponForm.title}
                    onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                    placeholder="Flat 15% Off"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type</label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="percentage">% Percentage</option>
                      <option value="flat">₹ Flat Off</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Value</label>
                    <input
                      type="number"
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
                >
                  Create Coupon
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 12: REVIEWS ================= */}
        {activeTab === 'reviews' && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Tailor</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Review Content</th>
                  <th className="px-6 py-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{r.customer?.name || 'Customer'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{r.tailorProfile?.shopName || r.tailor?.name}</td>
                    <td className="px-6 py-4 font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {r.rating}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-sm">{r.comment}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteReview(r._id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 13: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 max-w-3xl">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Platform Fees &amp; Commission Settings</h3>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Doorstep Visit Fee (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.homeVisitFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, homeVisitFee: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Platform Commission (%)</label>
                  <input
                    type="number"
                    value={settingsForm.platformCommissionPercent}
                    onChange={(e) => setSettingsForm({ ...settingsForm, platformCommissionPercent: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all"
                >
                  Save Platform Fees
                </button>
              </div>
            </form>
          </div>
        )}
        {/* ================= MODAL: OFFICIAL ID CARD STUDIO ================= */}
        {selectedIdCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[95vh] overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedIdCard(null)
                  setIdCardEditMode(false)
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <span>Official ID Card &amp; Verification Badge</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedIdCard.type === 'employee' ? 'TailorWala Staff Identification' : 'Accredited Master Artisan Tailor ID'}
                  </p>
                </div>
              </div>

              {/* ID Card Graphical Badge Layout */}
              <div id="printable-id-card" className="mx-auto max-w-md rounded-3xl border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white shadow-2xl p-6 relative overflow-hidden my-4">
                {/* Background Security Pattern & Watermark */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Top Branding Strip */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-blue-600 text-white">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-sm tracking-wider uppercase block">TAILORWALA</span>
                      <span className="text-[9px] text-white/60 tracking-widest block uppercase font-mono">Bespoke Couture Platform</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    {selectedIdCard.type === 'employee' ? 'OFFICIAL STAFF' : 'MASTER ARTISAN'}
                  </span>
                </div>

                {/* Photo & Details Row */}
                <div className="flex gap-4 items-center">
                  <img
                    src={
                      selectedIdCard.item.avatar ||
                      selectedIdCard.item.user?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
                    }
                    alt=""
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-amber-400/40 shrink-0 bg-slate-800 shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black truncate">
                      {selectedIdCard.item.name || selectedIdCard.item.shopName || selectedIdCard.item.user?.name}
                    </h4>
                    <span className="font-mono text-xs font-bold text-amber-300 block">
                      {selectedIdCard.item.employeeId || selectedIdCard.item.tailorId || `TW-TLR-${String(selectedIdCard.item._id).slice(-6).toUpperCase()}`}
                    </span>
                    <span className="text-[11px] text-slate-300 block mt-0.5 truncate">
                      {selectedIdCard.type === 'employee'
                        ? `${selectedIdCard.item.employeeDesignation || 'Operations Staff'} • ${selectedIdCard.item.department || 'Operations'}`
                        : `${selectedIdCard.item.city || 'Delhi NCR Atelier'}`}
                    </span>
                    <span
                      className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        selectedIdCard.item.idCardStatus === 'suspended' || !selectedIdCard.item.isActive
                          ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      ● {selectedIdCard.item.idCardStatus === 'suspended' || !selectedIdCard.item.isActive ? 'SUSPENDED' : 'ACTIVE & ACCREDITED'}
                    </span>
                  </div>
                </div>

                {/* QR Code & Security Seal */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5 text-[9px] text-slate-400 font-mono">
                    <p>Issued: {new Date().getFullYear()}-VALID</p>
                    <p>Auth: TW-SAFETY-DIRECTORATE</p>
                    <p className="text-amber-300">Scan QR for Live Public Authenticity</p>
                  </div>
                  <div className="p-1.5 rounded-xl bg-white shrink-0 shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                        `${window.location.origin}/verify-id/${
                          selectedIdCard.item.employeeId ||
                          selectedIdCard.item.tailorId ||
                          selectedIdCard.item._id
                        }`,
                      )}`}
                      alt="Verification QR"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* ID Card Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print ID Badge</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleIdCardStatus(selectedIdCard.item, selectedIdCard.item.idCardStatus || 'active')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    selectedIdCard.item.idCardStatus === 'suspended'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  {selectedIdCard.item.idCardStatus === 'suspended' ? 'Re-Activate ID Badge' : 'Deactivate ID Badge'}
                </button>

                <a
                  href={`/verify-id/${selectedIdCard.item.employeeId || selectedIdCard.item.tailorId || selectedIdCard.item._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 text-white px-5 py-2 text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <span>Open Public Verification ↗</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: EDIT EMPLOYEE ================= */}
        {editingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setEditingEmployee(null)
                  setShowEditEmpPassword(false)
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Edit Employee Account</h3>
              <p className="text-xs text-slate-500 mb-6">Update employee ID, details, department, or assign a new password.</p>

              <form onSubmit={handleUpdateEmployeeDetails} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingEmployee.name}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={editingEmployee.email}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Employee ID</label>
                    <input
                      type="text"
                      required
                      value={editingEmployee.employeeId || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, employeeId: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editingEmployee.phone || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Designation</label>
                    <input
                      type="text"
                      value={editingEmployee.designation || editingEmployee.employeeDesignation || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
                    <select
                      value={editingEmployee.department || 'Order Fulfillment'}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="Order Fulfillment">Order Fulfillment</option>
                      <option value="Tailor Operations">Tailor Operations</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Platform Security">Platform Security</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>

                {/* Optional Password Update */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-amber-900 dark:text-amber-300">
                      Set New Password <span className="font-normal text-amber-700 dark:text-amber-400">(Leave blank to keep unchanged)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const gen = `TW@${Math.random().toString(36).substring(2, 7)}#7`
                        setEditingEmployee({ ...editingEmployee, customPassword: gen })
                        setShowEditEmpPassword(true)
                      }}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      🎲 Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showEditEmpPassword ? 'text' : 'password'}
                      placeholder="Enter new password (min 6 chars)"
                      value={editingEmployee.customPassword || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, customPassword: e.target.value })}
                      className="w-full rounded-xl border border-amber-200 bg-white dark:bg-slate-900 py-2 pl-3 pr-10 text-xs font-mono font-bold dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditEmpPassword(!showEditEmpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showEditEmpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <ImageInputWithUpload
                    label="Employee Photo / Avatar"
                    value={editingEmployee.avatar || ''}
                    onChange={(img) => setEditingEmployee({ ...editingEmployee, avatar: img })}
                    placeholder="Paste direct URL or upload image file..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmployee(null)
                      setShowEditEmpPassword(false)
                    }}
                    className="px-4 py-2 rounded-xl border text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: EDIT PERMISSIONS ================= */}
        {editingPermissionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditingPermissionsModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                Permissions Matrix: {editingPermissionsModal.name}
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-mono">
                Employee ID: {editingPermissionsModal.employeeId}
              </p>

              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  Select Accessible Modules
                </span>
                <div className="space-x-2 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingPermissionsModal({
                        ...editingPermissionsModal,
                        permissions: ALL_PERMISSION_KEYS.map((p) => p.key),
                      })
                    }
                    className="text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingPermissionsModal({
                        ...editingPermissionsModal,
                        permissions: [],
                      })
                    }
                    className="text-slate-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border mb-6">
                {ALL_PERMISSION_KEYS.map((perm) => {
                  const isChecked = (editingPermissionsModal.permissions || []).includes(perm.key)
                  return (
                    <label key={perm.key} className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingPermissionsModal({
                              ...editingPermissionsModal,
                              permissions: [...(editingPermissionsModal.permissions || []), perm.key],
                            })
                          } else {
                            setEditingPermissionsModal({
                              ...editingPermissionsModal,
                              permissions: (editingPermissionsModal.permissions || []).filter((p) => p !== perm.key),
                            })
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-slate-800 dark:text-slate-200">{perm.label}</span>
                    </label>
                  )
                })}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPermissionsModal(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateEmployeePermissions(editingPermissionsModal._id, editingPermissionsModal.permissions)
                  }
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: CHANGE / RESET PASSWORD ================= */}
        {resetPassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setResetPassModal(null)
                  setNewPasswordValue('')
                  setShowResetPassword(false)
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Change Password
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{resetPassModal.name} • {resetPassModal.employeeId || resetPassModal.email}</p>
                </div>
              </div>

              <form onSubmit={handleCustomResetPassword} className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-500">New Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        const gen = `TW@${Math.random().toString(36).substring(2, 7)}#7`
                        setNewPasswordValue(gen)
                        setShowResetPassword(true)
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      🎲 Generate Password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter new password (min 6 chars)"
                      value={newPasswordValue}
                      onChange={(e) => setNewPasswordValue(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-3 pr-10 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetPassMustChange}
                    onChange={(e) => setResetPassMustChange(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Require employee to update password on next login</span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetPassModal(null)
                      setNewPasswordValue('')
                      setShowResetPassword(false)
                    }}
                    className="px-4 py-2 rounded-xl border text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: CREATED EMPLOYEE CREDENTIALS ================= */}
        {createdCredentialsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setCreatedCredentialsModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shadow-xs">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Employee Account Created!
                  </h3>
                  <p className="text-xs text-slate-500">Save and share login credentials with the employee.</p>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{createdCredentialsModal.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Employee ID</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                    {createdCredentialsModal.employeeId}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Work Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{createdCredentialsModal.email}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Initial Password</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    {createdCredentialsModal.password}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `TailorWala Employee Account Credentials:
Name: ${createdCredentialsModal.name}
Employee ID: ${createdCredentialsModal.employeeId}
Email: ${createdCredentialsModal.email}
Password: ${createdCredentialsModal.password}
Sign In URL: ${window.location.origin}/auth`
                    navigator.clipboard.writeText(text)
                    success('Full employee credentials copied to clipboard!')
                  }}
                  className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Credentials</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreatedCredentialsModal(null)}
                  className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
