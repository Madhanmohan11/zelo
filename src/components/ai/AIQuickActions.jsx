import React from 'react'
import { Plus, IndianRupee, CheckSquare, Bookmark, Calendar, TrendingUp, HelpCircle } from 'lucide-react'

export const AIQuickActions = ({ onSelectAction }) => {
  const actions = [
    { label: 'Add Expense', prompt: 'Add an expense for ₹', icon: IndianRupee, color: 'emerald' },
    { label: 'Create Task', prompt: 'Create a task to ', icon: CheckSquare, color: 'blue' },
    { label: 'Add Reminder', prompt: 'Remind me to ', icon: Bookmark, color: 'purple' },
    { label: 'Plan My Day', prompt: 'Plan my day today', icon: Calendar, color: 'amber' },
    { label: 'Analyze Progress', prompt: 'Show my progress and analytics summary', icon: TrendingUp, color: 'teal' },
    { label: 'Ask Anything', prompt: 'What can you help me with?', icon: HelpCircle, color: 'slate' }
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2 px-1">
      {actions.map((act) => {
        const Icon = act.icon
        return (
          <button
            key={act.label}
            type="button"
            onClick={() => onSelectAction(act.prompt)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold border border-slate-200/80 hover:border-emerald-200 transition-all shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          >
            <Icon className="w-3.5 h-3.5 text-emerald-600" />
            <span>{act.label}</span>
          </button>
        )
      })}
    </div>
  )
}
