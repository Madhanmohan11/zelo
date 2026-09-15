import React from 'react'
import { IndianRupee, ArrowRight, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatINR } from '../../utils/formatters'

export const ExpenseSnapshot = ({ expenses = [], spentTotal = 0, budget = 1000 }) => {
  const navigate = useNavigate()

  // Calculate top spending categories for today
  const categoryTotals = {}
  expenses.forEach((e) => {
    const cat = e.category || 'Other'
    const amt = parseFloat(e.amount) || 0
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt
  })

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const budgetUsagePercent = budget > 0 ? Math.min(Math.round((spentTotal / budget) * 100), 100) : 0

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <IndianRupee className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Spending Today</h3>
        </div>
        <button
          onClick={() => navigate('/expenses')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Metric */}
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(spentTotal)}</div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">
            {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'} logged today
          </div>
        </div>

        {budget > 0 && (
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Daily Budget</div>
            <div className="text-xs font-bold text-slate-700">{formatINR(budget)}</div>
          </div>
        )}
      </div>

      {/* Budget Progress Indicator */}
      {budget > 0 && (
        <div className="space-y-1">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePercent >= 100 ? 'bg-rose-500' : budgetUsagePercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(budgetUsagePercent, 3)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-400">
            <span>{budgetUsagePercent}% used</span>
            <span>{formatINR(Math.max(budget - spentTotal, 0))} remaining</span>
          </div>
        </div>
      )}

      {/* Mini Category Chips */}
      {topCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {topCategories.map(([cat, amt]) => (
            <span
              key={cat}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-1"
            >
              <span className="text-slate-400">{cat}:</span>
              <span>{formatINR(amt)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
