import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { INDIAN_BANKS } from '../../data/indianBanks'
import { Search, Building2, Wallet, Smartphone } from 'lucide-react'

export const AccountModal = ({
  isOpen,
  onClose,
  onSave,
  editingAccount = null,
  isSubmitting = false
}) => {
  const [accountType, setAccountType] = useState('bank')
  const [bankSearchQuery, setBankSearchQuery] = useState('')
  const [selectedBankName, setSelectedBankName] = useState('State Bank of India')
  const [customBankName, setCustomBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [openingBalance, setOpeningBalance] = useState('0')
  const [nickname, setNickname] = useState('')
  const [currency, setCurrency] = useState('INR')

  useEffect(() => {
    if (editingAccount) {
      setAccountType(editingAccount.account_type || 'bank')
      setSelectedBankName(editingAccount.bank_name || 'State Bank of India')
      setCustomBankName('')
      setAccountNumber(editingAccount.account_number || '')
      setAccountHolderName(editingAccount.account_holder_name || '')
      setOpeningBalance(String(editingAccount.opening_balance || 0))
      setNickname(editingAccount.nickname || editingAccount.name || '')
      setCurrency(editingAccount.currency || 'INR')
    } else {
      setAccountType('bank')
      setBankSearchQuery('')
      setSelectedBankName('State Bank of India')
      setCustomBankName('')
      setAccountNumber('')
      setAccountHolderName('')
      setOpeningBalance('0')
      setNickname('')
      setCurrency('INR')
    }
  }, [editingAccount, isOpen])

  const filteredBanks = INDIAN_BANKS.filter(
    (b) =>
      b.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
      b.shortName.toLowerCase().includes(bankSearchQuery.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    const finalBankName =
      accountType === 'bank'
        ? selectedBankName === 'Other Bank'
          ? customBankName.trim() || 'Other Bank'
          : selectedBankName
        : null

    if (accountType === 'bank' && !finalBankName) {
      return
    }

    if (accountType === 'bank' && !accountNumber.trim()) {
      return
    }

    const numBalance = parseFloat(openingBalance)
    if (isNaN(numBalance) || numBalance < 0) {
      return
    }

    let defaultName = finalBankName
    if (accountType === 'cash') defaultName = 'Cash'
    if (accountType === 'upi') defaultName = nickname.trim() || 'UPI / Digital Wallet'
    if (accountType === 'other') defaultName = nickname.trim() || 'Other Account'

    onSave({
      account_type: accountType,
      bank_name: finalBankName,
      account_number: accountNumber.trim() || null,
      account_holder_name: accountHolderName.trim() || null,
      nickname: nickname.trim() || defaultName,
      name: nickname.trim() || defaultName,
      opening_balance: numBalance,
      currency
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAccount ? 'Edit Money Account' : 'Add Money Account'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ACCOUNT TYPE */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Account Type
          </label>
          <Select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            options={[
              { value: 'bank', label: 'Bank Account' },
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI / Digital Wallet' },
              { value: 'other', label: 'Other' }
            ]}
          />
        </div>

        {/* BANK ACCOUNT SPECIFIC FIELDS */}
        {accountType === 'bank' && (
          <>
            {/* SEARCHABLE BANK SELECTOR */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bank Name
              </label>

              {/* Bank Search Input */}
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Indian bank..."
                  value={bankSearchQuery}
                  onChange={(e) => setBankSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={selectedBankName}
                onChange={(e) => setSelectedBankName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              >
                {filteredBanks.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} ({b.shortName})
                  </option>
                ))}
              </select>

              {selectedBankName === 'Other Bank' && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter custom bank name"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {/* ACCOUNT NUMBER */}
            <div>
              <Input
                label="Account Number"
                placeholder="e.g. 50100234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Account number will be masked (e.g. •••• {accountNumber.slice(-4) || '1234'}) for privacy.
              </p>
            </div>
          </>
        )}

        {/* UPI / DIGITAL WALLET SPECIFIC FIELDS */}
        {accountType === 'upi' && (
          <div>
            <Input
              label="Provider / Wallet Name"
              placeholder="e.g. Google Pay, PhonePe, Paytm, Amazon Pay"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
        )}

        {/* ACCOUNT HOLDER NAME & NICKNAME */}
        {accountType === 'bank' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Account Holder Name (Optional)"
              placeholder="e.g. Madhan Mohan"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
            />

            <Input
              label="Account Nickname (Optional)"
              placeholder="e.g. Salary Account"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
        )}

        {/* OPENING BALANCE */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Opening Balance (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-500">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="25000"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Initial amount currently available in this account.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {editingAccount ? 'Update Account' : 'Save Account'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
