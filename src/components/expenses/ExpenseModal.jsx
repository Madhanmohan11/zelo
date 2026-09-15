import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Wallet, AlertCircle } from 'lucide-react'
import { formatINR } from '../../utils/formatters'
import { getAccountDisplayLabel } from '../../services/accountService'

export const ExpenseModal = ({
  isOpen,
  onClose,
  onSave,
  editingExpense = null,
  accounts = [],
  isSubmitting = false
}) => {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [description, setDescription] = useState('')
  const [spentAt, setSpentAt] = useState(new Date().toISOString().slice(0, 16))
  const [accountId, setAccountId] = useState('')
  const [notes, setNotes] = useState('')

  // Filter active accounts
  const activeAccounts = accounts.filter((a) => a.is_active !== false)

  useEffect(() => {
    if (editingExpense) {
      setAmount(String(editingExpense.amount || ''))
      setCategory(editingExpense.category || 'Food')
      setDescription(editingExpense.description || '')
      setSpentAt(
        editingExpense.spent_at
          ? new Date(editingExpense.spent_at).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16)
      )
      setAccountId(editingExpense.account_id || (activeAccounts[0]?.id || ''))
      setNotes(editingExpense.notes || '')
    } else {
      setAmount('')
      setCategory('Food')
      setDescription('')
      setSpentAt(new Date().toISOString().slice(0, 16))
      if (activeAccounts.length > 0) {
        setAccountId(activeAccounts[0].id)
      } else {
        setAccountId('')
      }
      setNotes('')
    }
  }, [editingExpense, isOpen, accounts])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return
    }

    onSave({
      amount: parseFloat(amount),
      category,
      description,
      spent_at: new Date(spentAt).toISOString(),
      account_id: accountId || (activeAccounts[0]?.id || null),
      notes
    })
  }

  // Selected account object for clear feedback
  const selectedAccount = activeAccounts.find((a) => a.id === accountId) || activeAccounts[0]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? 'Edit Expense' : 'Add Expense'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* AMOUNT INPUT - LARGE READABLE */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-500">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xl font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
              autoFocus
            />
          </div>
        </div>

        {/* PAYMENT ACCOUNT SELECTOR - PROMINENT WHERE MONEY IS DEDUCTED */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Payment Account</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Money will be reduced from here</span>
          </label>

          {activeAccounts.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>No money accounts configured yet. Please add an account first.</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Select
                  value={accountId || (selectedAccount?.id || '')}
                  onChange={(e) => setAccountId(e.target.value)}
                  options={activeAccounts.map((acc) => ({
                    value: acc.id,
                    label: `${getAccountDisplayLabel(acc)} — ${formatINR(acc.current_balance)}`
                  }))}
                />
              </div>

              {selectedAccount && (
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">{getAccountDisplayLabel(selectedAccount)}</span>
                  </div>
                  <div className="font-extrabold text-emerald-800">
                    Current Balance: {formatINR(selectedAccount.current_balance)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CATEGORY & DESCRIPTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'Food', label: 'Food' },
              { value: 'Travel', label: 'Travel' },
              { value: 'Shopping', label: 'Shopping' },
              { value: 'Bills', label: 'Bills' },
              { value: 'Health', label: 'Health' },
              { value: 'Entertainment', label: 'Entertainment' },
              { value: 'Education', label: 'Education' },
              { value: 'Other', label: 'Other' }
            ]}
          />

          <Input
            label="Description"
            placeholder="e.g. Lunch"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* DATE & TIME */}
        <Input
          label="Date & Time"
          type="datetime-local"
          value={spentAt}
          onChange={(e) => setSpentAt(e.target.value)}
        />

        {/* NOTES */}
        <Input
          label="Notes (Optional)"
          placeholder="e.g. Shared with team"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {editingExpense ? 'Update Expense' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
