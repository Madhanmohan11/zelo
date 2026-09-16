import React from 'react'
import { TrendingUp, BarChart2, Wallet, Clock } from 'lucide-react'
import { formatINR } from '../../utils/formatters'

export const ExpenseSummary = ({
  todayTotal = 0,
  todayCount = 0,
  weekTotal = 0,
  weekCount = 0,
  monthTotal = 0,
  monthCount = 0,
  totalSpending = 0,
  totalCount = 0
}) => {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
      {/* 1. TODAY'S SPENDING */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-700 whitespace-nowrap">
            Today's Spending
          </span>
          <div className="p-1.5 sm:p-2 rounded-full bg-emerald-100/60 text-emerald-600 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {formatINR(todayTotal)}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
            {todayCount} {todayCount === 1 ? 'transaction' : 'transactions'}
          </div>
        </div>
      </div>

      {/* 2. THIS WEEK */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-700 whitespace-nowrap">
            This Week
          </span>
          <div className="p-1.5 sm:p-2 rounded-full bg-indigo-100/60 text-indigo-600 shrink-0">
            <BarChart2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {formatINR(weekTotal)}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
            {weekCount} {weekCount === 1 ? 'transaction' : 'transactions'}
          </div>
        </div>
      </div>

      {/* 3. THIS MONTH */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-rose-700 whitespace-nowrap">
            This Month
          </span>
          <div className="p-1.5 sm:p-2 rounded-full bg-rose-100/60 text-rose-600 shrink-0">
            <Wallet className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {formatINR(monthTotal)}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
            {monthCount} {monthCount === 1 ? 'transaction' : 'transactions'}
          </div>
        </div>
      </div>

      {/* 4. TOTAL SPENDING */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-sky-700 whitespace-nowrap">
            Total Spending
          </span>
          <div className="p-1.5 sm:p-2 rounded-full bg-sky-100/60 text-sky-600 shrink-0">
            <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {formatINR(totalSpending)}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
            {totalCount} {totalCount === 1 ? 'transaction' : 'transactions'}
          </div>
        </div>
      </div>
    </div>
  )
}
