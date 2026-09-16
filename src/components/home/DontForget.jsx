import React from 'react'
import { Bookmark, CheckCircle2, MapPin, Clock, Check } from 'lucide-react'
import { useModulePreferences } from '../../context/ModuleContext'

export const DontForget = ({
  remembers = [],
  onMarkCollected
}) => {
  const { isModuleEnabled } = useModulePreferences()

  const isRememberEnabled = isModuleEnabled('remember')
  const isCalendarEnabled = isModuleEnabled('calendar')
  const isTasksEnabled = isModuleEnabled('tasks')

  if (!isRememberEnabled && !isCalendarEnabled && !isTasksEnabled) {
    return null
  }

  const hasItems = remembers.length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Don't Forget
        </h2>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs">
        {!hasItems ? (
          <div className="py-5 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <p className="text-xs font-bold text-slate-700">You're all caught up!</p>
            <p className="text-[11px] font-medium text-slate-400">No pending items requiring your immediate attention.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {remembers.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-xl shrink-0">
                    <Bookmark className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-0.5">
                      {item.location && (
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="w-3 h-3 text-purple-600" />
                          {item.location}
                        </span>
                      )}
                      {item.expected_date && (
                        <span className="flex items-center gap-0.5 truncate">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Due {item.expected_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onMarkCollected?.(item)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
                >
                  Collected
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
