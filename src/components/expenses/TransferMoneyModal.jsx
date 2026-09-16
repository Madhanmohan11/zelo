import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { formatINR } from '../../utils/formatters'
import { getAccountDisplayLabel } from '../../services/accountService'
import { GroupedAccountSelect } from './GroupedAccountSelect'

export const TransferMoneyModal = ({
  isOpen,
  onClose,
  onSave,
  accounts = [],
  preselectedFromAccountId = null,
  onAddCashAccount = null,
  isSubmitting = false
}) => {
  const [amount, setAmount] = useState('')
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('Account Transfer')
  const [errorMsg, setErrorMsg] = useState('')

  const activeAccounts = accounts.filter((a) => a.is_active !== false)

  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setDate(new Date().toISOString().slice(0, 10))
      setDescription('Account Transfer')
      setErrorMsg('')

      const fromId = preselectedFromAccountId || activeAccounts[0]?.id || ''
      setFromAccountId(fromId)

      const remaining = activeAccounts.filter((a) => a.id !== fromId)
      setToAccountId(remaining[0]?.id || '')
    }
  }, [isOpen, preselectedFromAccountId, accounts])

  const handleFromChange = (newFromId) => {
    setFromAccountId(newFromId)
    setErrorMsg('')
    if (newFromId === toAccountId) {
      const remaining = activeAccounts.filter((a) => a.id !== newFromId)
      setToAccountId(remaining[0]?.id || '')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanStr = String(amount || '').replace(/[^0-9.]/g, '')
    const numericAmount = parseFloat(cleanStr)

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please enter a valid transfer amount greater than 0')
      return
    }

    if (!fromAccountId || !toAccountId) {
      setErrorMsg('Please select both source and destination accounts')
      return
    }

    if (fromAccountId === toAccountId) {
      setErrorMsg('Source and destination accounts must be different')
      return
    }

    const sourceAccount = activeAccounts.find((a) => a.id === fromAccountId)
    if (sourceAccount && numericAmount > (sourceAccount.current_balance || 0)) {
      setErrorMsg(
        `Transfer amount (${formatINR(numericAmount)}) exceeds source account balance (${formatINR(
          sourceAccount.current_balance
        )})`
      )
      return
    }

    onSave({
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      amount: numericAmount,
      description: description.trim() || 'Account Transfer',
      date
    })
  }

  const fromAcc = activeAccounts.find((a) => a.id === fromAccountId)
  const toAcc = activeAccounts.find((a) => a.id === toAccountId)
  const cleanStr = String(amount || '').replace(/[^0-9.]/g, '')
  const parsedAmount = parseFloat(cleanStr) || 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Money">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* AMOUNT INPUT */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Transfer Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-500">
              ₹
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="2,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xl font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
              autoFocus
            />
          </div>
        </div>

        {/* FROM & TO ACCOUNTS */}
        <div className="space-y-3">
          <GroupedAccountSelect
            label="From (Source Account) *"
            accounts={accounts}
            value={fromAccountId}
            onChange={handleFromChange}
            onAddCashAccount={onAddCashAccount}
          />

          <div className="flex justify-center my-1">
            <div className="p-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
            </div>
          </div>

          <GroupedAccountSelect
            label="To (Destination Account) *"
            accounts={accounts}
            value={toAccountId}
            onChange={(accId) => setToAccountId(accId)}
            excludeAccountId={fromAccountId}
            onAddCashAccount={onAddCashAccount}
          />
        </div>

        {/* PREVIEW OF DEDUCTIONS */}
        {fromAcc && toAcc && parsedAmount > 0 && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>{getAccountDisplayLabel(fromAcc)} balance after transfer:</span>
              <span className="font-extrabold text-slate-900">
                {formatINR(Math.max(0, fromAcc.current_balance - parsedAmount))}
              </span>
            </div>
            <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-200">
              <span>{getAccountDisplayLabel(toAcc)} balance after transfer:</span>
              <span className="font-extrabold text-emerald-700">
                {formatINR((toAcc.current_balance || 0) + parsedAmount)}
              </span>
            </div>
          </div>
        )}

        {/* DESCRIPTION & DATE */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Description"
            placeholder="e.g. Bank to Cash"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Complete Transfer
          </Button>
        </div>
      </form>
    </Modal>
  )
}

