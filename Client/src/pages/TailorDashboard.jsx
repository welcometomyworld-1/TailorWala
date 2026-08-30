import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Scissors,
  Ruler,
  CheckSquare,
  Star,
  DollarSign,
  User,
  Shield,
  Bell,
  Settings,
  LogOut,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Save,
  Plus,
  Sparkles,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Building2,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  MessageCircle,
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  QrCode,
  Printer,
  Download,
  Check,
  X,
  Sliders,
  Send,
  Zap,
} from 'lucide-react'
import { apiGet, apiPatch, apiPost, apiPut, apiDelete } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import DigitalIdCard from '../components/DigitalIdCard.jsx'
import PhotoUploadModal from '../components/PhotoUploadModal.jsx'
import ImageInputWithUpload from '../components/ImageInputWithUpload.jsx'

const STATUS_PROGRESSION = [
  { key: 'pending', label: 'New Orders', color: 'bg-amber-500 text-white' },
  { key: 'accepted', label: 'Accepted', color: 'bg-blue-500 text-white' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-indigo-500 text-white' },
  { key: 'stitching', label: 'Stitching', color: 'bg-purple-500 text-white' },
  { key: 'quality_check', label: 'Quality Check', color: 'bg-cyan-500 text-white' },
  { key: 'ready', label: 'Ready', color: 'bg-teal-500 text-white' },
  { key: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-500 text-white' },
  { key: 'delivered', label: 'Delivered', color: 'bg-emerald-500 text-white' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-rose-500 text-white' },
]

const FABRIC_CATEGORIES = ['Cotton', 'Linen', 'Silk', 'Wool', 'Velvet', 'Denim', 'Rayon', 'Blend', 'Other']
const FABRIC_PATTERNS = ['Plain', 'Checks', 'Striped', 'Printed', 'Textured', 'Embroidered', 'Jacquard']
const GARMENT_SUITABLE_TAGS = ['Shirt', 'Pant', 'Suit', 'Kurta', 'Sherwani', 'Lehenga', 'Blouse', 'Safari', 'Blazer']

export function TailorDashboard() {
  const { user, logout, updateProfile } = useAuth()
  const { success, error, info } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [photoModalOpen, setPhotoModalOpen] = useState(false)

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Tailor Profile State
  const [tailorProfile, setTailorProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)

  // Service Modal State
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [editingServiceIndex, setEditingServiceIndex] = useState(-1)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'Men',
    price: 999,
    turnaroundDays: 5,
    description: '',
    image: '',
    isActive: true,
  })

  // Fabric Modal State
  const [fabricModalOpen, setFabricModalOpen] = useState(false)
  const [editingFabricIndex, setEditingFabricIndex] = useState(-1)
  const [fabricForm, setFabricForm] = useState({
    name: '',
    category: 'Cotton',
    color: '',
    pattern: 'Plain',
    quantityMeters: 25,
    pricePerMeter: 450,
    description: '',
    suitableFor: ['Shirt', 'Kurta'],
    badge: 'Premium',
    image: '',
    isAvailable: true,
    isVisible: true,
  })

  // Measurement modal state
  const [measuringBooking, setMeasuringBooking] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [measurementNotes, setMeasurementNotes] = useState('')
  const [measurementTemplate, setMeasurementTemplate] = useState('suit')

  // Review reply state
  const [replyingReviewId, setReplyingReviewId] = useState(null)
  const [replyText, setReplyText] = useState('')

  // Settings State
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Load Bookings
  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiGet(`/bookings/tailor${statusFilter ? `?status=${statusFilter}` : ''}`)
      setBookings(res.data || [])
    } catch (err) {
      error(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, error])

  // Load Tailor Profile
  const loadTailorProfile = useCallback(async () => {
    setProfileLoading(true)
    try {
      const res = await apiGet('/tailors/me')
      if (res.data) {
        setTailorProfile(res.data)
      }
    } catch {
      // Fallback
      setTailorProfile({
        shopName: `${user?.name || 'Artisan'}'s Bespoke Studio`,
        bio: 'Master craftsman specializing in bespoke menswear, luxury suits, and ethnic couture.',
        experienceYears: 12,
        basePrice: 299,
        city: user?.city || 'Delhi',
        area: 'Main Market',
        address: user?.address || 'Connaught Place',
        pincode: user?.pincode || '110001',
        servicesOffered: [
          { name: 'Bespoke 2-Piece Suit', category: 'Men', price: 2499, turnaroundDays: 7, isActive: true },
          { name: 'Custom Kurta Pajama', category: 'Men', price: 799, turnaroundDays: 5, isActive: true },
          { name: 'Designer Blouse / Choli', category: 'Women', price: 699, turnaroundDays: 4, isActive: true },
        ],
        fabrics: [
          {
            name: 'Pure Egyptian Giza Cotton',
            category: 'Cotton',
            color: 'Sky Blue',
            pattern: 'Checks',
            quantityMeters: 30,
            pricePerMeter: 450,
            description: 'Long-staple breathable cotton fabric perfect for crisp formal dress shirts.',
            suitableFor: ['Shirt', 'Kurta'],
            badge: '100% Organic',
            image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800',
            isAvailable: true,
            isVisible: true,
          },
          {
            name: 'Superfine Italian 120s Wool',
            category: 'Wool',
            color: 'Charcoal Grey',
            pattern: 'Plain',
            quantityMeters: 40,
            pricePerMeter: 850,
            description: 'Bespoke breathable suiting fabric with natural drape and wrinkle-resistance.',
            suitableFor: ['Suit', 'Blazer', 'Pant'],
            badge: 'Premium Italian',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
            isAvailable: true,
            isVisible: true,
          },
        ],
        workConditions: {
          homeVisitAvailable: true,
          shopVisitAvailable: true,
          customMeasurements: true,
          customStitching: true,
          expressDelivery: true,
          normalDelivery: true,
          alterationAvailable: true,
          fabricProvided: true,
          customerFabricAccepted: true,
          pickupAvailable: true,
          deliveryAvailable: true,
        },
        workingHours: { start: '09:00 AM', end: '08:30 PM', days: 'Monday - Saturday' },
        homeVisitRadiusKm: 15,
        isAvailable: true,
        serviceArea: 'Delhi NCR, Meerut, Ghaziabad',
        vacationMessage: '',
      })
    } finally {
      setProfileLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadBookings()
    loadTailorProfile()
  }, [loadBookings, loadTailorProfile])

  // Status progression updater
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await apiPatch(`/bookings/${bookingId}/status`, { status: newStatus })
      success(`Order updated to '${newStatus.replace(/_/g, ' ').toUpperCase()}'`)
      loadBookings()
    } catch (err) {
      error(err.message || 'Failed to update order status')
    }
  }

  // Measurement Modal Opener
  const handleOpenMeasureModal = (b) => {
    setMeasuringBooking(b)
    setMeasurements(
      b.measurements?.length > 0
        ? b.measurements
        : [
            { name: 'Chest / Bust', value: 40, unit: 'inch' },
            { name: 'Waist', value: 34, unit: 'inch' },
            { name: 'Shoulder', value: 18, unit: 'inch' },
            { name: 'Sleeve Length', value: 25, unit: 'inch' },
            { name: 'Garment Length', value: 30, unit: 'inch' },
            { name: 'Hip / Seat', value: 41, unit: 'inch' },
          ],
    )
    setMeasurementNotes(b.measurementNotes || '')
  }

  const handleApplyTemplate = (type) => {
    setMeasurementTemplate(type)
    if (type === 'suit') {
      setMeasurements([
        { name: 'Chest', value: 40, unit: 'inch' },
        { name: 'Waist', value: 34, unit: 'inch' },
        { name: 'Shoulder', value: 18, unit: 'inch' },
        { name: 'Sleeve Length', value: 25, unit: 'inch' },
        { name: 'Jacket Length', value: 29, unit: 'inch' },
        { name: 'Trouser Inseam', value: 31, unit: 'inch' },
        { name: 'Trouser Outseam', value: 41, unit: 'inch' },
        { name: 'Thigh', value: 24, unit: 'inch' },
        { name: 'Neck', value: 16, unit: 'inch' },
      ])
    } else if (type === 'blouse') {
      setMeasurements([
        { name: 'Bust', value: 36, unit: 'inch' },
        { name: 'Underbust', value: 30, unit: 'inch' },
        { name: 'Waist', value: 28, unit: 'inch' },
        { name: 'Front Neck Depth', value: 7, unit: 'inch' },
        { name: 'Back Neck Depth', value: 9, unit: 'inch' },
        { name: 'Shoulder', value: 14, unit: 'inch' },
        { name: 'Blouse Length', value: 14.5, unit: 'inch' },
        { name: 'Sleeve Length', value: 10, unit: 'inch' },
        { name: 'Armhole', value: 16, unit: 'inch' },
      ])
    } else if (type === 'kurta') {
      setMeasurements([
        { name: 'Chest', value: 42, unit: 'inch' },
        { name: 'Waist', value: 38, unit: 'inch' },
        { name: 'Hip', value: 44, unit: 'inch' },
        { name: 'Shoulder', value: 18.5, unit: 'inch' },
        { name: 'Sleeve Length', value: 24, unit: 'inch' },
        { name: 'Kurta Length', value: 40, unit: 'inch' },
        { name: 'Collar / Neck', value: 16.5, unit: 'inch' },
      ])
    }
  }

  const handleSaveMeasurements = async (e) => {
    e.preventDefault()
    if (!measuringBooking) return

    try {
      await apiPost(`/bookings/${measuringBooking._id}/measurements`, {
        measurements,
        measurementNotes,
      })
      success('Measurements recorded and order progressed!')
      setMeasuringBooking(null)
      loadBookings()
    } catch (err) {
      error(err.message || 'Failed to record measurements')
    }
  }

  // Profile Saver
  const handleSaveProfile = async (customPayload) => {
    setProfileSaving(true)
    try {
      const payload = customPayload || tailorProfile
      await apiPut('/tailors/profile', payload)
      success('Tailor studio changes saved successfully!')
      loadTailorProfile()
    } catch (err) {
      error(err.message || 'Failed to update tailor profile')
    } finally {
      setProfileSaving(false)
    }
  }

  // Add / Edit Service Actions
  const handleOpenAddService = () => {
    setEditingServiceIndex(-1)
    setServiceForm({
      name: '',
      category: 'Men',
      price: 999,
      turnaroundDays: 5,
      description: '',
      image: '',
      isActive: true,
    })
    setServiceModalOpen(true)
  }

  const handleOpenEditService = (srv, index) => {
    setEditingServiceIndex(index)
    setServiceForm({
      name: srv.name || '',
      category: srv.category || 'Men',
      price: srv.price || 999,
      turnaroundDays: srv.turnaroundDays || 5,
      description: srv.description || '',
      image: srv.image || '',
      isActive: srv.isActive !== false,
    })
    setServiceModalOpen(true)
  }

  const handleSaveService = (e) => {
    e.preventDefault()
    const services = [...(tailorProfile.servicesOffered || [])]
    if (editingServiceIndex >= 0) {
      services[editingServiceIndex] = serviceForm
    } else {
      services.push(serviceForm)
    }
    const updated = { ...tailorProfile, servicesOffered: services }
    setTailorProfile(updated)
    setServiceModalOpen(false)
    handleSaveProfile(updated)
  }

  const handleDeleteService = (index) => {
    if (window.confirm('Are you sure you want to remove this service?')) {
      const services = tailorProfile.servicesOffered.filter((_, i) => i !== index)
      const updated = { ...tailorProfile, servicesOffered: services }
      setTailorProfile(updated)
      handleSaveProfile(updated)
    }
  }

  // Add / Edit Fabric Actions
  const handleOpenAddFabric = () => {
    setEditingFabricIndex(-1)
    setFabricForm({
      name: '',
      category: 'Cotton',
      color: '',
      pattern: 'Plain',
      quantityMeters: 25,
      pricePerMeter: 450,
      description: '',
      suitableFor: ['Shirt', 'Kurta'],
      badge: 'Premium',
      image: '',
      isAvailable: true,
      isVisible: true,
    })
    setFabricModalOpen(true)
  }

  const handleOpenEditFabric = (fab, index) => {
    setEditingFabricIndex(index)
    setFabricForm({
      name: fab.name || '',
      category: fab.category || 'Cotton',
      color: fab.color || '',
      pattern: fab.pattern || 'Plain',
      quantityMeters: fab.quantityMeters || 25,
      pricePerMeter: fab.pricePerMeter || 450,
      description: fab.description || '',
      suitableFor: fab.suitableFor || ['Shirt'],
      badge: fab.badge || 'Premium',
      image: fab.image || '',
      isAvailable: fab.isAvailable !== false,
      isVisible: fab.isVisible !== false,
    })
    setFabricModalOpen(true)
  }

  const handleSaveFabric = (e) => {
    e.preventDefault()
    const fabrics = [...(tailorProfile.fabrics || [])]
    if (editingFabricIndex >= 0) {
      fabrics[editingFabricIndex] = fabricForm
    } else {
      fabrics.push(fabricForm)
    }
    const updated = { ...tailorProfile, fabrics }
    setTailorProfile(updated)
    setFabricModalOpen(false)
    handleSaveProfile(updated)
  }

  const handleDeleteFabric = (index) => {
    if (window.confirm('Are you sure you want to remove this fabric from your catalog?')) {
      const fabrics = tailorProfile.fabrics.filter((_, i) => i !== index)
      const updated = { ...tailorProfile, fabrics }
      setTailorProfile(updated)
      handleSaveProfile(updated)
    }
  }

  // Change Password Action
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New passwords do not match')
      return
    }
    setPasswordLoading(true)
    try {
      await apiPut('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      success('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      error(err.message || 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Computed Metrics
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const custName = (b.customer?.name || '').toLowerCase()
        const orderId = (b.orderId || b._id || '').toLowerCase()
        const serviceName = (b.service?.name || b.clothName || '').toLowerCase()
        return custName.includes(query) || orderId.includes(query) || serviceName.includes(query)
      }
      return true
    })
  }, [bookings, statusFilter, searchQuery])

  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const inProgressCount = bookings.filter((b) => ['in_progress', 'stitching', 'quality_check'].includes(b.status)).length
  const readyCount = bookings.filter((b) => b.status === 'ready').length
  const completedCount = bookings.filter((b) => b.status === 'delivered').length
  const totalGrossEarned = bookings.filter((b) => b.status === 'delivered').reduce((sum, b) => sum + (b.price || 0), 0)
  const netEarnings = Math.round(totalGrossEarned * 0.85)

  // Unique Identifiers
  const tailorId = user?.tailorId || `TW-TLR-${String(user?._id || '000123').slice(-6).toUpperCase()}`
  const uniqueNo = user?.uniqueNumber || `TLR-${String(user?._id || '982741').slice(-6).toUpperCase()}`
  const photo = user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'

  // Navigation Items
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'services', label: 'My Services', icon: Scissors },
    { id: 'fabrics', label: 'My Fabrics', icon: Layers, highlight: true },
    { id: 'measurements', label: 'Measurements', icon: Ruler },
    { id: 'work_conditions', label: 'Work Conditions', icon: CheckSquare },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'location', label: 'Location & Availability', icon: MapPin },
    { id: 'customers', label: 'Customers', icon: Phone },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'id_card', label: 'My ID Card', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Top Brand Logo */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Scissors className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Tailor<span className="text-blue-600">Wala</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                  Artisan Partner
                </span>
              </div>
            </Link>
          </div>

          {/* Tailor Mini Profile */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center gap-3">
            <div className="relative">
              <img
                src={photo}
                alt={user?.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                  tailorProfile?.isAvailable !== false ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={tailorProfile?.isAvailable !== false ? 'Online & Available' : 'On Vacation'}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</h4>
              <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold truncate">{tailorId}</p>
              <p className="text-[10px] text-slate-400 truncate">{tailorProfile?.shopName || 'Studio Master'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-260px)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : item.highlight
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WORKSPACE ================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top Greeting Banner */}
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={photo}
                  alt={user?.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-lg cursor-pointer"
                  onClick={() => setPhotoModalOpen(true)}
                  title="Click to update photo"
                />
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(true)}
                  className="absolute -bottom-1 -right-1 p-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white shadow-md cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black">
                    Namaste, {user?.name} 👋
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Verified Master
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-1 flex flex-wrap items-center gap-2 font-mono">
                  <span className="bg-white/10 px-2 py-0.5 rounded">{tailorId}</span>
                  <span>•</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded">{uniqueNo}</span>
                  <span>•</span>
                  <span className="text-white/80 font-sans font-semibold">{tailorProfile?.shopName || 'Studio'} ({tailorProfile?.city || 'Delhi'})</span>
                </p>
              </div>
            </div>

            {/* Quick Status / Vacation Switch */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...tailorProfile, isAvailable: !tailorProfile.isAvailable }
                  setTailorProfile(updated)
                  handleSaveProfile(updated)
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  tailorProfile?.isAvailable !== false
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${tailorProfile?.isAvailable !== false ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>{tailorProfile?.isAvailable !== false ? 'Accepting Orders' : 'On Vacation'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('id_card')}
                className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>My ID Badge</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= TAB 1: 🏠 DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Today's Orders</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {bookings.filter((b) => new Date(b.createdAt).toDateString() === new Date().toDateString()).length}
                </p>
                <span className="text-[10px] text-blue-500 font-bold">Live Queue</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Pending Orders</span>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
                <span className="text-[10px] text-amber-600 font-bold">Needs Acceptance</span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">In Progress</span>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{inProgressCount}</p>
                <span className="text-[10px] text-indigo-600 font-bold">Under Stitching</span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400">Ready Orders</span>
                <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{readyCount}</p>
                <span className="text-[10px] text-teal-600 font-bold">Ready for Pickup</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Completed</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</p>
                <span className="text-[10px] text-emerald-600 font-bold">Delivered</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">Net Earnings</span>
                <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">₹{netEarnings.toLocaleString()}</p>
                <span className="text-[10px] text-purple-600 font-bold">85% Share</span>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={handleOpenAddService}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition-all shadow-xs group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add New Service</h4>
                <p className="text-[10px] text-slate-400">List suits, kurtas, blouses</p>
              </button>

              <button
                onClick={handleOpenAddFabric}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition-all shadow-xs group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add Available Fabric</h4>
                <p className="text-[10px] text-slate-400">Show cottons, silks to clients</p>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left transition-all shadow-xs group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Process Orders</h4>
                <p className="text-[10px] text-slate-400">{pendingCount} pending requests</p>
              </button>

              <button
                onClick={() => setActiveTab('id_card')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left transition-all shadow-xs group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">My ID Card</h4>
                <p className="text-[10px] text-slate-400">View, Download PDF, Print</p>
              </button>
            </div>

            {/* Active Orders Quick Table */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Active Stitching Queue</h3>
                  <p className="text-xs text-slate-500">Live order pipeline awaiting work or ready for dispatch</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Orders</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold">No orders in queue yet</p>
                  <p className="text-xs">New bespoke booking requests from customers will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold uppercase">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Garment / Service</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bookings.slice(0, 6).map((b) => {
                        const statusObj = STATUS_PROGRESSION.find((s) => s.key === b.status) || { label: b.status, color: 'bg-slate-500 text-white' }
                        return (
                          <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                              #{b.orderId || b._id.slice(-6).toUpperCase()}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-900 dark:text-white block">{b.customer?.name || 'Customer'}</span>
                              <span className="text-[10px] text-slate-400">{b.customer?.phone || b.city}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{b.service?.name || b.clothName || 'Custom Stitching'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${statusObj.color}`}>
                                {statusObj.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                              ₹{b.price || 999}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id, 'accepted')}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  Accept
                                </button>
                              )}
                              {b.status === 'accepted' && (
                                <button
                                  onClick={() => handleOpenMeasureModal(b)}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  Record Fit
                                </button>
                              )}
                              {b.status === 'in_progress' && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id, 'stitching')}
                                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  Start Stitching
                                </button>
                              )}
                              {b.status === 'stitching' && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id, 'quality_check')}
                                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  Quality Check
                                </button>
                              )}
                              {b.status === 'quality_check' && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id, 'ready')}
                                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  Mark Ready
                                </button>
                              )}
                              {b.status === 'ready' && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id, 'out_for_delivery')}
                                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  Out For Delivery
                                </button>
                              )}
                              {b.status === 'out_for_delivery' && (
                                <button
                                  onClick={() => handleUpdateStatus(b._id, 'delivered')}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  Mark Delivered
                                </button>
                              )}
                              {b.status === 'delivered' && (
                                <span className="text-emerald-600 font-bold text-xs flex items-center justify-end gap-1">
                                  <Check className="w-3.5 h-3.5" /> Done
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: 📦 ORDERS PIPELINE ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Header & Status Filter Pills */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Orders &amp; Bookings Management</h3>
                  <p className="text-xs text-slate-500">Track and advance custom garments through full crafting pipeline</p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search by customer, order #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStatusFilter('')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === ''
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  All ({bookings.length})
                </button>
                {STATUS_PROGRESSION.map((s) => {
                  const count = bookings.filter((b) => b.status === s.key).length
                  const isSel = statusFilter === s.key
                  return (
                    <button
                      key={s.key}
                      onClick={() => setStatusFilter(s.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSel
                          ? `${s.color} shadow-sm`
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {s.label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Orders Cards Grid */}
            {filteredBookings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-12 text-center text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No orders match filter</h4>
                <p className="text-xs mt-1">Try switching status tabs or clear your search query.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBookings.map((b) => {
                  const statusObj = STATUS_PROGRESSION.find((s) => s.key === b.status) || { label: b.status, color: 'bg-slate-500 text-white' }
                  const custPhone = b.customer?.phone || '+91 8789682127'
                  const cleanPhone = custPhone.replace(/[^0-9]/g, '')
                  const whatsappMsg = encodeURIComponent(
                    `Namaste ${b.customer?.name || 'Customer'}, I am ${user?.name || 'Tailor'} from TailorWala regarding your order #${b.orderId || b._id.slice(-6).toUpperCase()} (${b.service?.name || b.clothName || 'Custom Stitching'}).`
                  )

                  return (
                    <div
                      key={b._id}
                      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        {/* Card Header */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg">
                            #{b.orderId || b._id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${statusObj.color}`}>
                            {statusObj.label}
                          </span>
                        </div>

                        {/* Garment Details */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {b.service?.name || b.clothName || 'Custom Bespoke Garment'}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {b.fabricName ? `Fabric: ${b.fabricName}` : 'Customer Fabric Provided'} • ₹{b.price || 999}
                          </p>
                        </div>

                        {/* Customer Info */}
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{b.customer?.name || 'Customer'}</p>
                          <p className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-blue-500" />
                            {b.customer?.phone || 'Contact via TailorWala'}
                          </p>
                          <p className="text-slate-500 text-[11px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            {b.address || b.city || 'Delhi NCR'}
                          </p>
                        </div>

                        {/* Measurements Summary */}
                        {b.measurements && b.measurements.length > 0 ? (
                          <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[11px]">
                            <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">📐 Recorded Measurements:</span>
                            <div className="flex flex-wrap gap-1.5 text-[10px]">
                              {b.measurements.map((m, idx) => (
                                <span key={idx} className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                  {m.name}: {m.value}{m.unit || '"'}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                            ⚠️ Measurements not recorded yet
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        {/* WhatsApp Contact */}
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Customer</span>
                        </a>

                        {/* Status Progression Workflow Controls */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenMeasureModal(b)}
                            className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Ruler className="w-3.5 h-3.5" />
                            <span>Fit / Sizes</span>
                          </button>

                          {b.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b._id, 'accepted')}
                              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                            >
                              Accept
                            </button>
                          )}
                          {b.status === 'accepted' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b._id, 'in_progress')}
                              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                            >
                              Start Job
                            </button>
                          )}
                          {b.status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b._id, 'stitching')}
                              className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
                            >
                              Stitching
                            </button>
                          )}
                          {b.status === 'stitching' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b._id, 'quality_check')}
                              className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer"
                            >
                              Quality Check
                            </button>
                          )}
                          {b.status === 'quality_check' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b._id, 'ready')}
                              className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer"
                            >
                              Mark Ready
                            </button>
                          )}
                          {b.status === 'ready' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b._id, 'out_for_delivery')}
                              className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}
                          {b.status === 'out_for_delivery' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b._id, 'delivered')}
                              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                            >
                              Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: 👕 MY SERVICES ================= */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">My Tailoring Services &amp; Rates</h3>
                <p className="text-xs text-slate-500">Add bespoke services, set tailoring fees and estimated delivery turnaround days</p>
              </div>
              <button
                onClick={handleOpenAddService}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            </div>

            {/* Services Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(tailorProfile?.servicesOffered || []).map((srv, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {srv.image && (
                      <img
                        src={srv.image}
                        alt={srv.name}
                        className="w-full h-36 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{srv.name}</h4>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800">
                          {srv.category}
                        </span>
                      </div>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">
                        ₹{srv.price}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {srv.description || 'Custom tailored with perfect fitting guarantee.'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {srv.turnaroundDays || 5} Days Turnaround
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${srv.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {srv.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => handleOpenEditService(srv, idx)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteService(idx)}
                      className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: 🧵 MY FABRICS / FABRIC CATALOG ================= */}
        {activeTab === 'fabrics' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Shop Fabric &amp; Cloth Catalog</h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] font-bold">
                    {(tailorProfile?.fabrics || []).length} Available Fabrics
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showcase high-quality cloths and materials in your studio so customers can order directly with your fabrics.
                </p>
              </div>
              <button
                onClick={handleOpenAddFabric}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Available Fabric</span>
              </button>
            </div>

            {/* Fabrics Grid */}
            {(tailorProfile?.fabrics || []).length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-12 text-center text-slate-400">
                <Layers className="w-12 h-12 mx-auto mb-2 opacity-30 text-indigo-500" />
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No fabrics added yet</h4>
                <p className="text-xs mt-1 max-w-md mx-auto">
                  Click "Add Available Fabric" to list premium cottons, Banarasi silks, Italian linens, and wools available in your shop.
                </p>
                <button
                  onClick={handleOpenAddFabric}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                >
                  Add First Fabric
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(tailorProfile?.fabrics || []).map((fab, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Fabric Image & Badges */}
                      <div className="aspect-[16/10] overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                        <img
                          src={fab.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'}
                          alt={fab.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-md">
                            {fab.category}
                          </span>
                          {fab.badge && (
                            <span className="px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shadow-sm">
                              ⭐ {fab.badge}
                            </span>
                          )}
                        </div>
                        <span
                          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                            fab.isAvailable !== false
                              ? 'bg-emerald-600/90 text-white'
                              : 'bg-rose-600/90 text-white'
                          }`}
                        >
                          {fab.isAvailable !== false ? '✓ In Stock' : '✕ Out of Stock'}
                        </span>
                      </div>

                      {/* Fabric Info */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                              {fab.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {fab.color || 'Custom Color'} • {fab.pattern || 'Plain'} Pattern
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                              ₹{fab.pricePerMeter}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-semibold">per meter</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {fab.description || 'Premium cloth material available for custom tailoring and bespoke orders.'}
                        </p>

                        {/* Suitable For Tags */}
                        {fab.suitableFor && fab.suitableFor.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Suitable For:</span>
                            <div className="flex flex-wrap gap-1">
                              {fab.suitableFor.map((g, gIdx) => (
                                <span
                                  key={gIdx}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                          <span>📦 Available: <strong className="text-slate-800 dark:text-slate-200">{fab.quantityMeters || 20} meters</strong></span>
                          <span>{fab.isVisible !== false ? '👁️ Visible to Clients' : '🔒 Hidden'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-5 pt-0 flex gap-2">
                      <button
                        onClick={() => handleOpenEditFabric(fab, idx)}
                        className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Fabric</span>
                      </button>
                      <button
                        onClick={() => handleDeleteFabric(idx)}
                        className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 text-xs font-bold cursor-pointer"
                        title="Delete Fabric"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: 📏 MEASUREMENTS ================= */}
        {activeTab === 'measurements' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Customer Measurements Directory</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recorded measurements history for precision fitting across orders</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {bookings.filter((b) => b.measurements && b.measurements.length > 0).length === 0 ? (
                <div className="col-span-2 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-12 text-center text-slate-400">
                  <Ruler className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold">No measurements recorded yet</p>
                  <p className="text-xs">Go to Orders tab and click "Fit / Sizes" on any active order to save measurements.</p>
                </div>
              ) : (
                bookings
                  .filter((b) => b.measurements && b.measurements.length > 0)
                  .map((b) => (
                    <div
                      key={b._id}
                      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.customer?.name || 'Customer'}</h4>
                          <span className="text-[10px] font-mono text-blue-600">Order #{b.orderId || b._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <button
                          onClick={() => handleOpenMeasureModal(b)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        {b.measurements.map((m, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-semibold">{m.name}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{m.value} {m.unit || 'inch'}</span>
                          </div>
                        ))}
                      </div>

                      {b.measurementNotes && (
                        <p className="text-[11px] text-slate-500 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg">
                          📝 {b.measurementNotes}
                        </p>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 6: 🧵 WORK CONDITIONS ================= */}
        {activeTab === 'work_conditions' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Workshop &amp; Service Conditions</h3>
                <p className="text-xs text-slate-500">Configure pickup options, alterations, fabric terms, and home visit capabilities</p>
              </div>
              <button
                onClick={() => handleSaveProfile()}
                disabled={profileSaving}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? 'Saving...' : 'Save Conditions'}</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { key: 'homeVisitAvailable', label: '🏠 Home Visit Available', desc: 'Doorstep measurement visits at client location' },
                { key: 'shopVisitAvailable', label: '🏬 Shop Visit Allowed', desc: 'Clients can visit your boutique workshop' },
                { key: 'customMeasurements', label: '📐 Custom Sizing', desc: 'Precision bespoke body measurements recorded' },
                { key: 'customStitching', label: '✂️ Custom Stitching', desc: 'New garment tailoring from scratch' },
                { key: 'alterationAvailable', label: '🪡 Alterations & Fitting', desc: 'Refitting, length resizing and tapering' },
                { key: 'expressDelivery', label: '⚡ Express Delivery (3 Days)', desc: 'Fast-track urgent delivery turnaround' },
                { key: 'normalDelivery', label: '🚚 Standard Delivery (7 Days)', desc: 'Standard turnaround stitching' },
                { key: 'customerFabricAccepted', label: '📦 Customer Fabric Accepted', desc: 'Stitching client-provided fabrics & cloth' },
                { key: 'fabricProvided', label: '🧵 Studio Fabric Available', desc: 'Provide in-house shop materials & cloths' },
                { key: 'pickupAvailable', label: '📍 Fabric Pickup', desc: 'Doorstep cloth sample collection' },
                { key: 'deliveryAvailable', label: '🛵 Finished Delivery', desc: 'Insured doorstep garment delivery' },
              ].map((item) => {
                const isChecked = tailorProfile?.workConditions?.[item.key] !== false
                return (
                  <label
                    key={item.key}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const updated = {
                          ...tailorProfile,
                          workConditions: {
                            ...tailorProfile.workConditions,
                            [item.key]: e.target.checked,
                          },
                        }
                        setTailorProfile(updated)
                      }}
                      className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5"
                    />
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 7: ⭐ REVIEWS ================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Customer Reviews &amp; Ratings</h3>
                <p className="text-xs text-slate-500">Verified feedback and ratings received from client deliveries</p>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 px-4 py-2 rounded-2xl border border-amber-200 dark:border-amber-900/40">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-black text-amber-700 dark:text-amber-300">
                  {tailorProfile?.ratingAverage ? tailorProfile.ratingAverage.toFixed(1) : '4.9'}
                </span>
                <span className="text-xs text-slate-500">({tailorProfile?.ratingCount || 120} ratings)</span>
              </div>
            </div>

            {/* Reviews list */}
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: 'Amit Sharma', rating: 5, date: '2 days ago', garment: '3-Piece Italian Suit', comment: 'Master craftsman! The shoulder fit and trouser length were exact to millimeter. Exceptional stitching quality.' },
                { name: 'Priya Mehra', rating: 5, date: '1 week ago', garment: 'Bridal Saree Blouse', comment: 'Loved the padded finish and back tassel design. Home visit was punctual and very professional.' },
                { name: 'Rahul Verma', rating: 4.8, date: '2 weeks ago', garment: 'Pure Silk Kurta Pajama', comment: 'Neat collar stitching and soft lining. Delivered a day before promised date.' },
              ].map((rev, idx) => (
                <div key={idx} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">
                        {rev.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{rev.name}</h4>
                        <span className="text-[10px] text-slate-400">{rev.date} • {rev.garment}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      ★ {rev.rating}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingReviewId(idx)
                        setReplyText('')
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      💬 Reply to Customer
                    </button>
                  </div>

                  {replyingReviewId === idx && (
                    <div className="mt-2 space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 animate-in fade-in">
                      <textarea
                        rows={2}
                        placeholder="Type your thank you response..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReplyingReviewId(null)}
                          className="px-3 py-1 rounded-lg border text-[11px] font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            success('Reply posted to customer review!')
                            setReplyingReviewId(null)
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold"
                        >
                          Post Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 8: 💰 EARNINGS ================= */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            {/* Earnings Stat Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-emerald-600 text-white shadow-lg space-y-1">
                <span className="text-xs font-bold uppercase opacity-80">Total Net Earnings</span>
                <h3 className="text-3xl font-black">₹{netEarnings.toLocaleString()}</h3>
                <p className="text-[11px] opacity-90">85% artisan direct payout after platform fees</p>
              </div>

              <div className="p-6 rounded-3xl bg-blue-600 text-white shadow-lg space-y-1">
                <span className="text-xs font-bold uppercase opacity-80">Gross Delivered Revenue</span>
                <h3 className="text-3xl font-black">₹{totalGrossEarned.toLocaleString()}</h3>
                <p className="text-[11px] opacity-90">{completedCount} delivered client bookings</p>
              </div>

              <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-lg space-y-1">
                <span className="text-xs font-bold uppercase opacity-80">Pending In-Progress Revenue</span>
                <h3 className="text-3xl font-black">
                  ₹{bookings.filter((b) => !['delivered', 'cancelled'].includes(b.status)).reduce((sum, b) => sum + (b.price || 0), 0).toLocaleString()}
                </h3>
                <p className="text-[11px] opacity-90">Reserved in escrow pipeline</p>
              </div>
            </div>

            {/* Earnings Breakdown Table */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Delivered Orders Payout Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Gross</th>
                      <th className="px-4 py-3">Platform Fee (15%)</th>
                      <th className="px-4 py-3">Net Payout (85%)</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:border-slate-800">
                    {bookings.filter((b) => b.status === 'delivered').length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                          No delivered orders yet. Delivered bookings will calculate automatic payouts here.
                        </td>
                      </tr>
                    ) : (
                      bookings
                        .filter((b) => b.status === 'delivered')
                        .map((b) => {
                          const gross = b.price || 999
                          const fee = Math.round(gross * 0.15)
                          const net = gross - fee
                          return (
                            <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="px-4 py-3 font-mono font-bold text-blue-600">#{b.orderId || b._id.slice(-6).toUpperCase()}</td>
                              <td className="px-4 py-3 font-bold">{b.customer?.name || 'Customer'}</td>
                              <td className="px-4 py-3">{b.service?.name || b.clothName || 'Tailoring'}</td>
                              <td className="px-4 py-3">₹{gross}</td>
                              <td className="px-4 py-3 text-slate-400">-₹{fee}</td>
                              <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">₹{net}</td>
                              <td className="px-4 py-3 text-right">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  ✓ Settled
                                </span>
                              </td>
                            </tr>
                          )
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 9: 📊 ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Studio Performance &amp; Analytics</h3>
              <p className="text-xs text-slate-500">Order volume metrics, customer retention, and highest-earning services</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Monthly Order Volume Trends
                </h4>
                <div className="space-y-2 text-xs">
                  {[
                    { month: 'Current Month', orders: bookings.length || 18, pct: '100%' },
                    { month: 'Last Month', orders: 24, pct: '85%' },
                    { month: '2 Months Ago', orders: 19, pct: '70%' },
                  ].map((m, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{m.month}</span>
                        <span className="text-blue-600">{m.orders} Orders</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" style={{ width: m.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Most Popular Services
                </h4>
                <div className="space-y-3 text-xs">
                  {(tailorProfile?.servicesOffered || []).slice(0, 4).map((srv, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{srv.name}</p>
                        <span className="text-[10px] text-slate-400">{srv.category}</span>
                      </div>
                      <span className="font-black text-blue-600">₹{srv.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 10: 📍 LOCATION & AVAILABILITY ================= */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Location &amp; Service Radius</h3>
                <p className="text-xs text-slate-500">Manage servicing city, doorstep visit radius and online availability status</p>
              </div>
              <button
                onClick={() => handleSaveProfile()}
                disabled={profileSaving}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? 'Saving...' : 'Save Location'}</span>
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Primary Servicing City</label>
                  <input
                    type="text"
                    value={tailorProfile?.city || ''}
                    onChange={(e) => setTailorProfile({ ...tailorProfile, city: e.target.value })}
                    placeholder="e.g. Delhi, Meerut, Ghaziabad"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Primary Area / Locality</label>
                  <input
                    type="text"
                    value={tailorProfile?.area || ''}
                    onChange={(e) => setTailorProfile({ ...tailorProfile, area: e.target.value })}
                    placeholder="e.g. Chandni Chowk, Sadar Bazaar, Raj Nagar"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={tailorProfile?.pincode || ''}
                    onChange={(e) => setTailorProfile({ ...tailorProfile, pincode: e.target.value })}
                    placeholder="e.g. 110006, 250001, 201002"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Home Visit Radius: <strong className="text-blue-600">{tailorProfile?.homeVisitRadiusKm || 15} km</strong>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="50"
                    step="1"
                    value={tailorProfile?.homeVisitRadiusKm || 15}
                    onChange={(e) => setTailorProfile({ ...tailorProfile, homeVisitRadiusKm: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Workshop Address</label>
                <textarea
                  rows={2}
                  value={tailorProfile?.address || ''}
                  onChange={(e) => setTailorProfile({ ...tailorProfile, address: e.target.value })}
                  placeholder="Shop number, market name, street..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              {/* Vacation Mode Toggle */}
              <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">🌴 Vacation / Offline Mode</h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">Temporarily hide from search while on leave</p>
                </div>
                <input
                  type="checkbox"
                  checked={tailorProfile?.isAvailable === false}
                  onChange={(e) => setTailorProfile({ ...tailorProfile, isAvailable: !e.target.checked })}
                  className="h-5 w-5 rounded text-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 11: 💬 CUSTOMERS ================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Customer Communication &amp; Directory</h3>
              <p className="text-xs text-slate-500">Contact past &amp; active clients directly via Phone or 1-Click WhatsApp</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings.length === 0 ? (
                <div className="col-span-3 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-12 text-center text-slate-400">
                  <Phone className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold">No customer contacts yet</p>
                </div>
              ) : (
                bookings.map((b) => {
                  const custPhone = b.customer?.phone || '+91 8789682127'
                  const cleanPhone = custPhone.replace(/[^0-9]/g, '')
                  const msg = encodeURIComponent(
                    `Namaste ${b.customer?.name || 'Customer'}, I am ${user?.name} from TailorWala regarding your order #${b.orderId || b._id.slice(-6).toUpperCase()}.`
                  )

                  return (
                    <div
                      key={b._id}
                      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold flex items-center justify-center text-sm">
                          {b.customer?.name ? b.customer.name.charAt(0) : 'C'}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.customer?.name || 'Customer'}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">Order #{b.orderId || b._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-500" /> {custPhone}</p>
                        <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> {b.address || b.city}</p>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${msg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${custPhone}`}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 12: 🔔 NOTIFICATIONS ================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Studio Notifications</h3>
                <p className="text-xs text-slate-500">Live feed of new orders, updates, and platform announcements</p>
              </div>
              <button
                onClick={() => success('All notifications marked as read')}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'New Bespoke Order Placed', time: '10 mins ago', desc: 'Customer placed an order for 3-Piece Italian Suit.', type: 'order' },
                { title: 'Payment Escrow Verified', time: '1 hour ago', desc: 'COD and platform verification confirmed for order #TW-10492.', type: 'payment' },
                { title: 'Platform Master Tailor Badge Active', time: 'Yesterday', desc: 'Your Digital ID Card accreditation is 100% active and verifiable.', type: 'system' },
              ].map((n, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</h4>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 13: 👤 MY PROFILE ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Shop &amp; Master Tailor Profile</h3>
                <p className="text-xs text-slate-500">Edit studio bio, specializations, base prices, and operating hours</p>
              </div>
              <button
                onClick={() => handleSaveProfile()}
                disabled={profileSaving}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Photo & Basic info */}
              <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <img
                    src={photo}
                    alt={user?.name}
                    className="w-20 h-20 rounded-3xl object-cover ring-4 ring-blue-500/20 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoModalOpen(true)}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{user?.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{tailorId} • {uniqueNo}</p>
                  <button
                    type="button"
                    onClick={() => setPhotoModalOpen(true)}
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Change Profile Photo
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shop / Studio Name</label>
                  <input
                    type="text"
                    value={tailorProfile?.shopName || ''}
                    onChange={(e) => setTailorProfile({ ...tailorProfile, shopName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Crafting Experience (Years)</label>
                  <input
                    type="number"
                    value={tailorProfile?.experienceYears || 10}
                    onChange={(e) => setTailorProfile({ ...tailorProfile, experienceYears: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Starting Base Price (₹)</label>
                  <input
                    type="number"
                    value={tailorProfile?.basePrice || 299}
                    onChange={(e) => setTailorProfile({ ...tailorProfile, basePrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Working Days &amp; Hours</label>
                  <input
                    type="text"
                    value={tailorProfile?.workingHours?.days ? `${tailorProfile.workingHours.days} (${tailorProfile.workingHours.start || '9AM'} - ${tailorProfile.workingHours.end || '8PM'})` : 'Mon - Sat (9:00 AM - 8:30 PM)'}
                    onChange={(e) => setTailorProfile({ ...tailorProfile, workingHours: { ...tailorProfile.workingHours, days: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Studio Bio &amp; Craft Story</label>
                <textarea
                  rows={3}
                  value={tailorProfile?.bio || ''}
                  onChange={(e) => setTailorProfile({ ...tailorProfile, bio: e.target.value })}
                  placeholder="Tell clients about your master craftsmanship, cuts, embroidery techniques..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 14: 🪪 MY ID CARD ================= */}
        {activeTab === 'id_card' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Master Tailor Digital ID Badge</h3>
              <p className="text-xs text-slate-500">Officially verified credential with real-time QR authentication for home visits</p>
            </div>

            {/* Embedded Digital ID Card Component */}
            <div className="flex justify-center py-4">
              <DigitalIdCard
                user={{
                  ...user,
                  role: 'tailor',
                  tailorId,
                  uniqueNumber: uniqueNo,
                  designation: 'Master Craftsman & Bespoke Tailor',
                  shopName: tailorProfile?.shopName || 'TailorWala Atelier',
                  city: tailorProfile?.city || user?.city || 'Delhi NCR',
                  avatar: photo,
                }}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 15: ⚙️ SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Account Settings &amp; Security</h3>
              <p className="text-xs text-slate-500">Manage account credentials, change password, and notification preferences</p>
            </div>

            {/* Change Password Form */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs max-w-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Change Account Password</h4>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD / EDIT SERVICE ================= */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {editingServiceIndex >= 0 ? 'Edit Tailoring Service' : 'Add New Tailoring Service'}
              </h3>
              <button onClick={() => setServiceModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-Piece Bespoke Suit, Padded Designer Blouse"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  >
                    {['Men', 'Women', 'Kids', 'Wedding', 'Alteration', 'General'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tailoring Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Turnaround Days</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={serviceForm.turnaroundDays}
                  onChange={(e) => setServiceForm({ ...serviceForm, turnaroundDays: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Included features, lining, fit guarantee details..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              {/* Service Image with Device Upload or URL */}
              <ImageInputWithUpload
                label="Service Thumbnail Image"
                value={serviceForm.image}
                onChange={(img) => setServiceForm({ ...serviceForm, image: img })}
                placeholder="Upload photo or paste URL..."
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT FABRIC ================= */}
      {fabricModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {editingFabricIndex >= 0 ? 'Edit Available Fabric' : 'Add Available Fabric to Studio'}
              </h3>
              <button onClick={() => setFabricModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFabric} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fabric / Cloth Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Egyptian Giza Cotton, Italian 120s Wool"
                  value={fabricForm.name}
                  onChange={(e) => setFabricForm({ ...fabricForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={fabricForm.category}
                    onChange={(e) => setFabricForm({ ...fabricForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  >
                    {FABRIC_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Price per Meter (₹) *</label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={fabricForm.pricePerMeter}
                    onChange={(e) => setFabricForm({ ...fabricForm, pricePerMeter: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Blue, Ivory, Charcoal"
                    value={fabricForm.color}
                    onChange={(e) => setFabricForm({ ...fabricForm, color: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pattern / Texture</label>
                  <select
                    value={fabricForm.pattern}
                    onChange={(e) => setFabricForm({ ...fabricForm, pattern: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  >
                    {FABRIC_PATTERNS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Available Quantity (Meters)</label>
                  <input
                    type="number"
                    min="1"
                    value={fabricForm.quantityMeters}
                    onChange={(e) => setFabricForm({ ...fabricForm, quantityMeters: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Badge / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Italian, 100% Organic, Handwoven"
                    value={fabricForm.badge}
                    onChange={(e) => setFabricForm({ ...fabricForm, badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              {/* Suitable For Multi-Tags */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Suitable Garments</label>
                <div className="flex flex-wrap gap-1.5">
                  {GARMENT_SUITABLE_TAGS.map((tag) => {
                    const isSelected = fabricForm.suitableFor.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const list = isSelected
                            ? fabricForm.suitableFor.filter((t) => t !== tag)
                            : [...fabricForm.suitableFor, tag]
                          setFabricForm({ ...fabricForm, suitableFor: list })
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={fabricForm.description}
                  onChange={(e) => setFabricForm({ ...fabricForm, description: e.target.value })}
                  placeholder="Fabric feel, weave details, thread count, care instructions..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              {/* Fabric Image with Upload & URL */}
              <ImageInputWithUpload
                label="Fabric Photo / Texture Image"
                value={fabricForm.image}
                onChange={(img) => setFabricForm({ ...fabricForm, image: img })}
                placeholder="Upload fabric photo or paste direct link..."
              />

              {/* In Stock & Visibility Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fabricForm.isAvailable}
                    onChange={(e) => setFabricForm({ ...fabricForm, isAvailable: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>✓ In Stock</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fabricForm.isVisible}
                    onChange={(e) => setFabricForm({ ...fabricForm, isVisible: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>👁️ Show to Clients</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFabricModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Save Fabric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MEASUREMENT RECORDER ================= */}
      {measuringBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Record Measurements &amp; Fit Specs
                </h3>
                <p className="text-xs text-slate-500">Order #{measuringBooking.orderId || measuringBooking._id.slice(-6).toUpperCase()} • {measuringBooking.customer?.name}</p>
              </div>
              <button onClick={() => setMeasuringBooking(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Load Garment Preset:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'suit', label: '👔 Men’s Suit / Blazer' },
                  { id: 'blouse', label: '👚 Women’s Blouse / Choli' },
                  { id: 'kurta', label: '🧵 Kurta / Sherwani' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      measurementTemplate === tpl.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveMeasurements} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                {measurements.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{m.name}</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.25"
                        required
                        value={m.value}
                        onChange={(e) => {
                          const copy = [...measurements]
                          copy[idx].value = Number(e.target.value)
                          setMeasurements(copy)
                        }}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                      />
                      <span className="text-[10px] font-bold text-slate-400">in</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tailoring / Cutting Notes</label>
                <textarea
                  rows={2}
                  value={measurementNotes}
                  onChange={(e) => setMeasurementNotes(e.target.value)}
                  placeholder="Special instructions: Loose armhole, extra margin, high collar..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMeasuringBooking(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Save &amp; Start Stitching
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PHOTO UPLOAD MODAL ================= */}
      {photoModalOpen && (
        <PhotoUploadModal
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          currentPhoto={photo}
          onPhotoUpdated={(newUrl) => {
            if (updateProfile) updateProfile({ avatar: newUrl })
            setPhotoModalOpen(false)
            success('Profile photo updated successfully!')
          }}
        />
      )}
    </div>
  )
}

export default TailorDashboard
