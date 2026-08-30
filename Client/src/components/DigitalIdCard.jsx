import React, { useState, useRef } from 'react'
import {
  Shield,
  ShieldCheck,
  QrCode,
  Download,
  Printer,
  RotateCw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  X,
} from 'lucide-react'

export function DigitalIdCard({ user, type = 'employee', onClose, embedded = false }) {
  const [side, setSide] = useState('front') // 'front' | 'back'
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef(null)

  if (!user) return null

  const isEmployee = type === 'employee' || user.role === 'employee' || user.role === 'admin' || user.role === 'super_admin'
  const isTailor = type === 'tailor' || user.role === 'tailor'

  const idCode =
    user.employeeId ||
    user.tailorId ||
    (isEmployee ? `TW-EMP-${String(user._id || '0001').slice(-4).toUpperCase()}` : `TW-TLR-${String(user._id || '0001').slice(-6).toUpperCase()}`)

  const uniqueNo =
    user.uniqueNumber ||
    (isEmployee ? `EMP-${String(user._id || '741926').slice(-6).toUpperCase()}` : `TLR-${String(user._id || '982741').slice(-6).toUpperCase()}`)

  const roleTitle = isEmployee
    ? user.employeeDesignation || (user.role === 'super_admin' ? 'Super Administrator' : 'Operations Associate')
    : user.specializations?.length > 0
    ? user.specializations.slice(0, 2).join(' & ') + ' Specialist'
    : 'Master Artisan Tailor'

  const deptOrLocation = isEmployee
    ? user.department || 'Operations Directorate'
    : user.city ? `${user.city} Atelier` : 'Delhi NCR Atelier'

  const photo =
    user.avatar ||
    (isEmployee
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400')

  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify-id/${encodeURIComponent(idCode)}`
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verifyUrl)}`

  const handlePrint = () => {
    window.print()
  }

  // Draw card onto HTML5 Canvas for instant high-resolution PNG download
  const handleDownload = () => {
    setDownloading(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 750
      canvas.height = 1100
      const ctx = canvas.getContext('2d')

      // Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, 750, 1100)
      if (isEmployee) {
        gradient.addColorStop(0, '#0f172a')
        gradient.addColorStop(0.5, '#1e293b')
        gradient.addColorStop(1, '#0f172a')
      } else {
        gradient.addColorStop(0, '#042f2e')
        gradient.addColorStop(0.5, '#115e59')
        gradient.addColorStop(1, '#042f2e')
      }
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 750, 1100)

      // Gold / Blue Border Frame
      ctx.lineWidth = 12
      ctx.strokeStyle = isEmployee ? '#3b82f6' : '#10b981'
      ctx.strokeRect(20, 20, 710, 1060)

      // Header Bar
      ctx.fillStyle = isEmployee ? '#2563eb' : '#059669'
      ctx.fillRect(30, 30, 690, 120)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('TAILORWALA', 375, 80)

      ctx.font = 'bold 18px sans-serif'
      ctx.fillStyle = '#cbd5e1'
      ctx.fillText(
        isEmployee ? 'OFFICIAL SECURITY BADGE & EMPLOYEE ID' : 'OFFICIAL VERIFIED MASTER ARTISAN',
        375,
        120,
      )

      // Photo placeholder & frame
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(375, 290, 110, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(img, 265, 180, 220, 220)
        ctx.restore()

        // Border ring
        ctx.lineWidth = 8
        ctx.strokeStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(375, 290, 110, 0, Math.PI * 2, true)
        ctx.stroke()

        // Name & Role
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 38px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(user.name || 'Member Name', 375, 450)

        ctx.fillStyle = isEmployee ? '#60a5fa' : '#34d399'
        ctx.font = 'bold 24px sans-serif'
        ctx.fillText(roleTitle, 375, 490)

        // Details Panel
        ctx.fillStyle = '#ffffff15'
        ctx.fillRect(60, 530, 630, 240)
        ctx.strokeStyle = '#ffffff25'
        ctx.strokeRect(60, 530, 630, 240)

        ctx.textAlign = 'left'
        ctx.font = 'bold 18px sans-serif'
        ctx.fillStyle = '#94a3b8'

        ctx.fillText('FORMAL ID:', 90, 575)
        ctx.fillText('UNIQUE NO:', 90, 625)
        ctx.fillText('DEPARTMENT:', 90, 675)
        ctx.fillText('STATUS:', 90, 725)

        ctx.textAlign = 'right'
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 22px monospace'
        ctx.fillText(idCode, 660, 575)
        ctx.fillText(uniqueNo, 660, 625)
        ctx.font = 'bold 20px sans-serif'
        ctx.fillText(deptOrLocation, 660, 675)

        ctx.fillStyle = '#4ade80'
        ctx.fillText(user.isActive !== false ? '● ACTIVE & VERIFIED' : '● SUSPENDED', 660, 725)

        // Draw QR
        const qrImg = new Image()
        qrImg.crossOrigin = 'anonymous'
        qrImg.onload = () => {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(285, 800, 180, 180)
          ctx.drawImage(qrImg, 290, 805, 170, 170)

          ctx.fillStyle = '#94a3b8'
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('Scan QR Code with camera to verify live credentials', 375, 1010)

          ctx.fillStyle = '#64748b'
          ctx.font = '12px sans-serif'
          ctx.fillText(`Issued: ${new Date().getFullYear()} • Auth: TailorWala Security Directorate`, 375, 1040)

          // Download Trigger
          const link = document.createElement('a')
          link.download = `TailorWala_${idCode}_ID_Card.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
          setDownloading(false)
        }
        qrImg.onerror = () => {
          // fallback without QR image
          const link = document.createElement('a')
          link.download = `TailorWala_${idCode}_ID_Card.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
          setDownloading(false)
        }
        qrImg.src = qrApiUrl
      }
      img.onerror = () => {
        // fallback download without photo if CORS blocks
        const link = document.createElement('a')
        link.download = `TailorWala_${idCode}_ID_Card.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        setDownloading(false)
      }
      img.src = photo
    } catch {
      setDownloading(false)
    }
  }

  return (
    <div className={`w-full max-w-md mx-auto ${embedded ? '' : 'p-2'}`}>
      {/* Top Action Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-4 bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setSide(side === 'front' ? 'back' : 'front')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white shadow-xs hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Flip to {side === 'front' ? 'Back' : 'Front'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Download Digital ID Badge"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Download'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Print ID Badge"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive ID Badge Canvas Card */}
      <div
        ref={cardRef}
        id="tailorwala-printable-id-card"
        className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-500 select-none ${
          isEmployee
            ? 'border-blue-500/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white'
            : 'border-emerald-500/50 bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 text-white'
        }`}
      >
        {/* Holographic Security Overlay Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

        {/* ================= FRONT VIEW ================= */}
        {side === 'front' && (
          <div className="p-6 sm:p-7 relative z-10 flex flex-col justify-between min-h-[520px] animate-in fade-in zoom-in-95 duration-300">
            {/* Header Brand */}
            <div>
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                    isEmployee ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-lg font-black tracking-tight block leading-none">
                      Tailor<span className={isEmployee ? 'text-blue-400' : 'text-emerald-400'}>Wala</span>
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                      {isEmployee ? 'Official Staff ID Badge' : 'Accredited Artisan Badge'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>VERIFIED</span>
                  </span>
                </div>
              </div>

              {/* Photo & Identity Section */}
              <div className="mt-6 flex flex-col items-center text-center">
                <div className="relative">
                  <img
                    src={photo}
                    alt={user.name}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-white/90 shadow-xl"
                  />
                  <div className={`absolute bottom-0 right-1 h-6 w-6 rounded-full flex items-center justify-center text-white shadow-md ${
                    isEmployee ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="mt-3.5 text-2xl font-black text-white tracking-tight">{user.name}</h3>
                <p className={`text-xs font-bold ${isEmployee ? 'text-blue-300' : 'text-emerald-300'}`}>
                  {roleTitle}
                </p>
                <span className="text-[11px] text-slate-400 font-semibold">{deptOrLocation}</span>
              </div>
            </div>

            {/* Core Identification Numbers Box */}
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {isEmployee ? 'Employee ID' : 'Tailor Partner ID'}
                </span>
                <span className={`font-mono font-black text-sm ${isEmployee ? 'text-blue-400' : 'text-emerald-400'}`}>
                  {idCode}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unique Security No</span>
                <span className="font-mono font-bold text-slate-200">{uniqueNo}</span>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-[11px]">
                  ● {user.isActive !== false ? 'Operational Active' : 'Suspended'}
                </span>
              </div>
            </div>

            {/* Hologram Strip Bottom */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ANTI-FRAUD CHIP ID</span>
              </div>
              <span>ISSUED {new Date().getFullYear()}</span>
            </div>
          </div>
        )}

        {/* ================= BACK VIEW ================= */}
        {side === 'back' && (
          <div className="p-6 sm:p-7 relative z-10 flex flex-col justify-between min-h-[520px] animate-in fade-in zoom-in-95 duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                  Authentication &amp; Trust Directorate
                </span>
                <span className="text-[10px] font-mono text-slate-400">{uniqueNo}</span>
              </div>

              <p className="mt-3 text-[11px] text-slate-300 leading-relaxed">
                This digital security card is the official property of <strong>TailorWala Enterprise Pvt Ltd</strong>. Authorized personnel must present this badge upon request for home visits and workshops.
              </p>

              {/* QR Verification Hub */}
              <div className="mt-5 flex flex-col items-center bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15">
                <div className="p-2 rounded-2xl bg-white shadow-xl">
                  <img
                    src={qrApiUrl}
                    alt="Scan to Verify ID"
                    className="w-32 h-32 object-contain"
                  />
                </div>
                <span className="mt-2.5 text-xs font-bold text-white flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>Scan to Verify Live Credentials</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ID: {idCode}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-center">
              <div className="text-[11px] text-slate-300 font-semibold">
                Emergency Security Hotline: <strong className="text-white">+91 8789682127</strong>
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                © {new Date().getFullYear()} TailorWala Platform • Tampering is a punishable legal offense
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DigitalIdCard
