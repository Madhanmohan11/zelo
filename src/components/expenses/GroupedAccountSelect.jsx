import React, { useState, useRef, useEffect } from 'react'
import { Building2, Wallet, Smartphone, Plus, ChevronDown, Check } from 'lucide-react'
import { formatINR } from '../../utils/formatters'
import { getAccountDisplayLabel } from '../../services/accountService'

export const GroupedAccountSelect = ({
  accounts = [],
  value,
  onChange,
  onAddCashAccount,
  label = 'Account',
  excludeAccountId = null,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const activeAccounts = accounts.filter(
    (a) => a.is_active !== false && a.id !== excludeAccountId
  )

  const bankAccounts = activeAccounts.filter(
    (a) => !a.account_type || a.account_type === 'bank' || a.account_type === 'savings'
  )
  const cashAccounts = activeAccounts.filter((a) => a.account_type === 'cash')
  const otherAccounts = activeAccounts.filter(
    (a) => a.account_type && a.account_type !== 'bank' && a.account_type !== 'savings' && a.account_type !== 'cash'
  )

  const selectedAccount = activeAccounts.find((a) => a.id === value) || activeAccounts[0]

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectAccount = (accId) => {
    onChange(accId)
    setIsOpen(false)
  }

  const handleAddCashClick = (e) => {
    e.stopPropagation()
    setIsOpen(false)
    if (onAddCashAccount) {
      onAddCashAccount()
    }
  }

  const getAccountIcon = (acc) => {
    if (!acc) return <Building2 className="w-4 h-4 text-emerald-600" />
    if (acc.account_type === 'cash') return <Wallet className="w-4 h-4 text-amber-600" />
    if (acc.account_type === 'upi') return <Smartphone className="w-4 h-4 text-indigo-600" />
    return <Building2 className="w-4 h-4 text-blue-600" />
  }

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-300 hover:border-emerald-500 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-left transition-all shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
      >
        {selectedAccount ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
              {getAccountIcon(selectedAccount)}
            </div>
            <div className="truncate">
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 truncate">
                <span>{selectedAccount.nickname || selectedAccount.bank_name || selectedAccount.name}</span>
                {selectedAccount.account_number_last4 && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    •••• {selectedAccount.account_number_last4}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold truncate">
                {selectedAccount.account_type === 'cash' ? 'Cash Account' : selectedAccount.bank_name || 'Bank Account'}
                {' • '}
                <span className="text-emerald-700 font-bold">{formatINR(selectedAccount.current_balance)}</span>
              </div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Select Account...</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* DROPDOWN OVERLAY */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100 p-1.5">
          {/* BANK ACCOUNTS SECTION */}
          {bankAccounts.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Bank Accounts ({bankAccounts.length})
              </div>
              {bankAccounts.map((acc) => {
                const isSelected = selectedAccount?.id === acc.id
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectAccount(acc.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {acc.nickname || acc.bank_name || acc.name}
                          {acc.account_number_last4 && ` •••• ${acc.account_number_last4}`}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Current Balance: <span className="font-bold text-slate-900">{formatINR(acc.current_balance)}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}

          {/* CASH ACCOUNTS SECTION */}
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Cash Accounts ({cashAccounts.length})</span>
            </div>
            {cashAccounts.map((acc) => {
              const isSelected = selectedAccount?.id === acc.id
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-amber-50 text-amber-950 font-bold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {acc.nickname || acc.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Current Cash: <span className="font-bold text-slate-900">{formatINR(acc.current_balance)}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}

            {/* ADD CASH ACCOUNT BUTTON INSIDE DROPDOWN */}
            {onAddCashAccount && (
              <button
                type="button"
                onClick={handleAddCashClick}
                className="w-full text-left px-3 py-2 mt-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-2 transition-colors border border-dashed border-emerald-300"
              >
                <div className="p-1 rounded-lg bg-emerald-500 text-white">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>+ Add Cash Account</span>
              </button>
            )}
          </div>

          {/* OTHER ACCOUNTS SECTION (UPI / WALLETS) */}
          {otherAccounts.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Digital & Other Accounts ({otherAccounts.length})
              </div>
              {otherAccounts.map((acc) => {
                const isSelected = selectedAccount?.id === acc.id
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectAccount(acc.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-indigo-50 text-indigo-950 font-bold' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {acc.nickname || acc.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Balance: <span className="font-bold text-slate-900">{formatINR(acc.current_balance)}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
