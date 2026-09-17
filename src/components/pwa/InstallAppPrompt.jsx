import React, { useState } from 'react'
import { Download, X, Share, PlusSquare, Smartphone, Check } from 'lucide-react'
import { usePWA } from '../../hooks/usePWA'
import zeloLogo from '../../assets/Logo.png'

export const InstallAppPrompt = () => {
  const {
    isStandalone,
    isInstalled,
    isIOS,
    isAndroid,
    isMobileDevice,
    canInstall,
    isInstallDismissed,
    promptInstall,
    dismissInstallPrompt
  } = usePWA()

  const [showIosModal, setShowIosModal] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  // Do not show prompt if already installed, in standalone mode, or dismissed by user
  if (isStandalone || isInstalled || isInstallDismissed) {
    return null
  }

  // Handle Android / Chrome prompt click
  const handleAndroidInstall = async () => {
    setIsInstalling(true)
    try {
      await promptInstall()
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <>
      {/* FLOATING MOBILE PWA INSTALLATION BANNER */}
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-slate-900/95 text-white backdrop-blur-xl border border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/10 p-2 flex items-center justify-center shrink-0 border border-white/15">
              <img src={zeloLogo} alt="ZELO App" className="w-full h-full object-contain" />
            </div>

            <div className="min-w-0">
              <h4 className="text-xs font-black tracking-wide uppercase text-slate-100 flex items-center gap-1.5">
                <span>Install ZELO App</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mobile
                </span>
              </h4>
              <p className="text-[11px] font-medium text-slate-300 truncate mt-0.5">
                {isIOS ? 'Add to Home Screen for fast mobile access' : 'Full-screen app, zero app store required'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isIOS ? (
              <button
                type="button"
                onClick={() => setShowIosModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/25 cursor-pointer"
              >
                <Share className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAndroidInstall}
                disabled={isInstalling}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalling ? 'Installing...' : 'Install'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={dismissInstallPrompt}
              title="Dismiss"
              aria-label="Dismiss installation prompt"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS STEP-BY-STEP INSTALLATION MODAL */}
      {showIosModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-6 duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200/60">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Install ZELO on iOS</h3>
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
              onClick={() => {
                setShowIosModal(false)
                dismissInstallPrompt()
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/25 cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  )
}
