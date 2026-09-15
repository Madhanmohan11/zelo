import React from 'react'
import { CheckCircle2, Utensils, Dumbbell, Bookmark, IndianRupee, Sparkles } from 'lucide-react'
import { formatINR } from '../../utils/formatters'

export const DailyProgress = ({ meals = [], workouts = [], remembers = [], expenses = [], spentTotal = 0 }) => {
  const totalMeals = meals.length
  const completedMeals = meals.filter(m => m.status === 'completed').length

  const totalWorkouts = workouts.length
  const completedWorkouts = workouts.filter(w => w.status === 'completed').length

  const activeRemembers = remembers.length

  const totalTrackedItems = totalMeals + totalWorkouts
  const totalCompletedItems = completedMeals + completedWorkouts
  
  const completionPercentage = totalTrackedItems > 0 
    ? Math.round((totalCompletedItems / totalTrackedItems) * 100) 
    : (totalMeals === 0 && totalWorkouts === 0 ? 100 : 0)

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-xs space-y-4">
      {/* Header & Percentage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Daily Summary</h2>
            <div className="text-sm font-black text-slate-900">
              {totalTrackedItems > 0
                ? `${totalCompletedItems} of ${totalTrackedItems} routines done`
                : 'Ready for today'}
            </div>
          </div>
        </div>

        {totalTrackedItems > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{completionPercentage}% Done</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {totalTrackedItems > 0 && (
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(completionPercentage, 5)}%` }}
          />
        </div>
      )}

      {/* Compact Quick Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Food Chip */}
        <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Utensils className="w-4 h-4 text-amber-700 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Food</div>
              <div className="text-xs font-black text-slate-900 truncate">
                {totalMeals > 0 ? `${completedMeals}/${totalMeals} Meals` : 'No meals'}
              </div>
            </div>
          </div>
          {totalMeals > 0 && completedMeals === totalMeals && (
            <span className="text-emerald-700 font-bold text-[10px]">✓</span>
          )}
        </div>

        {/* Workout Chip */}
        <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Dumbbell className="w-4 h-4 text-rose-700 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Workout</div>
              <div className="text-xs font-black text-slate-900 truncate">
                {totalWorkouts > 0 ? (completedWorkouts > 0 ? 'Completed' : 'Planned') : 'Rest Day'}
              </div>
            </div>
          </div>
          {completedWorkouts > 0 && (
            <span className="text-emerald-700 font-bold text-[10px]">✓</span>
          )}
        </div>

        {/* Remember Chip */}
        <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Bookmark className="w-4 h-4 text-purple-700 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Remember</div>
              <div className="text-xs font-black text-slate-900 truncate">
                {activeRemembers > 0 ? `${activeRemembers} Pending` : 'All clear'}
              </div>
            </div>
          </div>
        </div>

        {/* Spent Chip */}
        <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <IndianRupee className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Expenses</div>
              <div className="text-xs font-black text-slate-900 truncate">
                {formatINR(spentTotal)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
