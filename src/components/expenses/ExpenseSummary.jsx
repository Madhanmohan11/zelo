import React from 'react'
import { Card } from '../ui/Card'
import { formatINR } from '../../utils/formatters'

export const ExpenseSummary = ({ todayTotal, weekTotal, monthTotal, totalSpending }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="bg-emerald-50/80 border border-emerald-200/80 p-3.5 flex flex-col justify-between">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800">Today's Spending</span>
        <div className="text-lg sm:text-xl font-black text-emerald-950 mt-1">{formatINR(todayTotal)}</div>
      </Card>

      <Card className="bg-indigo-50/80 border border-indigo-200/80 p-3.5 flex flex-col justify-between">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-800">This Week</span>
        <div className="text-lg sm:text-xl font-black text-indigo-950 mt-1">{formatINR(weekTotal)}</div>
      </Card>

      <Card className="bg-purple-50/80 border border-purple-200/80 p-3.5 flex flex-col justify-between">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-800">This Month</span>
        <div className="text-lg sm:text-xl font-black text-purple-950 mt-1">{formatINR(monthTotal)}</div>
      </Card>

      <Card className="bg-slate-100/90 border border-slate-200/80 p-3.5 flex flex-col justify-between">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Total Spending</span>
        <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">{formatINR(totalSpending)}</div>
      </Card>
    </div>
  )
}
