import React from 'react'
import { Card } from '../ui/Card'
import { formatINR } from '../../utils/formatters'

export const YearlyAnalysis = ({ expenses = [] }) => {
  const currentYear = new Date().getFullYear()

  // Filter expenses for current year
  const yearExpenses = expenses.filter((e) => {
    const d = new Date(e.spent_at || e.created_at)
    return d.getFullYear() === currentYear
  })

  const yearTotal = yearExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  // Calculate month by month amounts
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const monthlyTotals = Array(12).fill(0)

  yearExpenses.forEach((e) => {
    const d = new Date(e.spent_at || e.created_at)
    const m = d.getMonth()
    monthlyTotals[m] += parseFloat(e.amount) || 0
  })

  // Calculate active months passed so far
  const currentMonthIdx = new Date().getMonth()
  const activeMonthsCount = Math.max(1, currentMonthIdx + 1)
  const avgMonthly = yearTotal / activeMonthsCount

  // Highest and lowest spending months among active months
  let highestMonth = { name: '-', amount: 0 }
  let lowestMonth = { name: '-', amount: Infinity }

  monthlyTotals.slice(0, activeMonthsCount).forEach((amt, idx) => {
    if (amt > highestMonth.amount) {
      highestMonth = { name: monthNames[idx], amount: amt }
    }
    if (amt < lowestMonth.amount) {
      lowestMonth = { name: monthNames[idx], amount: amt }
    }
  })

  if (lowestMonth.amount === Infinity) {
    lowestMonth = { name: '-', amount: 0 }
  }

  const maxMonthVal = Math.max(...monthlyTotals, 1)

  return (
    <div className="space-y-4">
      {/* YEARLY SUMMARY BANNER */}
      <Card className="bg-slate-900 text-white p-5 border-0">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Year {currentYear} Spending
        </span>
        <div className="text-3xl font-black text-emerald-400 mt-1">
          {formatINR(yearTotal)}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-semibold">Average / Mo</span>
            <span className="font-extrabold text-white">{formatINR(avgMonthly)}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-semibold">Highest Mo</span>
            <span className="font-extrabold text-rose-400">
              {highestMonth.name} ({formatINR(highestMonth.amount)})
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-semibold">Lowest Mo</span>
            <span className="font-extrabold text-emerald-300">
              {lowestMonth.name} ({formatINR(lowestMonth.amount)})
            </span>
          </div>
        </div>
      </Card>

      {/* MONTH BY MONTH BAR BREAKDOWN */}
      <Card className="p-4 bg-white border border-slate-200/80">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
          Monthly Overview ({currentYear})
        </h3>

        <div className="space-y-2">
          {monthNames.map((monthName, idx) => {
            const amount = monthlyTotals[idx]
            const percentage = Math.round((amount / maxMonthVal) * 100)
            const isFuture = idx > currentMonthIdx

            return (
              <div
                key={monthName}
                className={`flex items-center gap-3 text-xs ${
                  isFuture ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span className="w-8 font-extrabold text-slate-700">{monthName}</span>

                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      amount === highestMonth.amount && amount > 0
                        ? 'bg-rose-500'
                        : amount > 0
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-20 text-right font-black text-slate-900">
                  {formatINR(amount)}
                </span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
