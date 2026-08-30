import React, { useState, useRef } from 'react'
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Sparkles,
  Camera,
  Check,
} from 'lucide-react'

export function ImageInputWithUpload({
  label = 'Image',
  value = '',
  onChange,
  placeholder = 'https://images.unsplash.com/... or upload image',
  required = false,
  presets = [],
  className = '',
}) {
  const [tab, setTab] = useState('upload') // 'upload' | 'url'
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Please upload an image in JPG, PNG, or WebP format.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller image.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (onChange) onChange(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>

        {/* Tab switch between Upload & URL */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              tab === 'upload'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              tab === 'url'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Upload File Area */}
      {tab === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0])
              }
            }}
          />
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to browse photo from device or drag &amp; drop
              </p>
              <p className="text-[10px] text-slate-400">
                Supports JPG, JPEG, PNG, WebP (Max 5MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Paste URL Input */}
      {tab === 'url' && (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
      )}

      {/* Quick Presets if available */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(p.url)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Live Preview Thumbnail if an image exists */}
      {value && (
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mt-2">
          <img
            src={value}
            alt="Preview"
            className="h-12 w-12 rounded-xl object-cover ring-2 ring-blue-500/30 shrink-0 bg-white"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200'
            }}
          />
          <div className="flex-1 overflow-hidden">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
              Image Selected
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3 h-3" />
              Ready
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageInputWithUpload
