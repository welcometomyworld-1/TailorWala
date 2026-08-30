import React, { useState, useRef } from 'react'
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Trash2,
  AlertCircle,
  Sparkles,
  Camera,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export function PhotoUploadModal({ isOpen, onClose, currentPhoto, onPhotoUpdated }) {
  const { updateProfile } = useAuth()
  const { success, error } = useToast()

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(currentPhoto || '')
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFile = (file) => {
    if (!file) return

    // Format verification: JPG, JPEG, PNG, WebP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      error('Please upload an image in JPG, PNG, or WebP format.')
      return
    }

    // Size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      error('File size exceeds 5MB limit. Please upload a smaller image.')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result)
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

  const handleSavePhoto = async () => {
    if (!previewUrl && !selectedFile) return

    setLoading(true)
    try {
      // Save avatar to profile
      const res = await updateProfile({ avatar: previewUrl })
      success('Profile photo updated successfully!')
      if (onPhotoUpdated) onPhotoUpdated(previewUrl)
      onClose()
    } catch (err) {
      error(err.message || 'Failed to update photo')
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return

    setLoading(true)
    try {
      const defaultAvatar = ''
      await updateProfile({ avatar: defaultAvatar })
      setPreviewUrl('')
      setSelectedFile(null)
      success('Profile photo removed.')
      if (onPhotoUpdated) onPhotoUpdated(defaultAvatar)
      onClose()
    } catch (err) {
      error(err.message || 'Failed to remove photo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Profile Photo Management</h3>
            <p className="text-xs text-slate-500">Official photo across your Dashboard &amp; Digital ID Card</p>
          </div>
        </div>

        {/* Live Image Preview Area */}
        <div className="my-5 flex flex-col items-center">
          <div className="relative group">
            <img
              src={
                previewUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
              }
              alt="Photo Preview"
              className="h-32 w-32 rounded-full object-cover ring-4 ring-blue-600/30 dark:ring-blue-500/30 shadow-xl"
            />
            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl('')
                  setSelectedFile(null)
                }}
                className="absolute top-0 right-0 p-1.5 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-all cursor-pointer"
                title="Clear selected image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-2">Live ID Card Preview</span>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50 dark:bg-slate-800/40'
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
          <Upload className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400 mb-2 animate-bounce" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Click to upload or drag &amp; drop
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Supports JPG, JPEG, PNG, WebP (Max size: 5MB)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between gap-2">
          {currentPhoto ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleRemovePhoto}
              className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading || (!selectedFile && previewUrl === currentPhoto)}
              onClick={handleSavePhoto}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Photo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoUploadModal
