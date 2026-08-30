import React, { useEffect, useState, useCallback, useTransition, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  Scissors,
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  RotateCcw,
  Sparkles,
  X,
  Flame,
  ArrowUpDown,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Layers,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  Shirt,
  Tag,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { apiGet } from '../services/api.js'
import { TailorCardSkeleton } from '../components/common/Skeleton.jsx'

const SORT_OPTIONS = [
  { id: 'rating', label: 'Top Rated', icon: Star },
  { id: 'popular', label: 'Most Popular', icon: Flame },
  { id: 'price_asc', label: 'Price: Low to High', icon: ArrowUpDown },
  { id: 'price_desc', label: 'Price: High to Low', icon: ArrowUpDown },
  { id: 'delivery_fast', label: 'Fastest Delivery', icon: Zap },
]

const CITIES = [
  'All Cities',
  'Delhi',
  'Meerut',
  'Ghaziabad',
  'Noida',
  'Gurgaon',
  'Mumbai',
  'Bengaluru',
  'Lucknow',
  'Jaipur',
  'Pune',
  'Kolkata',
  'Hyderabad',
  'Ahmedabad',
]

const CATEGORIES_TAILOR = ['', 'Men', 'Women', 'Kids', 'Wedding', 'Alteration']
const CATEGORIES_FABRIC = ['', 'Cotton', 'Linen', 'Silk', 'Wool', 'Velvet', 'Denim', 'Rayon', 'Blend']

export function TailorSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Extract initial parameters from URL
  const initialView = searchParams.get('view') === 'fabrics' || searchParams.get('type') === 'fabrics' ? 'fabrics' : 'tailors'
  const initialSearch =
    searchParams.get('search') ||
    searchParams.get('q') ||
    searchParams.get('specialization') ||
    ''
  const initialCity = searchParams.get('city') || ''
  const initialCat = searchParams.get('category') || ''

  const [, startTransition] = useTransition()

  // State Management
  const [view, setView] = useState(initialView) // 'tailors' | 'fabrics'
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [activeSearch, setActiveSearch] = useState(initialSearch)
  const [city, setCity] = useState(initialCity)
  const [category, setCategory] = useState(initialCat)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(5000)
  const [minRating, setMinRating] = useState('')
  const [homeVisitOnly, setHomeVisitOnly] = useState(false)
  const [sort, setSort] = useState('rating')
  const [page, setPage] = useState(1)

  // Data Results
  const [items, setItems] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Fabric Modal View Details State
  const [selectedFabricModal, setSelectedFabricModal] = useState(null)

  // Debounce search input typing (300ms)
  const debounceTimerRef = useRef(null)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setActiveSearch(searchInput.trim())
      setPage(1)
    }, 300)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [searchInput])

  // Sync external search params when URL changes
  useEffect(() => {
    const v = searchParams.get('view') === 'fabrics' || searchParams.get('type') === 'fabrics' ? 'fabrics' : 'tailors'
    const q =
      searchParams.get('search') ||
      searchParams.get('q') ||
      searchParams.get('specialization') ||
      ''
    const c = searchParams.get('city') || ''
    const cat = searchParams.get('category') || ''

    setView(v)
    setSearchInput(q)
    setActiveSearch(q)
    setCity(c)
    setCategory(cat)
  }, [searchParams])

  // Main Fetch Data Handler (Handles both Tailors and Fabrics smoothly)
  const fetchData = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    try {
      const params = new URLSearchParams()
      if (activeSearch) params.set('search', activeSearch)
      if (city && city !== 'All Cities') params.set('city', city)
      if (category) params.set('category', category)
      if (minPrice > 0) params.set('minPrice', String(minPrice))
      if (maxPrice < 5000) params.set('maxPrice', String(maxPrice))
      if (sort) params.set('sort', sort)

      if (view === 'tailors') {
        if (minRating) params.set('minRating', String(minRating))
        if (homeVisitOnly) params.set('homeVisit', 'true')
        params.set('page', String(page))
        params.set('limit', '9')

        const res = await apiGet(`/tailors?${params.toString()}`)
        setItems(res.data || [])
        setTotalCount(res.total || (res.data ? res.data.length : 0))
        setTotalPages(res.pages || 1)
      } else {
        // Fabrics / Materials view
        const res = await apiGet(`/fabrics?${params.toString()}`)
        setItems(res.data || [])
        setTotalCount(res.total || (res.data ? res.data.length : 0))
        setTotalPages(1)
      }
    } catch (err) {
      setApiError(err.message || 'Unable to load results. Please check connection.')
      setItems([])
      setTotalCount(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [view, activeSearch, city, category, minPrice, maxPrice, minRating, homeVisitOnly, sort, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Switch Catalog View (Tailors vs Fabrics)
  const handleSwitchView = (newView) => {
    setView(newView)
    setCategory('')
    setPage(1)
    const current = new URLSearchParams(searchParams)
    if (newView === 'fabrics') {
      current.set('view', 'fabrics')
    } else {
      current.delete('view')
      current.delete('type')
    }
    setSearchParams(current, { replace: true })
  }

  // Instant Search Submit on Enter
  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    startTransition(() => {
      const clean = searchInput.trim()
      setActiveSearch(clean)
      setPage(1)
      const current = new URLSearchParams(searchParams)
      if (clean) {
        current.set('search', clean)
      } else {
        current.delete('search')
        current.delete('q')
        current.delete('specialization')
      }
      setSearchParams(current, { replace: true })
    })
  }

  // Clear Single Search Input
  const handleClearSearch = () => {
    setSearchInput('')
    setActiveSearch('')
    setPage(1)
    const current = new URLSearchParams(searchParams)
    current.delete('search')
    current.delete('q')
    current.delete('specialization')
    setSearchParams(current, { replace: true })
  }

  // Complete Reset of ALL Filter States
  const handleResetFilters = () => {
    setSearchInput('')
    setActiveSearch('')
    setCity('')
    setCategory('')
    setMinPrice(0)
    setMaxPrice(5000)
    setMinRating('')
    setHomeVisitOnly(false)
    setSort('rating')
    setPage(1)

    // Clear URL Search Params completely
    if (view === 'fabrics') {
      setSearchParams({ view: 'fabrics' }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-4 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-bold">
          {view === 'fabrics' ? 'Premium Materials & Fabrics' : 'Master Tailor Search'}
        </span>
      </nav>

      {/* Header & View Switcher */}
      <div className="flex flex-col gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {view === 'fabrics' ? 'Explore Premium Materials & Fabrics' : 'Find Master Tailors Near You'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {view === 'fabrics'
                ? 'Browse pure silks, Egyptian cottons, and suiting wools from certified ateliers.'
                : 'Book verified artisan tailors for bespoke stitching, doorstep measurements, and perfect fit guarantee.'}
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex lg:hidden items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white shadow-md text-xs cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters ({totalCount})</span>
          </button>
        </div>

        {/* View Switcher Tabs: 👔 Tailors vs 🧵 Fabrics */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-inner">
            <button
              type="button"
              onClick={() => handleSwitchView('tailors')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                view === 'tailors'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Master Tailors</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchView('fabrics')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                view === 'fabrics'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Premium Materials &amp; Cloths</span>
            </button>
          </div>

          {/* Results Count indicator */}
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{totalCount}</strong> {view === 'fabrics' ? 'fabrics available' : 'verified tailors'}
          </span>
        </div>

        {/* Global Live Interactive Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/80 p-2 shadow-xs focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            <Search className="h-5 w-5 ml-2 text-slate-400 shrink-0" />

            <input
              type="text"
              placeholder={
                view === 'fabrics'
                  ? 'Search by fabric name (e.g. Cotton, Banarasi Silk, Wool), color, or tailor studio...'
                  : 'Search by tailor name (e.g. Rafiq, Sharma), garment (Suit, Kurta, Blouse), or city...'
              }
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-transparent px-2 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 font-medium"
            />

            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* ================= FILTERS SIDEBAR ================= */}
        <div className={`space-y-6 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 p-6 overflow-y-auto' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              Filter Results
            </h2>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          </div>

          {/* City / Location Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Location / City
            </label>
            <select
              value={city}
              onChange={(e) => {
                const c = e.target.value
                setCity(c)
                setPage(1)
                const current = new URLSearchParams(searchParams)
                if (c && c !== 'All Cities') current.set('city', c)
                else current.delete('city')
                setSearchParams(current, { replace: true })
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {view === 'fabrics' ? 'Fabric Category' : 'Garment Category'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(view === 'fabrics' ? CATEGORIES_FABRIC : CATEGORIES_TAILOR).map((cat) => (
                <button
                  key={cat || 'all'}
                  type="button"
                  onClick={() => {
                    setCategory(cat)
                    setPage(1)
                    const current = new URLSearchParams(searchParams)
                    if (cat) current.set('category', cat)
                    else current.delete('category')
                    setSearchParams(current, { replace: true })
                  }}
                  className={`rounded-xl py-2 px-2.5 text-xs font-bold text-center border transition-all cursor-pointer truncate ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                  }`}
                >
                  {cat || 'All Types'}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
              <span className="uppercase tracking-wider">
                {view === 'fabrics' ? 'Max Price / Meter' : 'Max Starting Price'}
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value))
                setPage(1)
              }}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹100</span>
              <span>₹5,000+</span>
            </div>
          </div>

          {/* Tailor-specific filters */}
          {view === 'tailors' && (
            <>
              {/* Rating Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Customer Rating
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    { val: '4.8', label: '4.8 & above ★★★★★' },
                    { val: '4.5', label: '4.5 & above ★★★★☆' },
                    { val: '4.0', label: '4.0 & above ★★★★☆' },
                    { val: '', label: 'Any Rating' },
                  ].map((r) => (
                    <label key={r.val} className="flex items-center gap-3 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === r.val}
                        onChange={() => {
                          setMinRating(r.val)
                          setPage(1)
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Home Visit Toggle */}
              <div className="pt-2">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">🏠 Home Visit</p>
                    <p className="text-[11px] text-slate-500">Doorstep measurements</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={homeVisitOnly}
                    onChange={(e) => {
                      setHomeVisitOnly(e.target.checked)
                      setPage(1)
                    }}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                </label>
              </div>
            </>
          )}

          {showMobileFilters && (
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg cursor-pointer"
            >
              Apply &amp; Show Results ({totalCount})
            </button>
          )}
        </div>

        {/* ================= RESULTS CONTENT ================= */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Sorted by: <strong className="text-slate-900 dark:text-white capitalize">{sort.replace(/_/g, ' ')}</strong>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSort(opt.id)
                    setPage(1)
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    sort === opt.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* API Error State */}
          {apiError && !loading && (
            <div className="rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                Unable to load results
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
                {apiError}
              </p>
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <TailorCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty Results State */}
          {!loading && !apiError && items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 py-16 px-6 text-center space-y-3">
              <span className="text-5xl block mb-2">{view === 'fabrics' ? '🧵' : '✂️'}</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {view === 'fabrics' ? 'No fabrics available matching your criteria' : 'No tailors found matching your criteria'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your search keywords, adjusting price range, or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white text-xs hover:bg-blue-700 shadow-md cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            </div>
          )}

          {/* ================= VIEW 1: MASTER TAILORS GRID ================= */}
          {!loading && !apiError && view === 'tailors' && items.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => {
                  const name = t.shopName || t.user?.name || 'Master Tailor'
                  const avatar =
                    t.user?.avatar ||
                    t.image ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'

                  return (
                    <Link
                      key={t._id}
                      to={`/tailor/${t._id}`}
                      className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="p-5">
                        {/* Header info */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatar}
                              alt={name}
                              className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover ring-2 ring-blue-500/20 shrink-0"
                            />
                            <div>
                              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                                {name}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">{t.city || 'Delhi NCR'} • {t.experienceYears || 10}+ yrs exp</p>
                            </div>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md shrink-0">
                            ★ {t.ratingAverage ? t.ratingAverage.toFixed(1) : '4.8'}
                          </span>
                        </div>

                        {/* Specializations & Bio */}
                        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {t.bio || 'Experienced master craftsman crafting bespoke suits, traditional wear, and designer outfits.'}
                        </p>

                        {/* Specialization Tags */}
                        {t.specializations && t.specializations.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {t.specializations.slice(0, 3).map((spec, sIdx) => (
                              <span
                                key={sIdx}
                                className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="border-t border-slate-100 dark:border-slate-800 p-5 pt-3 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block">Starts from</span>
                          <span className="text-base font-black text-blue-600 dark:text-blue-400">₹{t.basePrice || 499}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                          <span>View Atelier</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-xs font-bold text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ================= VIEW 2: 🧵 PREMIUM FABRICS / MATERIALS GRID ================= */}
          {!loading && !apiError && view === 'fabrics' && items.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((fab) => (
                <div
                  key={fab._id}
                  className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Fabric Photo */}
                    <div className="aspect-[16/10] overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                      <img
                        src={fab.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'}
                        alt={fab.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-md">
                          {fab.category}
                        </span>
                        {fab.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shadow-sm">
                            ⭐ {fab.badge}
                          </span>
                        )}
                      </div>
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold backdrop-blur-md">
                        ✓ In Stock
                      </span>
                    </div>

                    {/* Fabric Details */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                            {fab.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {fab.color || 'Premium Tone'} • {fab.pattern || 'Weave'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                            ₹{fab.pricePerMeter}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-semibold">/ meter</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {fab.description || 'Premium material verified for bespoke luxury stitching.'}
                      </p>

                      {/* Tailor Studio attribution */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={fab.tailorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                            alt={fab.tailorName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/20"
                          />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] truncate max-w-[120px]">
                              {fab.tailorName || 'Tailor Studio'}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-blue-500" />
                              {fab.tailorCity || 'Delhi NCR'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Details / Order with Tailor */}
                  <div className="p-5 pt-0 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFabricModal(fab)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    {fab.tailorId && (
                      <Link
                        to={`/tailor/${fab.tailorId}`}
                        className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Book Tailor</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= FABRIC DETAILS MODAL ================= */}
      {selectedFabricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedFabricModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={selectedFabricModal.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'}
                alt={selectedFabricModal.name}
                className="w-full sm:w-52 h-52 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-md"
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
                    {selectedFabricModal.category}
                  </span>
                  {selectedFabricModal.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      ⭐ {selectedFabricModal.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {selectedFabricModal.name}
                </h3>

                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  ₹{selectedFabricModal.pricePerMeter} <span className="text-xs text-slate-400 font-normal">/ meter</span>
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {selectedFabricModal.description || 'Finest quality fabric crafted for bespoke tailoring, smooth drape and lasting finish.'}
                </p>
              </div>
            </div>

            {/* Fabric Specs Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Color &amp; Tone:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFabricModal.color || 'Classic'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Pattern / Weave:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFabricModal.pattern || 'Fine Plain Weave'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Available Quantity:</span>
                <span className="font-bold text-emerald-600">{selectedFabricModal.quantityMeters || 25} meters in stock</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Associated Studio:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFabricModal.tailorName} ({selectedFabricModal.tailorCity})</span>
              </div>
            </div>

            {/* Actions: Book Tailor or WhatsApp */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {selectedFabricModal.tailorId ? (
                <Link
                  to={`/tailor/${selectedFabricModal.tailorId}`}
                  onClick={() => setSelectedFabricModal(null)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition-all"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Book Bespoke Tailoring with {selectedFabricModal.tailorName}</span>
                </Link>
              ) : (
                <Link
                  to="/search"
                  onClick={() => setSelectedFabricModal(null)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-xs font-bold text-white shadow-lg transition-all"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Find Master Tailors</span>
                </Link>
              )}

              <a
                href={`https://wa.me/${(selectedFabricModal.tailorPhone || '918789682127').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Namaste, I would like to inquire about ordering custom tailoring with "${selectedFabricModal.name}" (₹${selectedFabricModal.pricePerMeter}/m).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-5 py-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TailorSearch
