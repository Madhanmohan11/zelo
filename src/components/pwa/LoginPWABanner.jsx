import React, { useState } from 'react'
import { Smartphone, Download, Share, PlusSquare, Check, X, QrCode, Monitor, Sparkles } from 'lucide-react'
import { usePWA } from '../../hooks/usePWA'
import zeloLogo from '../../assets/Logo.png'

export const LoginPWABanner = () => {
  const {
    isStandalone,
    isInstalled,
    isIOS,
    isAndroid,
    isMobileDevice,
    isDesktop,
    canInstall,
    promptInstall
  } = usePWA()

  const [showIosModal, setShowIosModal] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://zelo.app'

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosModal(true)
      return
    }
    if (canInstall) {
      setIsInstalling(true)
      try {
        await promptInstall()
      } finally {
        setIsInstalling(false)
      }
    } else if (isDesktop) {
      setShowQrModal(true)
    } else {
      setShowIosModal(true)
    }
  }

  return (
    <>
      <div className="w-full max-w-md mt-6 animate-in slide-in-from-bottom-3 duration-300">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 border border-slate-700/60 shadow-xl relative overflow-hidden">
          {/* Subtle Glow background effect */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  Mobile-First Experience
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  PWA Ready
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                ZELO is designed for your mobile lifestyle. Install ZELO on your phone for the best experience.
              </p>

              {/* ACTION BUTTON / STATUS BADGE */}
              <div className="mt-4 flex items-center gap-2.5 flex-wrap">
                {isStandalone || isInstalled ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>ZELO App Installed</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      disabled={isInstalling}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isIOS ? (
                        <>
                          <Share className="w-4 h-4" />
                          <span>Install on iPhone</span>
                        </>
                      ) : canInstall ? (
                        <>
                          <Download className="w-4 h-4" />
                          <span>{isInstalling ? 'Installing...' : 'Install ZELO App'}</span>
                        </>
                      ) : isDesktop ? (
                        <>
                          <QrCode className="w-4 h-4" />
                          <span>Scan for Mobile</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Install Instructions</span>
                        </>
                      )}
                    </button>

                    {isDesktop && canInstall && (
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="px-3 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Show Mobile QR Code"
                      >
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span>QR</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS STEP-BY-STEP INSTALLATION MODAL */}
      {showIosModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-6 duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200/60">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Install ZELO on iPhone</h3>
                  <p className="text-xs text-slate-500 font-semibold">Follow 3 quick steps in Safari</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {/* STEP 1 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs font-semibold text-slate-800 flex-1">
                  Tap the <span className="font-extrabold text-emerald-700">Share</span> icon at the bottom of Safari
                </div>
                <Share className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              {/* STEP 2 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs font-semibold text-slate-800 flex-1">
                  Scroll down and tap <span className="font-extrabold text-emerald-700">Add to Home Screen</span>
                </div>
                <PlusSquare className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              {/* STEP 3 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs font-semibold text-slate-800 flex-1">
                  Tap <span className="font-extrabold text-emerald-700">Add</span> in the top right corner
                </div>
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/25 cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">Mobile Access</span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Open ZELO on Mobile</h3>
              <p className="text-xs font-semibold text-slate-500">Scan this QR code with your phone camera</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`}
                alt="Scan to open ZELO on mobile"
                className="w-44 h-44 rounded-xl border border-slate-200 p-2 bg-white shadow-sm"
              />
              <p className="text-[11px] font-mono text-slate-500 mt-3 truncate max-w-[240px]">{currentUrl}</p>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
