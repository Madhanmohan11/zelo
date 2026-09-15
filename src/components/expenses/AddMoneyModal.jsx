import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { formatINR } from '../../utils/formatters'
import { getAccountDisplayLabel } from '../../services/accountService'
import { ArrowUpRight } from 'lucide-react'

export const AddMoneyModal = ({
  isOpen,
  onClose,
  onSave,
  accounts = [],
  preselectedAccountId = null,
  isSubmitting = false
}) => {
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('Salary')
  const [category, setCategory] = useState('Salary')
  const [notes, setNotes] = useState('')

  const activeAccounts = accounts.filter((a) => a.is_active !== false)

  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setDate(new Date().toISOString().slice(0, 10))
      setDescription('Salary')
      setCategory('Salary')
      setNotes('')
      if (preselectedAccountId && activeAccounts.some((a) => a.id === preselectedAccountId)) {
        setAccountId(preselectedAccountId)
      } else if (activeAccounts.length > 0) {
        setAccountId(activeAccounts[0].id)
      }
    }
  }, [isOpen, preselectedAccountId, accounts])

  const handleSubmit = (e) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return
    if (!accountId) return

    onSave({
      account_id: accountId,
      amount: numAmount,
      description: description.trim() || 'Add Money',
      category,
      date,
      notes
    })
  }

  const selectedAccount = activeAccounts.find((a) => a.id === accountId) || activeAccounts[0]
  const currentBalance = selectedAccount ? selectedAccount.current_balance || 0 : 0
  const parsedAmount = parseFloat(amount) || 0
  const newEstimatedBalance = currentBalance + parsedAmount

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Money / Deposit">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* AMOUNT INPUT */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-black text-emerald-600">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="10,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xl font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
              autoFocus
            />
          </div>
        </div>

        {/* DEPOSIT TO ACCOUNT & LIVE DYNAMIC BALANCE CALCULATION */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Deposit to Account
          </label>
          <Select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            options={activeAccounts.map((acc) => ({
              value: acc.id,
              label: `${getAccountDisplayLabel(acc)} — Current: ${formatINR(acc.current_balance)}`
            }))}
          />

          {selectedAccount && (
            <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Current Balance:</span>
                <span className="font-bold text-slate-900">{formatINR(currentBalance)}</span>
              </div>

              <div className="flex justify-between text-xs text-emerald-900 font-extrabold pt-1 border-t border-emerald-200/80">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  After Deposit / New Balance:
                </span>
                <span className="text-sm font-black text-emerald-800 tracking-tight">
                  {formatINR(newEstimatedBalance)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* DESCRIPTION & CATEGORY */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Description"
            placeholder="e.g. Salary, Freelance"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'Salary', label: 'Salary' },
              { value: 'Bonus', label: 'Bonus' },
              { value: 'Investment', label: 'Investment Returns' },
              { value: 'Gift', label: 'Gift / Family' },
              { value: 'Refund', label: 'Refund' },
              { value: 'Other', label: 'Other Income' }
            ]}
          />
        </div>

        {/* DATE */}
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* NOTES */}
        <Input
          label="Notes (Optional)"
          placeholder="e.g. Monthly salary credit"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Add Money
          </Button>
        </div>
      </form>
    </Modal>
  )
}
