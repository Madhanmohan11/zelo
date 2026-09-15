import React from 'react'
import { Plus, ArrowLeftRight, Landmark, Wallet } from 'lucide-react'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { LoadingState } from '../ui/LoadingState'
import { AccountCard } from './AccountCard'
import { formatINR } from '../../utils/formatters'

export const AccountList = ({
  accounts = [],
  loading = false,
  onAccountClick,
  onAddAccountClick,
  onAddMoneyClick,
  onTransferClick
}) => {
  if (loading) {
    return <LoadingState message="Fetching savings accounts..." />
  }

  const activeAccounts = accounts.filter((a) => a.is_active !== false)

  const totalBalance = activeAccounts.reduce(
    (sum, acc) => sum + (parseFloat(acc.current_balance) || 0),
    0
  )

  const hasAccounts = activeAccounts.length > 0

  return (
    <div className="space-y-6">
      {/* TOTAL MONEY AVAILABLE CARD */}
      <Card className="bg-white border border-slate-200/90 shadow-xs p-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 translate-x-4 translate-y-4 pointer-events-none">
          <Landmark className="w-48 h-48 text-slate-900" />
        </div>

        <div className="relative z-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
            Total Money Available
          </span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
            {formatINR(totalBalance)}
          </div>
          <p className="text-xs text-slate-600 mt-1.5 font-bold">
            {hasAccounts
              ? `Across ${activeAccounts.length} active money account${activeAccounts.length === 1 ? '' : 's'}`
              : 'No active money accounts configured'}
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-slate-200">
            {/* ROW 1: [ + Add Money ] [ + Add Account ] SIDE-BY-SIDE */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onAddMoneyClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">Add Money</span>
              </button>

              <button
                type="button"
                onClick={onAddAccountClick}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="truncate">Add Account</span>
              </button>
            </div>

            {/* ROW 2: [ ⇄ Transfer ] FULL WIDTH */}
            <button
              type="button"
              onClick={onTransferClick}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Transfer</span>
            </button>
          </div>
        </div>
      </Card>

      {/* ACCOUNTS GRID */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Your Accounts ({activeAccounts.length})
          </h2>
        </div>

        {!hasAccounts ? (
          <EmptyState
            icon={Wallet}
            title="No accounts added yet"
            description="Add your bank, cash, or digital money account to start tracking your balance."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onClick={onAccountClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
