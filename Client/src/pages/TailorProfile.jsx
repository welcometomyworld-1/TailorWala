import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { apiGet } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { WorkConditionsGrid } from '../components/WorkConditionCard.jsx'
import {
  MapPin,
  Clock,
  Star,
  Home,
  ShieldCheck,
  MessageCircle,
  Scissors,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShoppingBag,
  Store,
  Layers,
} from 'lucide-react'

const SLOTS = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:30 PM']

export function TailorDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { success, warning } = useToast()
  const navigate = useNavigate()

  const [tailor, setTailor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedDesignModal, setSelectedDesignModal] = useState(null)

  useEffect(() => {
    let isCurrent = true
    apiGet(`/tailors/${id}`)
      .then((res) => {
        if (!isCurrent) return
        setTailor(res.data)
        if (res.data?.servicesOffered?.length > 0) {
          setSelectedService(res.data.servicesOffered[0])
          setCustomPrice(res.data.servicesOffered[0].price)
        }
      })
      .catch(() => {
        if (isCurrent) setTailor(null)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [id])

  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + (i + 1))
    return d
  })

  const handleBookVisit = (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/auth', { state: { from: `/tailor/${id}` } })
      return
    }

    if (!selectedDate || !selectedSlot) {
      warning('Please choose an appointment date and preferred time slot.')
      return
    }

    const priceToCharge = customPrice ? Number(customPrice) : selectedService?.price || tailor.basePrice || 499

    addToCart({
      tailorId: tailor._id,
      tailorName: tailor.shopName || tailor.user?.name,
      serviceType: selectedService?.name || 'Custom Bespoke Tailoring',
      serviceCategory: selectedService?.category || 'General',
      price: priceToCharge,
      scheduledAt: selectedDate,
      timeSlot: selectedSlot,
      customizationNotes: notes,
      homeVisitFee: tailor.homeVisitFee || 99,
    })

    success(`Added ${selectedService?.name || 'Custom Service'} with ${tailor.shopName || tailor.user?.name} to cart!`)
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <div className="inline-flex p-4 rounded-full bg-blue-50 text-blue-600 animate-spin mb-4">
          <Scissors className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Loading master tailor profile...</p>
      </div>
    )
  }

  if (!tailor) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 inline-block mb-4">
          <Scissors className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tailor Profile Not Found</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">The tailor profile you are looking for does not exist or has been deactivated.</p>
        <Link to="/search" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-blue-700 transition-all">
          <Scissors className="w-4 h-4" />
          Browse Active Tailors
        </Link>
      </div>
    )
  }

  const name = tailor.shopName || tailor.user?.name || 'Master Tailor'
  const avatar = tailor.user?.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300`
  const reviews = tailor.reviews || []
  const whatsappUrl = `https://wa.me/918789682127?text=${encodeURIComponent(
    `Hello ${name}, I would like to know more about your bespoke tailoring services on TailorWala.`,
  )}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-xs font-medium text-slate-500 flex items-center gap-1.5">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-blue-600">Tailors</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-bold">{name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Details, Work Conditions, & Services */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Hero Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <img
                src={avatar}
                alt={name}
                className="h-24 w-24 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover ring-4 ring-blue-500/10 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {name}
                  </h1>
                  {tailor.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-xs font-bold px-2.5 py-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      VERIFIED MASTER
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {tailor.bio || 'Artisan bespoke tailor crafting custom fits, alterations, and formal couture.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {tailor.city || tailor.user?.city || 'Delhi NCR'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    {tailor.experienceYears || 5}+ Years Exp
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {tailor.ratingAverage ? tailor.ratingAverage.toFixed(1) : '4.8'} ({tailor.ratingCount || reviews.length} Reviews)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Home className="w-3.5 h-3.5" />
                    Home Visit: ₹{tailor.homeVisitFee || 99}
                  </span>
                </div>

                {/* Direct Contact Actions */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Specialization tags */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
              {(tailor.specializations || []).map((s, idx) => (
                <span
                  key={idx}
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Work Conditions & Capabilities Section */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Work Conditions &amp; Services
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Verified workshop capabilities, pickup/delivery guarantees and alteration terms.</p>
              </div>
            </div>

            <WorkConditionsGrid workConditions={tailor.workConditions || {}} />
          </div>

          {/* Services & Price Menu */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-blue-600" />
              Tailoring Services &amp; Pricing
            </h2>
            <div className="grid gap-3">
              {(tailor.servicesOffered || []).map((srv) => (
                <div
                  key={srv._id || srv.name}
                  onClick={() => {
                    setSelectedService(srv)
                    setCustomPrice(srv.price)
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    selectedService?.name === srv.name
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-500 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{srv.name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {srv.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{srv.description || `Turnaround time ~${srv.turnaroundDays || 7} business days`}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹{srv.price}</span>
                    <span className="block text-[11px] text-slate-400">Stitching Charge</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Fabrics & Materials Section */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Available Fabrics &amp; Cloths in Studio
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select premium materials directly from this master tailor's studio for your bespoke order.
                </p>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                {(tailor.fabrics?.filter((f) => f.isVisible !== false)?.length || 2)} Fabrics In-Stock
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(tailor.fabrics?.length
                ? tailor.fabrics.filter((f) => f.isVisible !== false)
                : [
                    {
                      name: 'Pure Egyptian Giza Cotton',
                      category: 'Cotton',
                      color: 'Sky Blue',
                      pattern: 'Checks',
                      pricePerMeter: 450,
                      badge: '100% Organic',
                      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800',
                      suitableFor: ['Shirt', 'Kurta'],
                      isAvailable: true,
                      description: 'Long-staple breathable cotton fabric perfect for crisp formal dress shirts.',
                    },
                    {
                      name: 'Superfine Italian 120s Wool',
                      category: 'Wool',
                      color: 'Charcoal Grey',
                      pattern: 'Plain',
                      pricePerMeter: 850,
                      badge: 'Premium Italian',
                      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
                      suitableFor: ['Suit', 'Blazer', 'Pant'],
                      isAvailable: true,
                      description: 'Bespoke breathable suiting fabric with natural drape and wrinkle-resistance.',
                    },
                  ]
              ).map((fab, fIdx) => (
                <div
                  key={fIdx}
                  className="group rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-800/40 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      <img
                        src={fab.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'}
                        alt={fab.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                        {fab.category}
                      </span>
                      {fab.badge && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shadow-sm">
                          ⭐ {fab.badge}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{fab.name}</h4>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          ₹{fab.pricePerMeter}/m
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {fab.description || `${fab.color || ''} ${fab.pattern || ''} cloth suitable for tailoring.`}
                      </p>

                      {fab.suitableFor && fab.suitableFor.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {fab.suitableFor.map((tag, tIdx) => (
                            <span key={tIdx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <a
                      href={`https://wa.me/${(tailor.user?.phone || '918789682127').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ${tailor.shopName || tailor.user?.name}, I am interested in ordering custom tailoring with your "${fab.name}" (₹${fab.pricePerMeter}/m) fabric.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Inquire This Fabric</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Work & Design Gallery Section */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Previous Work &amp; Custom Designs
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Authentic finished garments and mastercraft designs by this tailor.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(tailor.portfolio?.length ? tailor.portfolio : [
                { title: 'Royal Silk Sherwani', category: 'Wedding', imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800', description: 'Handcrafted zari work with micro-tailoring' },
                { title: 'Bespoke Italian Cut Suit', category: 'Men', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', description: 'Super 140s wool double-breasted suit' },
                { title: 'Bridal Couture Lehenga', category: 'Wedding', imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', description: 'Double can-can with designer padded blouse' },
              ]).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedDesignModal(item)}
                  className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/60 hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      {item.category || 'Design'}
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shop Location & Workshop Address Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              Workshop Location &amp; Service Radius
            </h2>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">Physical Atelier Address</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{tailor.shopName || tailor.user?.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {tailor.address || 'Main Market Road'}, {tailor.area || 'Central'}, {tailor.city || tailor.user?.city || 'Delhi'} - {tailor.pincode || '110001'}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>📍 Service Radius: Up to 15 Km</span>
                  <span>⚡ Doorstep Measurement: Available</span>
                </div>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${tailor.shopName || name} ${tailor.city || 'Delhi'}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Get Directions ↗</span>
              </a>
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Reviews</h2>
                <p className="text-xs text-slate-500 mt-0.5">Verified completed order feedback</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl text-amber-600 font-black text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {tailor.ratingAverage ? tailor.ratingAverage.toFixed(1) : '4.8'}
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No reviews yet for this tailor.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.customer?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`}
                          alt=""
                          className="h-7 w-7 rounded-full bg-slate-200 object-cover"
                        />
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{r.customer?.name || 'Verified Customer'}</span>
                      </div>
                      <div className="flex text-amber-500 text-xs items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold ml-1">{r.rating || 5}.0</span>
                      </div>
                    </div>
                    {r.title && <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2">{r.title}</h4>}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{r.comment}</p>
                    {r.tailorReply?.comment && (
                      <div className="mt-3 pl-3 border-l-2 border-blue-500 text-xs text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 p-2 rounded-r-lg">
                        <span className="font-bold text-blue-600 block mb-0.5">Tailor Reply:</span>
                        {r.tailorReply.comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Booking & Slot Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Home Measurement Booking</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Book Doorstep Visit</h3>
              <p className="text-xs text-slate-500 mt-1">Master assistant will visit your location to take measurements.</p>
            </div>

            <form onSubmit={handleBookVisit} className="space-y-4">
              {/* Selected Service Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Selected Service</label>
                <input
                  type="text"
                  readOnly
                  value={selectedService ? `${selectedService.name} (₹${customPrice})` : `Standard Tailoring (₹${tailor.basePrice})`}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Select Appointment Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {next7Days.map((d) => {
                    const dateStr = d.toISOString().slice(0, 10)
                    const isSelected = selectedDate === dateStr
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedDate(dateStr)}
                        className={`shrink-0 flex flex-col items-center justify-center p-2.5 w-16 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-sm font-black">{d.getDate()}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Slots */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Preferred Time Window
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedSlot === slot
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Special Instructions (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Slim fit, bring fabric sample swatches, collar styling..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Stitching Service</span>
                  <span>₹{customPrice || tailor.basePrice}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Home Visit &amp; Measurements</span>
                  <span>₹{tailor.homeVisitFee || 99}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 dark:text-white text-sm pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <span>Est. Initial Total</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    ₹{Number(customPrice || tailor.basePrice) + Number(tailor.homeVisitFee || 99)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart &amp; Continue →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Design Full Preview Modal */}
      {selectedDesignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedDesignModal(null)}
              className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center text-sm font-bold backdrop-blur transition-all"
            >
              ✕
            </button>
            <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={selectedDesignModal.imageUrl}
                alt={selectedDesignModal.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-6">
              <span className="rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold uppercase">
                {selectedDesignModal.category || 'Custom Stitch'}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                {selectedDesignModal.title}
              </h3>
              {selectedDesignModal.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {selectedDesignModal.description}
                </p>
              )}
              <div className="mt-6 flex gap-3">
                <a
                  href={`https://wa.me/918789682127?text=${encodeURIComponent(
                    `Hello ${name}, I saw your "${selectedDesignModal.title}" design on TailorWala and want to get something similar stitched.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold text-center shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire This Design on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TailorDetailPage
