import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGet } from '../services/api.js'
import { MOCK_TESTIMONIALS, MOCK_GALLERY } from '../data/mockData.js'
import {
  Scissors,
  Sparkles,
  MapPin,
  Star,
  ArrowRight,
  Search,
  Gift,
  Shirt,
  ShieldCheck,
  X,
  MessageCircle,
} from 'lucide-react'

const LUXURY_FABRICS = [
  {
    _id: 'fab-mulberry-silk',
    name: 'Pure Mulberry Silk',
    category: 'Silk & Satin',
    pricePerMeter: 1299,
    rating: 4.9,
    description: '100% natural Mulberry silk with a luminous pearl sheen. Handwoven in Varanasi for regal sherwanis, bridal blouses, and statement dupattas.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    gsm: '90 GSM',
    width: '44 Inches',
    recommended: 'Bridal Lehengas, Royal Sherwanis, Saree Blouses',
    care: 'Dry clean only. Store in muslin cloth.',
  },
  {
    _id: 'fab-merino-wool',
    name: 'Super 140s Merino Wool',
    category: 'Wool & Suiting',
    pricePerMeter: 2499,
    rating: 5.0,
    description: 'Ultra-fine Italian weave Merino wool with natural crease recovery and four-season breathability. Ideal for boardroom suits and tuxedos.',
    image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800',
    gsm: '260 GSM',
    width: '58 Inches',
    recommended: '3-Piece Bespoke Suits, Blazers, Formal Trousers',
    care: 'Specialist dry clean only. Steam press.',
  },
  {
    _id: 'fab-giza-cotton',
    name: 'Egyptian Giza Cotton',
    category: 'Cotton & Linen',
    pricePerMeter: 799,
    rating: 4.8,
    description: 'Extra-long staple Egyptian Giza cotton with a silky soft handfeel, exceptional durability, and cooling comfort in hot climates.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    gsm: '120 GSM',
    width: '56 Inches',
    recommended: 'Custom Dress Shirts, Casual Kurtas, Summer Kurtis',
    care: 'Machine wash cold. Warm iron while slightly damp.',
  },
  {
    _id: 'fab-banarasi-brocade',
    name: 'Pure Banarasi Brocade',
    category: 'Festive & Bridal',
    pricePerMeter: 1899,
    rating: 4.9,
    description: 'Authentic zari brocade crafted by heritage master weavers. Rich golden flora motifs woven on royal crimson and emerald grounds.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
    gsm: '180 GSM',
    width: '44 Inches',
    recommended: 'Wedding Outfits, Festive Kurtas, Nehru Jackets',
    care: 'Dry clean only. Iron on reverse side.',
  },
]

