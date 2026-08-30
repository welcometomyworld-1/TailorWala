import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPost, apiPut, apiDelete } from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'

export function MeasurementProfile() {
  const { success, error } = useToast()
  const [profiles, setProfiles] = useState([])
  const [templates, setTemplates] = useState({})
  const [loading, setLoading] = useState(true)

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    profileName: '',
    gender: 'male',
    garmentCategory: 'Shirt',
    measurements: [],
    height: '',
    weight: '',
    fitPreference: 'regular',
    notes: '',
    isDefault: false,
  })

  const loadProfilesAndTemplates = React.useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, tRes] = await Promise.all([
        apiGet('/measurements'),
        apiGet('/measurements/templates'),
      ])
      setProfiles(pRes.data || [])
      setTemplates(tRes.data || {})
    } catch (err) {
      error(err.message || 'Failed to load measurement profiles')
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadProfilesAndTemplates()
  }, [loadProfilesAndTemplates])

  const handleOpenCreate = (gender = 'male', category = 'Shirt') => {
    const templateFields = templates[gender]?.[category] || [
      { name: 'Chest', unit: 'inch', defaultValue: 38 },
      { name: 'Waist', unit: 'inch', defaultValue: 32 },
    ]

    setEditingId(null)
    setFormData({
      profileName: `My ${category}`,
      gender,
      garmentCategory: category,
      measurements: templateFields.map((f) => ({
        name: f.name,
        value: f.defaultValue,
        unit: f.unit || 'inch',
      })),
      height: 175,
      weight: 70,
      fitPreference: 'regular',
      notes: '',
      isDefault: profiles.length === 0,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p) => {
    setEditingId(p._id)
    setFormData({
      profileName: p.profileName,
      gender: p.gender || 'male',
      garmentCategory: p.garmentCategory || 'Shirt',
      measurements: p.measurements || [],
      height: p.height || '',
      weight: p.weight || '',
      fitPreference: p.fitPreference || 'regular',
      notes: p.notes || '',
      isDefault: !!p.isDefault,
    })
    setIsModalOpen(true)
  }

  const handleCategoryChange = (cat) => {
    const templateFields = templates[formData.gender]?.[cat] || []
    setFormData((prev) => ({
      ...prev,
      garmentCategory: cat,
      profileName: `My ${cat}`,
      measurements: templateFields.map((f) => ({
        name: f.name,
        value: f.defaultValue,
        unit: f.unit || 'inch',
      })),
    }))
  }

  const handleGenderChange = (gen) => {
    const defaultCat = gen === 'male' ? 'Shirt' : 'Blouse'
    const templateFields = templates[gen]?.[defaultCat] || []
    setFormData((prev) => ({
      ...prev,
      gender: gen,
      garmentCategory: defaultCat,
      profileName: `My ${defaultCat}`,
      measurements: templateFields.map((f) => ({
        name: f.name,
        value: f.defaultValue,
        unit: f.unit || 'inch',
      })),
    }))
  }

  const updateMeasurementValue = (index, val) => {
    setFormData((prev) => {
      const updated = [...prev.measurements]
      updated[index] = { ...updated[index], value: Number(val) }
      return { ...prev, measurements: updated }
    })
  }

  const addCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      measurements: [...prev.measurements, { name: '', value: 0, unit: 'inch' }],
    }))
  }

  const removeField = (index) => {
    setFormData((prev) => ({
      ...prev,
      measurements: prev.measurements.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.profileName.trim()) {
      error('Please enter a profile name')
      return
    }

    try {
      if (editingId) {
        await apiPut(`/measurements/${editingId}`, formData)
        success('Measurement profile updated!')
      } else {
        await apiPost('/measurements', formData)
        success('New measurement profile created!')
      }
      setIsModalOpen(false)
      loadProfilesAndTemplates()
    } catch (err) {
      error(err.message || 'Failed to save measurement profile')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this measurement profile?')) return
    try {
      await apiDelete(`/measurements/${id}`)
      success('Measurement profile removed')
      setProfiles((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      error(err.message || 'Failed to delete')
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await apiPost(`/measurements/${id}/duplicate`, {})
      success('Profile duplicated successfully!')
      loadProfilesAndTemplates()
    } catch (err) {
      error(err.message || 'Failed to duplicate')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <nav className="mb-4 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-bold">My Measurement Profiles</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Measurement Profiles
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Save custom size specifications for shirts, suits, lehengas, and ethnic wear for seamless 1-click checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCreate('male', 'Shirt')}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
          >
            + New Men&apos;s Profile
          </button>
          <button
            onClick={() => handleOpenCreate('female', 'Blouse')}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            + New Women&apos;s Profile
          </button>
        </div>
      </div>

      {/* Profile Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading your measurement profiles...</div>
      ) : profiles.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-12 text-center">
          <span className="text-5xl block mb-3">📐</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No measurement profiles saved yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Create your first garment profile using our tailored templates or let your tailor record it during a doorstep home visit.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => handleOpenCreate('male', 'Shirt')}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white text-xs shadow-md hover:bg-blue-700"
            >
              Create Men&apos;s Fit
            </button>
            <button
              onClick={() => handleOpenCreate('female', 'Blouse')}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white text-xs shadow-md hover:bg-indigo-700"
            >
              Create Women&apos;s Fit
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <div
              key={p._id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      {p.gender} • {p.garmentCategory}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{p.profileName}</h3>
                  </div>
                  {p.isDefault && (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                      DEFAULT
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Fit Preference</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">{p.fitPreference || 'Regular'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Height / Weight</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{p.height ? `${p.height} cm` : '—'} / {p.weight ? `${p.weight} kg` : '—'}</span>
                  </div>
                </div>

                {/* Measurements Summary */}
                <div className="mt-4 space-y-1.5 text-xs max-h-36 overflow-y-auto pr-1">
                  {(p.measurements || []).map((m, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 py-1 text-slate-600 dark:text-slate-300">
                      <span>{m.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{m.value} {m.unit || 'in'}</span>
                    </div>
                  ))}
                </div>

                {p.notes && (
                  <p className="mt-3 text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                    &ldquo;{p.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 text-xs font-bold hover:bg-slate-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDuplicate(p._id)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 text-xs"
                  title="Duplicate profile"
                >
                  📋
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs"
                  title="Delete profile"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Measurement Profile' : 'Create Measurement Profile'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Gender & Category Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleGenderChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold outline-none dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Garment Category</label>
                  <select
                    value={formData.garmentCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold outline-none dark:text-white"
                  >
                    {formData.gender === 'male'
                      ? ['Shirt', 'Pant', 'Suit', 'Kurta', 'Sherwani', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)
                      : ['Blouse', 'Suit', 'Lehenga', 'Dress', 'Kurti', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Profile Name</label>
                <input
                  type="text"
                  value={formData.profileName}
                  onChange={(e) => setFormData((f) => ({ ...f, profileName: e.target.value }))}
                  placeholder="e.g. Wedding Suit Fit"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData((f) => ({ ...f, height: e.target.value }))}
                    placeholder="175"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData((f) => ({ ...f, weight: e.target.value }))}
                    placeholder="70"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fit Type</label>
                  <select
                    value={formData.fitPreference}
                    onChange={(e) => setFormData((f) => ({ ...f, fitPreference: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white font-semibold"
                  >
                    <option value="slim">Slim Fit</option>
                    <option value="regular">Regular Fit</option>
                    <option value="relaxed">Relaxed Comfort</option>
                    <option value="tailored">Custom Tailored</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Measurement Rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Measurement Fields (Inches)
                  </label>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    + Add Custom Part
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {formData.measurements.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => {
                          const updated = [...formData.measurements]
                          updated[idx].name = e.target.value
                          setFormData((f) => ({ ...f, measurements: updated }))
                        }}
                        placeholder="Part"
                        className="flex-1 text-xs font-semibold bg-transparent dark:text-white outline-none"
                      />
                      <input
                        type="number"
                        step="0.5"
                        value={m.value}
                        onChange={(e) => updateMeasurementValue(idx, e.target.value)}
                        className="w-16 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-1 text-xs text-right font-black text-blue-600 dark:text-blue-400 outline-none"
                      />
                      <span className="text-[10px] text-slate-400">in</span>
                      <button
                        type="button"
                        onClick={() => removeField(idx)}
                        className="text-slate-400 hover:text-red-500 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fit Notes &amp; Styling Preferences</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Side vents, tapered cuffs, extra breathing room around chest..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label htmlFor="isDefault" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Set as default measurement profile
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95"
                >
                  {editingId ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MeasurementProfile
