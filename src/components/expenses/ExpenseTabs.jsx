import React from 'react'
import { IndianRupee, Wallet } from 'lucide-react'

export const ExpenseTabs = ({ activeTab, onChange }) => {
  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 max-w-xs mx-auto mb-6">
      <button
        type="button"
        onClick={() => onChange('expenses')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
          activeTab === 'expenses'
            ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80 scale-[1.02]'
            : 'text-slate-500 hover:text-slate-900 font-semibold'
        }`}
      >
        <IndianRupee className={`w-4 h-4 ${activeTab === 'expenses' ? 'text-emerald-600' : 'text-slate-400'}`} />
        <span>Expenses</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('savings')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
          activeTab === 'savings'
            ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80 scale-[1.02]'
            : 'text-slate-500 hover:text-slate-900 font-semibold'
        }`}
      >
        <Wallet className={`w-4 h-4 ${activeTab === 'savings' ? 'text-emerald-600' : 'text-slate-400'}`} />
        <span>Savings</span>
      </button>
    </div>
  )
}
