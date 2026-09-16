import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { formatINR } from '../../utils/formatters'
import { getAccountDisplayLabel, ensureDefaultCashAccount } from '../../services/accountService'
import { ArrowUpRight, Wallet, Building2, AlertCircle, Plus, Loader2 } from 'lucide-react'

export const AddMoneyModal = ({
  isOpen,
  onClose,
  onSave,
  accounts = [],
  preselectedAccountId = null,
  onAddCashAccount = null,
  onEnsureCashAccount = null,
  userId = null,
  isSubmitting = false
}) => {
  const [amount, setAmount] = useState('')
  const [accountType, setAccountType] = useState('bank') // 'bank' | 'cash'
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('Salary')
  const [category, setCategory] = useState('Salary')
  const [notes, setNotes] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isAutoCreatingCash, setIsAutoCreatingCash] = useState(false)

  const activeAccounts = accounts.filter((a) => a.is_active !== false)
  const bankAccounts = activeAccounts.filter((a) => a.account_type !== 'cash')
  const cashAccounts = activeAccounts.filter((a) => a.account_type === 'cash')

  // Helper to auto-ensure Cash in Hand exists
  const handleAutoEnsureCash = async () => {
    if (cashAccounts.length > 0) {
      setAccountId(cashAccounts[0].id)
      return
    }

    setIsAutoCreatingCash(true)
    try {
      let created = null
      if (onEnsureCashAccount) {
        created = await onEnsureCashAccount()
      } else if (userId) {
        created = await ensureDefaultCashAccount(userId, activeAccounts)
      }

      if (created && created.id) {
        setAccountId(created.id)
      }
    } catch (err) {
      console.error('Error ensuring cash account:', err)
    } finally {
      setIsAutoCreatingCash(false)
    }
  }

  // Initialize modal state
  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setDate(new Date().toISOString().slice(0, 10))
      setDescription('Salary')
      setCategory('Salary')
      setNotes('')
      setValidationError('')

      let targetAccount = null
      if (preselectedAccountId) {
        targetAccount = activeAccounts.find((a) => a.id === preselectedAccountId)
      }

      if (targetAccount) {
        const isCash = targetAccount.account_type === 'cash'
        setAccountType(isCash ? 'cash' : 'bank')
        setAccountId(targetAccount.id)
      } else {
        // Default to bank account mode
        setAccountType('bank')
        if (bankAccounts.length > 0) {
          setAccountId(bankAccounts[0].id)
        } else if (cashAccounts.length > 0) {
          setAccountId(cashAccounts[0].id)
        } else {
          setAccountId('')
        }
      }
    }
  }, [isOpen, preselectedAccountId, accounts])

  // Handle Account Type Segmented Toggle Change
  const handleTypeToggle = async (newType) => {
    setAccountType(newType)
    setValidationError('')

    if (newType === 'bank') {
      setDescription('Salary')
      setCategory('Salary')
      if (bankAccounts.length > 0) {
        setAccountId(bankAccounts[0].id)
      } else {
        setAccountId('')
      }
    } else if (newType === 'cash') {
      setDescription('Cash Deposit')
      setCategory('Cash Deposit')
      if (cashAccounts.length > 0) {
        setAccountId(cashAccounts[0].id)
      } else {
        // Auto-create "Cash in Hand" seamlessly
        await handleAutoEnsureCash()
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationError('')

    const cleanStr = String(amount || '').replace(/[^0-9.]/g, '')
    const numAmount = parseFloat(cleanStr)

    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter a valid deposit amount greater than ₹0')
      return
    }

    if (!accountId) {
      if (accountType === 'cash') {
        setValidationError('Creating Cash in Hand account... Please try again in a moment.')
        handleAutoEnsureCash()
      } else {
        setValidationError('Please select a bank account to deposit into')
      }
      return
    }

    onSave({
      account_id: accountId,
      amount: numAmount,
      description: description.trim() || (accountType === 'cash' ? 'Cash Deposit' : 'Add Money'),
      category,
      date,
      notes
    })
  }

  // Selected account object based on type
  const targetAccountsList = accountType === 'cash' ? cashAccounts : bankAccounts
  const selectedAccount = activeAccounts.find((a) => a.id === accountId) || targetAccountsList[0]
  const currentBalance = selectedAccount ? selectedAccount.current_balance || 0 : 0

  // Live balance calculation preview
  const cleanAmountStr = String(amount || '').replace(/[^0-9.]/g, '')
  const parsedAmount = parseFloat(cleanAmountStr) || 0
  const newEstimatedBalance = currentBalance + parsedAmount

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Money / Deposit">
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 1. ACCOUNT TYPE SELECTOR */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Account Type *
          </label>
          <div className="flex bg-slate-100/90 p-1 rounded-2xl border border-slate-200 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => handleTypeToggle('bank')}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                accountType === 'bank'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className={`w-4 h-4 ${accountType === 'bank' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>🏦 Bank Account</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeToggle('cash')}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                accountType === 'cash'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wallet className={`w-4 h-4 ${accountType === 'cash' ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>💵 Cash</span>
            </button>
          </div>
        </div>

        {/* 2. AMOUNT INPUT */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Deposit Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-black text-emerald-600">
              ₹
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="10,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xl font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
              autoFocus
            />
          </div>
        </div>

        {/* 3. ACCOUNT SELECTOR DEPENDING ON TYPE */}
        {accountType === 'bank' ? (
          /* BANK ACCOUNT SELECTOR */
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deposit to Bank Account *
            </label>
            {bankAccounts.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold">
                No bank accounts found. Please add a bank account first.
              </div>
            ) : (
              <Select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                options={bankAccounts.map((acc) => ({
                  value: acc.id,
                  label: `${getAccountDisplayLabel(acc)} — Current: ${formatINR(acc.current_balance)}`
                }))}
              />
            )}
          </div>
        ) : (
          /* CASH ACCOUNT SELECTOR */
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deposit to Cash Account *
            </label>

            {isAutoCreatingCash ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Preparing "Cash in Hand" account...</span>
              </div>
            ) : (
              <Select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                options={[
                  ...cashAccounts.map((acc) => ({
                    value: acc.id,
                    label: `💵 ${acc.nickname || acc.name} — Cash Balance: ${formatINR(acc.current_balance)}`
                  }))
                ]}
              />
            )}
          </div>
        )}

        {/* 4. DYNAMIC BALANCE PREVIEW CARD */}
        {selectedAccount && (
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                {selectedAccount.account_type === 'cash' ? (
                  <Wallet className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>Current {accountType === 'cash' ? 'Cash' : 'Bank'} Balance:</span>
              </span>
              <span className="font-extrabold text-slate-900">{formatINR(currentBalance)}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-950 font-extrabold pt-2 border-t border-emerald-200">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>After Deposit / New Balance:</span>
              </span>
              <span className="text-base font-black text-emerald-800 tracking-tight">
                {formatINR(newEstimatedBalance)}
              </span>
            </div>
          </div>
        )}

        {/* 5. DESCRIPTION & CATEGORY */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Description"
            placeholder={accountType === 'cash' ? 'e.g. ATM Withdrawal, Cash Deposit' : 'e.g. Salary, Freelance'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={
              accountType === 'cash'
                ? [
                    { value: 'Cash Deposit', label: 'Cash Deposit' },
                    { value: 'Salary', label: 'Salary' },
                    { value: 'Gift', label: 'Gift / Family' },
                    { value: 'Refund', label: 'Refund' },
                    { value: 'Other', label: 'Other Income' }
                  ]
                : [
                    { value: 'Salary', label: 'Salary' },
                    { value: 'Bonus', label: 'Bonus' },
                    { value: 'Investment', label: 'Investment Returns' },
                    { value: 'Gift', label: 'Gift / Family' },
                    { value: 'Refund', label: 'Refund' },
                    { value: 'Other', label: 'Other Income' }
                  ]
            }
          />
        </div>

        {/* 6. DATE */}
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* 7. NOTES */}
        <Input
          label="Notes (Optional)"
          placeholder={accountType === 'cash' ? 'e.g. ATM withdrawal or cash in hand deposit' : 'e.g. Monthly salary credit'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isAutoCreatingCash}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting || isAutoCreatingCash}>
            Add Money
          </Button>
        </div>
      </form>
    </Modal>
  )
}
