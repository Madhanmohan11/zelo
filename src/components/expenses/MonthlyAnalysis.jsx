import React from 'react'
import { Card } from '../ui/Card'
import { formatINR } from '../../utils/formatters'

export const MonthlyAnalysis = ({ expenses = [], accounts = [] }) => {
  const now = new Date()
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' })
  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Current Month Expenses
  const monthExpenses = expenses.filter(
    (e) => (e.spent_at || '').split('T')[0] >= startOfMonthStr
  )

  const monthTotal = monthExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  // Category breakdown
  const categoryMap = new Map()
  monthExpenses.forEach((e) => {
    const cat = e.category || 'Other'
    const amt = parseFloat(e.amount) || 0
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + amt)
  })

  const categoryList = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: monthTotal > 0 ? Math.round((amount / monthTotal) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount)

  // Account breakdown
  const accountLookup = new Map(accounts.map((a) => [a.id, a.name]))
  const accountMap = new Map()
  monthExpenses.forEach((e) => {
    const accName = e.accounts?.name || accountLookup.get(e.account_id) || e.payment_method || 'Cash'
    const amt = parseFloat(e.amount) || 0
    accountMap.set(accName, (accountMap.get(accName) || 0) + amt)
  })

  const accountList = Array.from(accountMap.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: monthTotal > 0 ? Math.round((amount / monthTotal) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-4">
      {/* TOTAL MONTHLY BANNER */}
      <Card className="bg-slate-900 text-white p-5 border-0">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {currentMonthName} Expenses
        </span>
        <div className="text-3xl font-black text-emerald-400 mt-1">
          {formatINR(monthTotal)}
        </div>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Total spent from {monthExpenses.length} transaction records
        </p>
      </Card>

      {/* CATEGORY BREAKDOWN */}
      <Card className="p-4 bg-white border border-slate-200/80">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
          Category Breakdown
        </h3>

        {categoryList.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No expenses logged for this month.</p>
        ) : (
          <div className="space-y-3">
            {categoryList.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-semibold">{item.percentage}%</span>
                    <span className="text-emerald-800 font-black">{formatINR(item.amount)}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ACCOUNT SPENDING BREAKDOWN */}
      <Card className="p-4 bg-white border border-slate-200/80">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
          Spending By Account
        </h3>

        {accountList.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No account transactions recorded this month.</p>
        ) : (
          <div className="space-y-2.5">
            {accountList.map((acc) => (
              <div
                key={acc.name}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs"
              >
                <span className="font-bold text-slate-800">{acc.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-medium">{acc.percentage}%</span>
                  <span className="font-black text-slate-900">{formatINR(acc.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