export function Home() {
  const [city, setCity] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [featured, setFeatured] = useState([])
  const [meerutTailors, setMeerutTailors] = useState([])
  const [delhiTailors, setDelhiTailors] = useState([])
  const [gzbTailors, setGzbTailors] = useState([])
  const [nearbyCity, setNearbyCity] = useState('Delhi')
  const [selectedFabric, setSelectedFabric] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Fetch featured tailors
    apiGet('/tailors')
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || []
        setFeatured(list.slice(0, 6))
      })
      .catch(() => {})

    // 2. Fetch City-specific tailors
    apiGet('/tailors?city=Delhi')
      .then((res) => setDelhiTailors(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {})

    apiGet('/tailors?city=Meerut')
      .then((res) => setMeerutTailors(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {})

    apiGet('/tailors?city=Ghaziabad')
      .then((res) => setGzbTailors(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {})
  }, [])

  const currentNearbyTailors =
    nearbyCity === 'Meerut'
      ? meerutTailors.length > 0 ? meerutTailors : featured
      : nearbyCity === 'Ghaziabad'
      ? gzbTailors.length > 0 ? gzbTailors : featured
      : delhiTailors.length > 0 ? delhiTailors : featured

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (specialty) params.set('specialization', specialty)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <>
      {/* Offers Banner */}
      <div className="overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 py-2.5 text-white shadow-sm">
        <div className="flex animate-[marquee_24s_linear_infinite] whitespace-nowrap gap-12 text-xs md:text-sm font-semibold">
          {[1, 2].map((k) => (
            <React.Fragment key={k}>
              <span className="inline-flex items-center gap-2 px-4">
                <Gift className="w-4 h-4 text-amber-300" />
                Flat ₹100 OFF on First Tailoring Order — Code: <span className="rounded bg-white/20 px-2 py-0.5 font-mono font-bold">WELCOME100</span>
              </span>
              <span className="inline-flex items-center gap-2 px-4">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Free Doorstep Measurement &amp; Trial Across Meerut, Delhi &amp; NCR
              </span>
              <span className="inline-flex items-center gap-2 px-4">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                100% Perfect Fit Guarantee with Unlimited Free Alterations
              </span>
            </React.Fragment>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-b-3xl bg-slate-900 px-4 pb-14 pt-12 text-white md:pb-28 md:pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
        <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-300 backdrop-blur">
            <Scissors className="w-3.5 h-3.5 text-blue-400" />
            Bespoke Tailoring Across Meerut, Delhi &amp; NCR
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl px-2 leading-tight">
            Artisan Fit Tailoring, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Delivered</span> to You.
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-slate-300 text-base md:text-lg px-4 leading-relaxed">
            Experience luxury custom tailoring without stepping out. Verified master craftsmen, doorstep measurements, premium fabrics, and insured delivery.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
            <Link
              to="/search"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Scissors className="w-5 h-5" />
              Book Master Tailor
            </Link>
            <a
              href="https://wa.me/918789682127?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20your%20tailoring%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur hover:bg-white/20 transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              WhatsApp Consultation
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Search Bar */}
      <section className="mx-auto -mt-10 max-w-5xl px-4 relative z-10">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-md lg:flex-row lg:items-end dark:border-slate-800 dark:bg-slate-900/95"
        >
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Location / City</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <MapPin className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. Meerut, Delhi, Ghaziabad, Noida"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Garment / Specialty</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. 3-Piece Suit, Bridal Lehenga, Kurta, Blouse"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Search Tailors
          </button>
        </form>

        {/* Quick City Tags */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Popular Hubs:</span>
          {[
            { name: 'Delhi', label: '🏛️ Delhi NCR' },
            { name: 'Meerut', label: '✂️ Meerut' },
            { name: 'Ghaziabad', label: '🏙️ Ghaziabad' },
            { name: 'Noida', label: '🏢 Noida' },
          ].map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => navigate(`/search?city=${encodeURIComponent(c.name)}`)}
              className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 font-bold shadow-xs transition-all cursor-pointer"
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Luxury Fabrics Catalog */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3 dark:bg-blue-950">
              <Shirt className="w-3.5 h-3.5 text-blue-600" />
              Luxury Fabrics
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white">Premium Materials &amp; Cloths</h2>
            <p className="mt-3 text-slate-600 text-lg dark:text-slate-300">Choose from pure mulberry silks, merino suiting wool, and Giza cottons for your bespoke commissions.</p>
          </div>
          <Link to="/search?view=fabrics" className="group text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5">
            View All Materials
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {LUXURY_FABRICS.map((cloth) => (
            <div
              key={cloth._id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={cloth.image}
                  alt={cloth.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 backdrop-blur shadow-sm">
                  {cloth.category}
                </span>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {cloth.rating}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{cloth.name}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{cloth.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Price per meter</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹{cloth.pricePerMeter}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFabric(cloth)}
                    className="rounded-xl bg-slate-900 hover:bg-blue-600 text-white px-4 py-2 text-xs font-bold transition-colors shadow-sm dark:bg-slate-800 dark:hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fabric Detail Modal */}
      {selectedFabric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedFabric(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={selectedFabric.image}
                alt={selectedFabric.name}
                className="w-full sm:w-48 h-48 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
              />
              <div className="flex-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold mb-1">
                  {selectedFabric.category}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedFabric.name}</h3>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">₹{selectedFabric.pricePerMeter} <span className="text-xs text-slate-400 font-normal">/ meter</span></p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{selectedFabric.description}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Weight / Density:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFabric.gsm}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Fabric Width:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFabric.width}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-semibold">Recommended Garments:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFabric.recommended}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                to={`/search?view=fabrics&search=${encodeURIComponent(selectedFabric.name)}`}
                onClick={() => setSelectedFabric(null)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all"
              >
                <Scissors className="w-4 h-4" />
                Find Tailors &amp; Materials for this Fabric
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Find Tailors near you */}
      <section className="bg-blue-50/60 py-20 md:py-28 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-blue-600 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Local Master Directory
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white">Tailors in {nearbyCity}</h2>
              <p className="mt-3 text-slate-600 text-lg dark:text-slate-300">Verified artisans serving your neighborhood with home measurement visits and doorstep fittings.</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400">Select City</span>
              <select
                value={nearbyCity}
                onChange={(e) => setNearbyCity(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-800 outline-none dark:text-white cursor-pointer"
              >
                <option value="Delhi">Delhi NCR</option>
                <option value="Meerut">Meerut</option>
                <option value="Ghaziabad">Ghaziabad</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {currentNearbyTailors.map((t) => {
              const tailorId = t._id || t.id || 'tlr-delhi-1'
              const tailorName = t.shopName || t.user?.name || 'Master Artisan'
              const tailorCity = t.city || t.user?.city || nearbyCity
              const tailorImg = t.image || t.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'

              return (
                <Link
                  key={tailorId}
                  to={`/tailor/${tailorId}`}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-800"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={tailorImg}
                      alt={tailorName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-bold text-slate-900 shadow">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {t.ratingAverage ? Number(t.ratingAverage).toFixed(1) : '4.8'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 truncate dark:text-white text-base">{tailorName}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                      {t.area || tailorCity}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(t.specializations || ['Suits', 'Kurtas']).slice(0, 2).map((s) => (
                        <span key={s} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">{s}</span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                      <span className="text-xs text-slate-400 font-semibold">Starts At</span>
                      <span className="font-black text-blue-600 dark:text-blue-400">₹{t.basePrice || 499}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Master Tailors Across India */}
      <section className="bg-slate-50 py-20 md:py-32 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Master Craftsmen
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight dark:text-white">Featured Master Studios</h2>
            <p className="mt-4 max-w-2xl mx-auto text-slate-600 text-lg dark:text-slate-300">Vetted artisans with decades of experience in bespoke tailoring.</p>
          </div>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => {
              const tailorId = t._id || t.id
              const tailorName = t.shopName || t.user?.name || 'Master Artisan'
              const tailorImg = t.image || t.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'

              return (
                <Link
                  key={tailorId}
                  to={`/tailor/${tailorId}`}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-800/90"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
                    <img src={tailorImg} alt={tailorName} className="h-full w-full object-cover" />
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-slate-900 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {t.ratingAverage ? Number(t.ratingAverage).toFixed(1) : '4.8'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white">{tailorName}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500 flex items-center gap-1 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        {t.city || 'Delhi NCR'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Starts At</p>
                      <p className="text-base font-black text-slate-900 dark:text-white">₹{t.basePrice || 499}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {(t.specializations || ['Suits', 'Sherwanis']).slice(0, 3).map((s) => (
                      <span key={s} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">{s}</span>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">View Services &amp; Work Conditions</span>
                    <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all dark:bg-blue-950">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-16 md:px-20 md:py-24 text-center lg:text-left">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">Ready for a <span className="text-blue-400 underline decoration-blue-400/30 underline-offset-8">Perfect Fit?</span></h2>
              <p className="mt-8 text-xl text-slate-300 leading-relaxed">Join thousands of happy customers who trust TailorWala for their custom clothing needs. Experience master craftsmanship delivered to your doorstep.</p>
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-6">
                <Link to="/auth" className="w-full sm:w-auto inline-block rounded-2xl bg-blue-600 px-10 py-5 font-black text-white shadow-2xl shadow-blue-600/40 hover:bg-blue-700 transition-all active:scale-95 text-center">
                  Book Your Tailor Now
                </Link>
                <div className="flex -space-x-3 overflow-hidden">
                  {MOCK_TESTIMONIALS.map((r) => (
                    <img key={r.id} src={r.avatar} alt={r.name} className="inline-block h-12 w-12 rounded-full ring-4 ring-slate-900 object-cover" />
                  ))}
                  <div className="flex h-12 items-center px-4 text-sm font-bold text-slate-400">
                    +2.4k happy clients
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4 max-w-sm rotate-3">
              {MOCK_GALLERY.slice(0, 4).map((g) => (
                <div key={g.id} className="aspect-square w-32 overflow-hidden rounded-3xl border border-white/10">
                  <img src={g.after} alt={g.label} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
