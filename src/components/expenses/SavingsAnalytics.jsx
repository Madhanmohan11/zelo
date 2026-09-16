import React from 'react'
import { TrendingUp, TrendingDown, Wallet, Info } from 'lucide-react'
import { formatINR } from '../../utils/formatters'
import { Select } from '../ui/Select'

export const SavingsAnalytics = ({
  periodMode = 'monthly',
  onPeriodModeChange,
  selectedMonth = 8, // 0-indexed (8 = Sep)
  onMonthChange,
  selectedYear = 2026,
  onYearChange,
  metrics = {}
}) => {
  const monthOptions = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ]

  const yearOptions = [
    { value: 2026, label: '2026' },
    { value: 2025, label: '2025' },
    { value: 2024, label: '2024' }
  ]

  const {
    openingBalance = 0,
    totalIncome = 0,
    totalExpenses = 0,
    transfersIn = 0,
    transfersOut = 0,
    closingBalance = 0,
    netSavings = 0,
    savingsRate = 0,
    transactionCount = 0,
    incomePct = 12,
    expensePct = 8,
    savingsPct = 20
  } = metrics

  return (
    <div className="space-y-4" id="savings-analytics-section">
      {/* PERIOD SELECTOR HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-100/90 shadow-2xs">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Savings Analytics
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Financial summary for selected period
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* SEGMENTED TOGGLE: [ Monthly ] [ Yearly ] */}
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 text-xs font-extrabold shrink-0">
            <button
              type="button"
              onClick={() => onPeriodModeChange('monthly')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                periodMode === 'monthly'
                  ? 'bg-white text-emerald-800 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => onPeriodModeChange('yearly')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                periodMode === 'yearly'
                  ? 'bg-white text-emerald-800 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* MONTH & YEAR DROPDOWNS */}
          {periodMode === 'monthly' && (
            <Select
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              options={monthOptions}
              className="rounded-full text-xs font-bold py-1.5 px-3 bg-slate-50 border-slate-200"
            />
          )}

          <Select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            options={yearOptions}
            className="rounded-full text-xs font-bold py-1.5 px-3 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      {/* TOP 3 ANALYTICS CARDS (Income, Expenses, Savings) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* INCOME */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="p-2 rounded-full bg-emerald-100/60 text-emerald-600 shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> {incomePct}%
            </span>
          </div>

          <div>
            <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
              Income
            </span>
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5 truncate">
              {formatINR(totalIncome)}
            </div>
          </div>
        </div>

        {/* EXPENSES */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="p-2 rounded-full bg-rose-100/60 text-rose-600 shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> {expensePct}%
            </span>
          </div>

          <div>
            <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
              Expenses
            </span>
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5 truncate">
              {formatINR(totalExpenses)}
            </div>
          </div>
        </div>

        {/* SAVINGS */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="p-2 rounded-full bg-emerald-100/60 text-emerald-600 shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> {savingsPct}%
            </span>
          </div>

          <div>
            <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider block">
              Savings
            </span>
            <div className="text-base sm:text-lg font-black text-emerald-700 tracking-tight mt-0.5 truncate">
              {formatINR(netSavings)}
            </div>
          </div>
        </div>
      </div>

      {/* SAVINGS RATE BAR CARD */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-extrabold">
          <span className="text-slate-800 flex items-center gap-1">
            Savings Rate: <strong className="text-emerald-700">{savingsRate}%</strong>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </span>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[11px]">
            {savingsRate >= 30 ? 'Good Progress! 🎉' : 'Keep Going! 💪'}
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
          />
        </div>
      </div>

      {/* FINANCIAL PERIOD BREAKDOWN TABLE */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100/90 shadow-2xs space-y-3">
        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          Financial Summary ({periodMode === 'monthly' ? monthOptions[selectedMonth]?.label : selectedYear})
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
            <span className="text-slate-500">Opening Balance</span>
            <span className="font-bold text-slate-900">{formatINR(openingBalance)}</span>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/80 flex justify-between items-center">
            <span className="text-emerald-800">Total Money Added</span>
            <span className="font-black text-emerald-700">+{formatINR(totalIncome)}</span>
          </div>

          <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100/80 flex justify-between items-center">
            <span className="text-rose-800">Total Expenses</span>
            <span className="font-black text-rose-700">-{formatINR(totalExpenses)}</span>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/80 flex justify-between items-center">
            <span className="text-blue-800">Transfers In / Out</span>
            <span className="font-bold text-blue-900">
              +{formatINR(transfersIn)} / -{formatINR(transfersOut)}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between font-bold text-xs">
          <span>Net Closing Balance ({transactionCount} tx)</span>
          <span className="text-base font-black text-emerald-400">{formatINR(closingBalance)}</span>
        </div>
      </div>
    </div>
  )
}
