import React, { useState } from 'react'
import { Smartphone, Monitor, X, ExternalLink, QrCode, CheckCircle2 } from 'lucide-react'
import { usePWA } from '../../hooks/usePWA'
import zeloLogo from '../../assets/Logo.png'

export const DesktopMobileNotice = () => {
  const { isDesktop, isStandalone } = usePWA()
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('zelo_desktop_notice_dismissed') === 'true'
  })

  // Do not render on mobile devices, standalone PWA mode, or if user dismissed the notice
  if (!isDesktop || isStandalone || isDismissed) {
    return null
  }

  const handleDismiss = () => {
    localStorage.setItem('zelo_desktop_notice_dismissed', 'true')
    setIsDismissed(true)
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://zelo.app'

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/60 py-3.5 px-4 shadow-md transition-all animate-in slide-in-from-top-4 duration-300">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Brand & Icon */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2 bg-white/10 rounded-2xl border border-white/15 shrink-0 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Mobile-First Experience</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Recommended
                </span>
              </h4>
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">
              ZELO is designed for your mobile lifestyle. Open ZELO on your Android or iPhone for the best experience.
            </p>
          </div>
        </div>

        {/* Right Side: QR Code hint & Dismiss */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono text-slate-200">
            <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[140px]">{currentUrl.replace(/^https?:\/\//, '')}</span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            Continue on Desktop
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            title="Dismiss notice"
            aria-label="Dismiss desktop notice"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
