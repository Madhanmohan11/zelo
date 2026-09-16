import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatINR } from '../../utils/formatters'
import { useModulePreferences } from '../../context/ModuleContext'

export const MoneySnapshot = ({
  spentTotal = 15,
  dailyBudget = 1000
}) => {
  const navigate = useNavigate()
  const { isModuleEnabled } = useModulePreferences()

  if (!isModuleEnabled('money')) return null

  const spentPct = Math.min(100, Math.round((spentTotal / dailyBudget) * 100))
  const remainingBudget = Math.max(0, dailyBudget - spentTotal)

  return (
    <div className="space-y-3">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Spending Today
        </h2>
        <button
          type="button"
          onClick={() => navigate('/expenses')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
        >
          View Details
        </button>
      </div>

      {/* COMPACT CARD MATCHING REFERENCE SCREENSHOT */}
      <div
        onClick={() => navigate('/expenses')}
        className="bg-emerald-50/70 border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer group"
      >
        {/* LEFT: CIRCULAR PERCENTAGE GAUGE */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-emerald-200/80"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-600 transition-all duration-700 stroke-round"
                strokeDasharray={`${spentPct}, 100`}
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black text-slate-800">{spentPct}%</span>
            </div>
          </div>

          <div className="hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">of daily budget</span>
          </div>
        </div>

        {/* CENTER: SPENT TODAY VALUE */}
        <div className="text-center sm:text-left">
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(spentTotal)}
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            spent today
          </div>
        </div>

        {/* RIGHT: BUDGET & REMAINING METRICS WITH CHEVRON */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-black text-slate-800">
              {formatINR(dailyBudget)}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 block">
              daily budget
            </div>
            <div className="text-xs font-black text-emerald-700 mt-1">
              {formatINR(remainingBudget)}
            </div>
            <div className="text-[10px] font-semibold text-emerald-600 block">
              remaining
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors ml-1" />
        </div>
      </div>
    </div>
  )
}
