import React from 'react'
import { TrendingDown, TrendingUp, Calendar, ArrowUpRight, BarChart2 } from 'lucide-react'
import { formatINR } from '../../utils/formatters'

export const ExpenseSummary = ({
  todayTotal = 0,
  monthTotal = 0,
  yearTotal = 0,
  lastMonthTotal = 0,
  currentMonthName = ''
}) => {
  const now = new Date()
  const displayMonthYear = currentMonthName || now.toLocaleDateString([], { month: 'long', year: 'numeric' })

  // Calculate percentage change vs last month if last month total is available
  let percentageChange = null
  let isSpendingDown = true
  if (lastMonthTotal > 0) {
    const diff = monthTotal - lastMonthTotal
    const pct = Math.round(Math.abs(diff / lastMonthTotal) * 100)
    percentageChange = pct
    isSpendingDown = diff <= 0
  }

  return (
    <div className="space-y-3">
      {/* MAIN COMPACT SPENDING SUMMARY CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-slate-900/5 rounded-3xl p-4 sm:p-5 border border-emerald-500/20 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <span>{displayMonthYear}</span>
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            </div>

            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {formatINR(monthTotal)}
            </div>
            
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Total Spending
            </div>
          </div>

          {/* TREND INDICATOR BADGE / CHART GRAPHIC */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {percentageChange !== null ? (
              <div
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                  isSpendingDown
                    ? 'bg-emerald-100/90 text-emerald-800 border-emerald-200'
                    : 'bg-amber-100/90 text-amber-800 border-amber-200'
                }`}
              >
                {isSpendingDown ? (
                  <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>{percentageChange}%</span>
                <span className="text-[10px] font-semibold opacity-80">vs last mo</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                <BarChart2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Active Track</span>
              </div>
            )}

            {/* MINI VISUAL BARS */}
            <div className="flex items-end gap-1 h-6 px-1 pt-1">
              <div className="w-1.5 bg-emerald-300 rounded-xs h-3"></div>
              <div className="w-1.5 bg-emerald-400 rounded-xs h-4"></div>
              <div className="w-1.5 bg-emerald-500 rounded-xs h-2"></div>
              <div className="w-1.5 bg-emerald-600 rounded-xs h-5"></div>
              <div className="w-1.5 bg-emerald-500 rounded-xs h-3"></div>
              <div className="w-1.5 bg-emerald-700 rounded-xs h-6"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 SUMMARY PILL STATS: TODAY | THIS MONTH | THIS YEAR */}
      <div className="grid grid-cols-3 gap-2">
        {/* TODAY */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-500">
            <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">Today</span>
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-1">
            {formatINR(todayTotal)}
          </div>
        </div>

        {/* THIS MONTH */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-500">
            <BarChart2 className="w-3 h-3 text-indigo-600 shrink-0" />
            <span className="truncate">This Month</span>
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-1">
            {formatINR(monthTotal)}
          </div>
        </div>

        {/* THIS YEAR */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-500">
            <ArrowUpRight className="w-3 h-3 text-sky-600 shrink-0" />
            <span className="truncate">This Year</span>
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-1">
            {formatINR(yearTotal)}
          </div>
        </div>
      </div>
    </div>
  )
}
