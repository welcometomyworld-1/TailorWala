import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPut } from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import ImageInputWithUpload from '../components/ImageInputWithUpload.jsx'

export function TailorProfilePage() {
  const { success, error } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    shopName: '',
    bio: '',
    experienceYears: 5,
    basePrice: 399,
    city: 'Delhi',
    address: '',
    pincode: '',
    homeVisitAvailable: true,
    homeVisitFee: 99,
    deliveryDays: 7,
    specializations: [],
    servicesOffered: [],
  })

  const [specInput, setSpecInput] = useState('')

  useEffect(() => {
    apiGet('/tailors/profile/me')
      .then((res) => {
        if (res.data) {
          setProfile(res.data)
          setFormData({
            shopName: res.data.shopName || '',
            bio: res.data.bio || '',
            experienceYears: res.data.experienceYears || 5,
            basePrice: res.data.basePrice || 399,
            city: res.data.city || 'Delhi',
            address: res.data.address || '',
            pincode: res.data.pincode || '',
            homeVisitAvailable: res.data.homeVisitAvailable ?? true,
            homeVisitFee: res.data.homeVisitFee || 99,
            deliveryDays: res.data.deliveryDays || 7,
            specializations: res.data.specializations || [],
            servicesOffered: res.data.servicesOffered || [],
            portfolio: res.data.portfolio?.length ? res.data.portfolio : [
              { title: 'Royal Silk Sherwani', category: 'Wedding', imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800', description: 'Handcrafted zari embroidery with silk stole' },
              { title: 'Bespoke Italian Suit', category: 'Men', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', description: 'Super 140s wool blazer with horn buttons' },
              { title: 'Bridal Couture Lehenga', category: 'Wedding', imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', description: 'Double can-can with designer padded blouse' },
            ],
            workConditions: res.data.workConditions || {
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
          })
        }
      })
      .catch((err) => error(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [error])

  const [newDesign, setNewDesign] = useState({
    title: '',
    category: 'Men',
    imageUrl: '',
    description: '',
  })
  const [showAddDesignModal, setShowAddDesignModal] = useState(false)

  const handleAddSpec = () => {
    if (specInput.trim() && !formData.specializations.includes(specInput.trim())) {
      setFormData((f) => ({
        ...f,
        specializations: [...f.specializations, specInput.trim()],
      }))
      setSpecInput('')
    }
  }

  const handleRemoveSpec = (tag) => {
    setFormData((f) => ({
      ...f,
      specializations: f.specializations.filter((s) => s !== tag),
    }))
  }

  const handleToggleCondition = (key) => {
    setFormData((f) => ({
      ...f,
      workConditions: {
        ...(f.workConditions || {}),
        [key]: !f.workConditions?.[key],
      },
    }))
  }

  const handleAddService = () => {
    setFormData((f) => ({
      ...f,
      servicesOffered: [
        ...f.servicesOffered,
        { name: 'Custom Suit / Kurta', price: 999, category: 'Men', turnaroundDays: 5, description: '' },
      ],
    }))
  }

  const handleUpdateService = (index, field, value) => {
    setFormData((f) => {
      const updated = [...f.servicesOffered]
      updated[index] = { ...updated[index], [field]: value }
      return { ...f, servicesOffered: updated }
    })
  }

  const handleRemoveService = (index) => {
    setFormData((f) => ({
      ...f,
      servicesOffered: f.servicesOffered.filter((_, i) => i !== index),
    }))
  }

  const handleAddPortfolioDesign = (e) => {
    e.preventDefault()
    if (!newDesign.title || !newDesign.imageUrl) {
      error('Please enter a design title and image URL')
      return
    }

    setFormData((f) => ({
      ...f,
      portfolio: [
        ...(f.portfolio || []),
        { ...newDesign },
      ],
    }))
    setNewDesign({ title: '', category: 'Men', imageUrl: '', description: '' })
    setShowAddDesignModal(false)
    success('Design added to your gallery! Click "Save Profile" to publish.')
  }

  const handleRemovePortfolioDesign = (index) => {
    setFormData((f) => ({
      ...f,
      portfolio: f.portfolio.filter((_, i) => i !== index),
    }))
    success('Design removed from list')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiPut('/tailors/profile/me', formData)
      success('Tailor profile, services, designs & work conditions updated successfully!')
    } catch (err) {
      error(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const DESIGN_PHOTO_PRESETS = [
    { label: 'Royal Sherwani', url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800', cat: 'Wedding' },
    { label: 'Italian Bespoke Suit', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', cat: 'Men' },
    { label: 'Bridal Red Lehenga', url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', cat: 'Wedding' },
    { label: 'Designer Kurta Set', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', cat: 'Men' },
    { label: 'Padded Silk Blouse', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', cat: 'Women' },
    { label: 'Summer Linen Suit', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', cat: 'Men' },
  ]

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="animate-spin text-4xl mb-3">✂️</div>
        <p className="text-sm font-semibold text-slate-500">Loading your profile configuration...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
          <span>Tailor Portal</span>
          <span>•</span>
          <span>Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Workshop &amp; Profile Setup</h1>
        <p className="text-xs text-slate-500 mt-1">Manage public profile details, services, doorstep fees, and work conditions.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Shop Info */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Studio Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Shop / Studio Name</label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-semibold dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Years of Crafting Experience</label>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-semibold dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Artisan Bio &amp; Story</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-semibold dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Doorstep Fee (₹)</label>
              <input
                type="number"
                value={formData.homeVisitFee}
                onChange={(e) => setFormData({ ...formData, homeVisitFee: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-semibold dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Est. Delivery (Days)</label>
              <input
                type="number"
                value={formData.deliveryDays}
                onChange={(e) => setFormData({ ...formData, deliveryDays: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-semibold dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Work Conditions Editor */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1">
              Work Conditions &amp; Service Guarantees
            </h3>
            <p className="text-xs text-slate-500 mb-4">Toggle which capabilities and conditions appear on your verified customer profile.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'homeVisitAvailable', label: 'Home Visit Available' },
                { key: 'shopVisitAvailable', label: 'Shop Visit Available' },
                { key: 'customMeasurements', label: 'Custom Measurements' },
                { key: 'customStitching', label: 'Custom Stitching' },
                { key: 'expressDelivery', label: 'Express Priority Delivery' },
                { key: 'normalDelivery', label: 'Standard Delivery' },
                { key: 'alterationAvailable', label: 'Alteration Available' },
                { key: 'fabricProvided', label: 'Fabric Provided by Tailor' },
                { key: 'customerFabricAccepted', label: 'Customer Fabric Accepted' },
                { key: 'pickupAvailable', label: 'Doorstep Pickup' },
                { key: 'deliveryAvailable', label: 'Doorstep Delivery' },
              ].map((cond) => {
                const active = formData.workConditions?.[cond.key] ?? true
                return (
                  <button
                    type="button"
                    key={cond.key}
                    onClick={() => handleToggleCondition(cond.key)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                      active
                        ? 'border-blue-600 bg-blue-50/60 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500'
                        : 'border-slate-200 text-slate-500 bg-slate-50 dark:border-slate-800 dark:bg-slate-800'
                    }`}
                  >
                    <span>{cond.label}</span>
                    <span className={`h-2 w-2 rounded-full ${active ? 'bg-blue-600' : 'bg-slate-300'}`} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Specialization Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Specializations</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Wedding Sherwani, Tuxedos"
                value={specInput}
                onChange={(e) => setSpecInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specializations.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 text-xs font-bold flex items-center gap-1.5"
                >
                  {tag}
                  <button type="button" onClick={() => handleRemoveSpec(tag)} className="text-red-500 hover:text-red-700 font-black">✕</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Services & Pricing Menu */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Services &amp; Pricing Catalog</h2>
              <p className="text-xs text-slate-500">Configure what customers can book from your tailor profile.</p>
            </div>
            <button
              type="button"
              onClick={handleAddService}
              className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold hover:bg-blue-700 shadow-sm"
            >
              + Add New Service
            </button>
          </div>

          <div className="space-y-4">
            {formData.servicesOffered.map((srv, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 grid gap-3 sm:grid-cols-4 items-center"
              >
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400">Service Name</label>
                  <input
                    type="text"
                    value={srv.name}
                    onChange={(e) => handleUpdateService(idx, 'name', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-bold dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400">Price (₹)</label>
                  <input
                    type="number"
                    value={srv.price}
                    onChange={(e) => handleUpdateService(idx, 'price', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-black text-blue-600 dark:text-blue-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Category</label>
                    <select
                      value={srv.category}
                      onChange={(e) => handleUpdateService(idx, 'category', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs dark:text-white"
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Alteration">Alteration</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="p-1 text-red-500 hover:text-red-700 font-bold self-end text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Designs & Previous Work Gallery Manager */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                <span>🎨 Tailor Craftsmanship</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Designs &amp; Previous Work Showcase</h2>
              <p className="text-xs text-slate-500">Upload and showcase photos of your best stitched designs and past client garments.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddDesignModal(!showAddDesignModal)}
              className="rounded-xl bg-purple-600 text-white px-4 py-2 text-xs font-bold hover:bg-purple-700 shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>+ Add New Design Photo</span>
            </button>
          </div>

          {/* Add Design Form Box */}
          {showAddDesignModal && (
            <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 space-y-4">
              <h3 className="text-xs font-black uppercase text-purple-900 dark:text-purple-300">Add New Garment Design</h3>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Design Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Navy Blue Velvet Sherwani"
                    value={newDesign.title}
                    onChange={(e) => setNewDesign({ ...newDesign, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={newDesign.category}
                    onChange={(e) => setNewDesign({ ...newDesign, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold dark:text-white outline-none"
                  >
                    <option value="Men">Men (Suits, Sherwanis, Kurtas)</option>
                    <option value="Women">Women (Lehengas, Blouses, Gowns)</option>
                    <option value="Kids">Kids Wear</option>
                    <option value="Wedding">Wedding &amp; Festive Special</option>
                    <option value="Alteration">Alterations &amp; Restyling</option>
                  </select>
                </div>
              </div>

              <ImageInputWithUpload
                label="Design Showcase Photo"
                value={newDesign.imageUrl}
                onChange={(img) => setNewDesign({ ...newDesign, imageUrl: img })}
                placeholder="Paste direct URL or upload image file..."
                presets={DESIGN_PHOTO_PRESETS}
                required
              />

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted zardozi embroidery with satin silk lining"
                  value={newDesign.description}
                  onChange={(e) => setNewDesign({ ...newDesign, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDesignModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPortfolioDesign}
                  className="rounded-xl bg-purple-600 text-white px-5 py-1.5 text-xs font-bold hover:bg-purple-700"
                >
                  Add Design to Showcase
                </button>
              </div>
            </div>
          )}

          {/* Current Designs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {formData.portfolio?.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex flex-col shadow-xs"
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
                  <button
                    type="button"
                    onClick={() => handleRemovePortfolioDesign(idx)}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-700 transition-transform active:scale-95"
                    title="Delete design"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!formData.portfolio || formData.portfolio.length === 0) && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500">No design photos uploaded yet. Add photos of your previous stitches to attract 3x more bookings!</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60"
          >
            {saving ? 'Saving Changes...' : 'Save Profile &amp; Pricing →'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TailorProfilePage
