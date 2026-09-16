import React from 'react'
import { IndianRupee, Wallet } from 'lucide-react'

export const ExpenseTabs = ({ activeTab, onChange }) => {
  return (
    <div className="flex bg-slate-100/90 p-1 rounded-full border border-slate-200/60 max-w-xs mx-auto">
      <button
        type="button"
        onClick={() => onChange('expenses')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
          activeTab === 'expenses'
            ? 'bg-white text-emerald-800 shadow-2xs font-black'
            : 'text-slate-500 hover:text-slate-900 font-semibold'
        }`}
      >
        <IndianRupee className={`w-3.5 h-3.5 ${activeTab === 'expenses' ? 'text-emerald-600' : 'text-slate-400'}`} />
        <span>Expenses</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('savings')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
          activeTab === 'savings'
            ? 'bg-white text-emerald-800 shadow-2xs font-black'
            : 'text-slate-500 hover:text-slate-900 font-semibold'
        }`}
      >
        <Wallet className={`w-3.5 h-3.5 ${activeTab === 'savings' ? 'text-emerald-600' : 'text-slate-400'}`} />
        <span>Savings</span>
      </button>
    </div>
  )
}
