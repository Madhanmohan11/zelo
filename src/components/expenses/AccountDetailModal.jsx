import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Edit2, Plus, ArrowLeftRight, Power, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { formatINR } from '../../utils/formatters'
import { getMoneyTransactions } from '../../services/accountService'

export const AccountDetailModal = ({
  isOpen,
  onClose,
  account = null,
  userId,
  expenses = [],
  onEditAccount,
  onAddMoney,
  onTransfer,
  onDeactivateAccount
}) => {
  const [transactions, setTransactions] = useState([])
  const [loadingTx, setLoadingTx] = useState(false)

  useEffect(() => {
    if (isOpen && account && userId) {
      setLoadingTx(true)
      getMoneyTransactions(userId, account.id)
        .then((txs) => setTransactions(txs))
        .catch(() => setTransactions([]))
        .finally(() => setLoadingTx(false))
    }
  }, [isOpen, account, userId])

  if (!account) return null

  // Calculate monthly spent from this account
  const now = new Date()
  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const accountExpenses = expenses.filter((e) => e.account_id === account.id)

  const monthSpent = accountExpenses
    .filter((e) => (e.spent_at || '').split('T')[0] >= startOfMonthStr)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  // Combined timeline of transactions (expenses + money transactions)
  const combinedHistory = [
    ...accountExpenses.map((e) => ({
      id: e.id,
      type: 'expense',
      title: e.description || e.category,
      subtitle: e.category,
      amount: -parseFloat(e.amount),
      date: new Date(e.spent_at || e.created_at)
    })),
    ...transactions.map((tx) => {
      const isTransferOut = tx.transaction_type === 'transfer' && tx.account_id === account.id
      const isTransferIn = tx.transaction_type === 'transfer' && tx.to_account_id === account.id
      const isIncome = tx.transaction_type === 'income'

      let amountVal = parseFloat(tx.amount)
      let titleVal = tx.description || 'Transaction'

      if (isTransferOut) {
        amountVal = -amountVal
        titleVal = `Transfer Out`
      } else if (isTransferIn) {
        titleVal = `Transfer In`
      }

      return {
        id: tx.id,
        type: tx.transaction_type,
        title: titleVal,
        subtitle: tx.category || 'Money Transaction',
        amount: amountVal,
        date: new Date(tx.transaction_date || tx.created_at)
      }
    })
  ].sort((a, b) => b.date - a.date)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={account.name}>
      <div className="space-y-4">
        {/* HEADER BALANCE CARD */}
        <Card className="bg-slate-900 text-white p-5 border-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Balance
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {formatINR(account.current_balance)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">Spent This Month</span>
              <div className="text-base font-bold text-rose-400 mt-0.5">
                {formatINR(monthSpent)}
              </div>
            </div>
          </div>

          <div className="text-[11px] font-medium text-slate-400 mt-3 pt-3 border-t border-slate-800 flex justify-between">
            <span>Opening Balance: {formatINR(account.opening_balance)}</span>
            <span className="uppercase font-bold text-emerald-400">{account.account_type}</span>
          </div>
        </Card>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => {
              onClose()
              onAddMoney(account.id)
            }}
            className="flex flex-col items-center justify-center p-2.5 bg-emerald-50 text-emerald-800 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-5 h-5 mb-1 text-emerald-600" />
            <span className="text-[11px] font-bold">Add Money</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              onTransfer(account.id)
            }}
            className="flex flex-col items-center justify-center p-2.5 bg-blue-50 text-blue-800 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5 mb-1 text-blue-600" />
            <span className="text-[11px] font-bold">Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              onEditAccount(account)
            }}
            className="flex flex-col items-center justify-center p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Edit2 className="w-5 h-5 mb-1 text-slate-600" />
            <span className="text-[11px] font-bold">Edit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Deactivate account "${account.name}"? It will be hidden from new payment selectors but historical data will be preserved.`)) {
                onClose()
                onDeactivateAccount(account.id)
              }
            }}
            className="flex flex-col items-center justify-center p-2.5 bg-rose-50 text-rose-800 rounded-xl hover:bg-rose-100 transition-colors"
          >
            <Power className="w-5 h-5 mb-1 text-rose-600" />
            <span className="text-[11px] font-bold">Deactivate</span>
          </button>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div>
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            Account Activity
          </h4>

          {loadingTx ? (
            <p className="text-xs text-slate-400 py-4 text-center">Loading transactions...</p>
          ) : combinedHistory.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recent activity on this account.</p>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {combinedHistory.map((item) => {
                const isPositive = item.amount > 0
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[10px] text-slate-500">
                          {item.subtitle} • {item.date.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>

                    <div className={`font-black text-sm ${isPositive ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {isPositive ? '+' : ''}
                      {formatINR(item.amount)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
