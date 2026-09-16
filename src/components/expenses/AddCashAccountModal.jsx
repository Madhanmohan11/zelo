import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Wallet, IndianRupee } from 'lucide-react'

export const AddCashAccountModal = ({
  isOpen,
  onClose,
  onSave,
  isSubmitting = false
}) => {
  const [name, setName] = useState('Cash in Hand')
  const [openingBalance, setOpeningBalance] = useState('0')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Please enter a cash account name')
      return
    }

    const numBalance = parseFloat(openingBalance)
    if (isNaN(numBalance) || numBalance < 0) {
      setError('Opening balance must be a valid number (0 or greater)')
      return
    }

    try {
      await onSave({
        account_type: 'cash',
        name: trimmedName,
        nickname: trimmedName,
        opening_balance: numBalance,
        notes: description.trim(),
        currency: 'INR'
      })
      // Reset form
      setName('Cash in Hand')
      setOpeningBalance('0')
      setDescription('')
    } catch (err) {
      setError(err.message || 'Failed to create cash account')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Cash Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        {/* CASH ICON BANNER */}
        <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-emerald-950">Track Physical Cash</h4>
            <p className="text-[11px] text-emerald-700 font-medium">
              Create a dedicated wallet or cash account to track cash spending and deposits separately.
            </p>
          </div>
        </div>

        {/* CASH ACCOUNT NAME */}
        <Input
          label="Cash Account Name *"
          placeholder="e.g. Cash in Hand, Personal Wallet, Home Cash"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        {/* OPENING BALANCE */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Opening Cash Balance (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-emerald-600">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Initial cash amount currently available in hand (defaults to ₹0).
          </p>
        </div>

        {/* DESCRIPTION / NOTES */}
        <Input
          label="Description (Optional)"
          placeholder="e.g. Daily pocket money, Emergency cash fund"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Cash Account
          </Button>
        </div>
      </form>
    </Modal>
  )
}
