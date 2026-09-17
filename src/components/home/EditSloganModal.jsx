import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { saveCustomSlogan } from '../../services/userSettingsService'
import { DEFAULT_SLOGAN } from '../../constants/slogan'

export const EditSloganModal = ({ isOpen, onClose, currentSlogan = '', onSaveSuccess = () => {} }) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [slogan, setSlogan] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSlogan(currentSlogan || DEFAULT_SLOGAN)
    }
  }, [isOpen, currentSlogan])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    const clean = slogan.trim()
    if (!clean) {
      showToast('Please enter a valid slogan', 'error')
      return
    }

    if (clean.length > 60) {
      showToast('Slogan cannot exceed 60 characters', 'error')
      return
    }

    setIsSaving(true)
    try {
      await saveCustomSlogan(user.id, clean)
      showToast('Personal slogan saved!', 'success')
      onSaveSuccess(clean)
      onClose()
    } catch (err) {
      console.error('Failed to save slogan:', err)
      showToast(err?.message || 'Failed to save slogan', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const isFormInvalid = !slogan.trim() || isSaving

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Slogan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-3">
            Write a short phrase (max 60 characters) that keeps you motivated every day.
          </p>

          <div className="relative">
            <textarea
              rows={3}
              maxLength={60}
              placeholder="e.g. Stay consistent."
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl p-3.5 text-xs font-extrabold text-slate-900 resize-none transition-all placeholder:text-slate-400 font-sans"
            />
            <div className="text-right text-[10px] font-bold text-slate-400 mt-1">
              {slogan.length}/60
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving} disabled={isFormInvalid}>
            Save Slogan
          </Button>
        </div>
      </form>
    </Modal>
  )
}

