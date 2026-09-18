import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity">
      <div
        className={`w-full ${maxWidth} bg-white h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] rounded-none sm:rounded-3xl border-0 sm:border border-slate-100 shadow-2xl overflow-hidden transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 flex flex-col`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 shrink-0 bg-white">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 pb-16 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}
