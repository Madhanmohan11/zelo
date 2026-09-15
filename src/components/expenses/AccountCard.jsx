import React from 'react'
import { Wallet, Building2, Smartphone, CreditCard, ChevronRight } from 'lucide-react'
import { Card } from '../ui/Card'
import { formatINR } from '../../utils/formatters'

const getAccountIcon = (accountType) => {
  switch (accountType) {
    case 'cash':
      return Wallet
    case 'bank':
      return Building2
    case 'upi':
      return Smartphone
    default:
      return CreditCard
  }
}

const getAccountBadgeStyle = (accountType) => {
  switch (accountType) {
    case 'cash':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'bank':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'upi':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    default:
      return 'bg-purple-100 text-purple-800 border-purple-200'
  }
}

export const AccountCard = ({ account, onClick }) => {
  const Icon = getAccountIcon(account.account_type)
  const badgeStyle = getAccountBadgeStyle(account.account_type)

  const displayName = account.nickname || account.bank_name || account.name || 'Account'
  const maskedNumber = account.account_number_last4
    ? `•••• ${account.account_number_last4}`
    : ''

  return (
    <Card
      onClick={() => onClick(account)}
      className="p-4 bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl border ${badgeStyle} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
              {displayName}
            </h3>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>{account.account_type === 'bank' ? 'Bank Account' : account.account_type === 'cash' ? 'Cash' : account.account_type === 'upi' ? 'UPI / Digital' : 'Account'}</span>
              {maskedNumber && (
                <>
                  <span>•</span>
                  <span className="font-mono text-slate-500 font-bold">{maskedNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
        <span className="text-xs font-semibold text-slate-500">Current Balance</span>
        <span className="text-lg font-black text-slate-900 tracking-tight">
          {formatINR(account.current_balance)}
        </span>
      </div>
    </Card>
  )
}
