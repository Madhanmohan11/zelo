import React, { useEffect } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Button } from './Button'

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item?',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger'
}) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
        <div
          className={`w-14 h-14 ${
            variant === 'danger'
              ? 'bg-rose-100 text-rose-600 border border-rose-200'
              : 'bg-amber-100 text-amber-600 border border-amber-200'
          } rounded-full flex items-center justify-center mx-auto shadow-sm`}
        >
          {variant === 'danger' ? (
            <Trash2 className="w-7 h-7 stroke-[2.2]" />
          ) : (
            <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full rounded-2xl text-xs font-extrabold border-slate-200"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            isLoading={isLoading}
            className={`w-full ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
            } font-extrabold rounded-2xl text-xs shadow-md`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
