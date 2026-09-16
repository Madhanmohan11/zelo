import React from 'react'
import { Calendar as CalendarIcon, CheckSquare, Bookmark, Utensils, Dumbbell, Plus } from 'lucide-react'
import { useModulePreferences } from '../../context/ModuleContext'

export const TodaySchedule = ({
  scheduleItems = [],
  onOpenQuickAdd,
  onToggleMeal,
  onToggleWorkout,
  onMarkCollected
}) => {
  const { isModuleEnabled } = useModulePreferences()

  const showTasksAction = isModuleEnabled('tasks')
  const showCalendarAction = isModuleEnabled('calendar')
  const showRememberAction = isModuleEnabled('remember')

  const hasItems = scheduleItems.length > 0

  return (
    <div className="space-y-3">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Today's Schedule
        </h2>
        <button
          type="button"
          onClick={() => onOpenQuickAdd?.('expense')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
        >
          View all
        </button>
      </div>

      {/* CARD CONTAINER */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs">
        {!hasItems ? (
          /* EMPTY STATE (YOUR DAY IS OPEN) */
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
              <CalendarIcon className="w-7 h-7 stroke-[2]" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Your day is open</h3>
              <p className="text-xs font-medium text-slate-500 mt-1 max-w-xs">
                Add an event, task, or reminder to plan your day.
              </p>
            </div>

            {/* QUICK PILL ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {showTasksAction && (
                <button
                  type="button"
                  onClick={() => onOpenQuickAdd?.('remember')}
                  className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>+ Task</span>
                </button>
              )}

              {showCalendarAction && (
                <button
                  type="button"
                  onClick={() => onOpenQuickAdd?.('remember')}
                  className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>+ Event</span>
                </button>
              )}

              {showRememberAction && (
                <button
                  type="button"
                  onClick={() => onOpenQuickAdd?.('remember')}
                  className="px-3.5 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>+ Remember</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* SCHEDULE TIMELINE LIST */
          <div className="space-y-3">
            {scheduleItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200/60 shrink-0">
                    {item.type === 'meal' && <Utensils className="w-4 h-4 text-amber-600" />}
                    {item.type === 'workout' && <Dumbbell className="w-4 h-4 text-indigo-600" />}
                    {item.type === 'remember' && <Bookmark className="w-4 h-4 text-purple-600" />}
                    {(!item.type || item.type === 'task') && <CheckSquare className="w-4 h-4 text-blue-600" />}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">
                      {item.time || item.subtitle || 'Today'}
                    </p>
                  </div>
                </div>

                {item.type === 'meal' && (
                  <button
                    onClick={() => onToggleMeal?.(item)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      item.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.status === 'completed' ? 'Logged' : 'Log'}
                  </button>
                )}

                {item.type === 'workout' && (
                  <button
                    onClick={() => onToggleWorkout?.(item)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      item.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.status === 'completed' ? 'Done' : 'Start'}
                  </button>
                )}

                {item.type === 'remember' && (
                  <button
                    onClick={() => onMarkCollected?.(item)}
                    className="px-3 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold transition-all"
                  >
                    Collect
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
