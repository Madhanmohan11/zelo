import React from 'react'
import { IndianRupee, CheckSquare, Sparkles, TrendingUp, Calendar, Clock } from 'lucide-react'
import { formatINR } from '../../utils/formatters'

export const AIActionCard = ({ metadata }) => {
  if (!metadata || !metadata.intent) return null

  const { intent, data } = metadata

  if (intent === 'GET_TODAY_EXPENSES' && data?.expenses) {
    return (
      <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-2 mt-2 text-xs shadow-2xs">
        <div className="flex items-center justify-between font-black text-slate-900 border-b border-slate-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span>Today's Expenses ({data.count || 0})</span>
          </span>
          <span className="text-emerald-700 text-sm">{formatINR(data.total || 0)}</span>
        </div>

        <div className="space-y-1.5 pt-1">
          {data.expenses.length === 0 ? (
            <p className="text-[11px] text-slate-500 font-semibold italic">No expenses logged for today yet.</p>
          ) : (
            data.expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between py-1 px-2 bg-slate-50 rounded-xl">
                <div>
                  <span className="font-extrabold text-slate-800">{exp.description || exp.category}</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">{exp.category}</span>
                </div>
                <span className="font-black text-slate-900">{formatINR(exp.amount)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  if (intent === 'GET_TODAY_TASKS' && data?.tasks) {
    return (
      <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-2 mt-2 text-xs shadow-2xs">
        <div className="flex items-center justify-between font-black text-slate-900 border-b border-slate-100 pb-1.5">
          <span className="flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>Pending Tasks ({data.count || 0})</span>
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          {data.tasks.length === 0 ? (
            <p className="text-[11px] text-slate-500 font-semibold italic">All clear! No pending tasks for today.</p>
          ) : (
            data.tasks.map((tsk) => (
              <div key={tsk.id} className="flex items-center justify-between py-1 px-2 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800">{tsk.title}</span>
                <span className="text-[9px] font-extrabold capitalize px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  {tsk.priority || 'normal'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  if (intent === 'GET_PROGRESS_SUMMARY' || intent === 'GET_TODAY_SCHEDULE') {
    return (
      <div className="p-3.5 bg-gradient-to-br from-slate-900 to-emerald-950 text-white border border-emerald-800/40 rounded-2xl space-y-2.5 mt-2 text-xs shadow-md">
        <div className="flex items-center justify-between font-black text-emerald-300 border-b border-white/10 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Today's Overview</span>
          </span>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
            ZELO AI Summary
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
          <div className="bg-white/10 p-2 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-300 block uppercase">Spent Today</span>
            <span className="text-sm font-black text-emerald-300">{formatINR(data?.todaySpending || 0)}</span>
          </div>

          <div className="bg-white/10 p-2 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-300 block uppercase">Pending Tasks</span>
            <span className="text-sm font-black text-blue-300">{data?.pendingTasksCount || 0}</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
