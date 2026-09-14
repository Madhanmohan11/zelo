import React from 'react'
import { Utensils, Dumbbell, Bookmark, CheckCircle2, Clock, MapPin, Plus, ArrowRight } from 'lucide-react'

export const DailyTimeline = ({
  meals = [],
  workouts = [],
  remembers = [],
  onToggleMeal = () => {},
  onToggleWorkout = () => {},
  onMarkCollected = () => {},
  onOpenQuickAdd = () => {}
}) => {
  // Helper to normalize and sort timeline items
  const timelineItems = []

  // Add meals
  meals.forEach((m) => {
    let fallbackTime = '12:00'
    const type = (m.meal_type || '').toLowerCase()
    if (type.includes('breakfast')) fallbackTime = '08:30'
    else if (type.includes('morning')) fallbackTime = '10:30'
    else if (type.includes('lunch')) fallbackTime = '13:00'
    else if (type.includes('evening') || type.includes('snack')) fallbackTime = '16:30'
    else if (type.includes('dinner')) fallbackTime = '20:30'

    timelineItems.push({
      id: `meal-${m.id}`,
      type: 'meal',
      rawTime: m.scheduled_time || fallbackTime,
      title: m.title || 'Meal',
      subtitle: `${(m.meal_type || 'meal').replace('_', ' ')} ${m.calories ? `• ${m.calories} kcal` : ''}`,
      status: m.status || 'pending',
      original: m
    })
  })

  // Add workouts
  workouts.forEach((w) => {
    timelineItems.push({
      id: `workout-${w.id}`,
      type: 'workout',
      rawTime: w.scheduled_time || '18:00',
      title: w.title || 'Workout Session',
      subtitle: `${w.duration_minutes || 45} mins ${w.description ? `• ${w.description}` : ''}`,
      status: w.status || 'planned',
      original: w
    })
  })

  // Add active remember items due today / pending
  remembers.forEach((r) => {
    timelineItems.push({
      id: `remember-${r.id}`,
      type: 'remember',
      rawTime: r.reminder_time || '18:30',
      title: r.title || 'Errand / Item',
      subtitle: r.location ? `Location: ${r.location}` : 'Pending collection',
      status: r.status || 'waiting',
      original: r
    })
  })

  // Sort by rawTime ascending (e.g. 08:30 -> 13:00 -> 18:00)
  timelineItems.sort((a, b) => (a.rawTime || '').localeCompare(b.rawTime || ''))

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Timeline</h2>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Today's Schedule</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {timelineItems.length} {timelineItems.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      {timelineItems.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Your day is open</div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
              Add meals, workouts, or errands to build your daily timeline.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onOpenQuickAdd('food')}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-amber-300 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-all"
            >
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Meal</span>
            </button>
            <button
              onClick={() => onOpenQuickAdd('workout')}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-rose-300 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-all"
            >
              <Dumbbell className="w-3.5 h-3.5 text-rose-600" />
              <span>+ Workout</span>
            </button>
            <button
              onClick={() => onOpenQuickAdd('remember')}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-purple-300 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-all"
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-600" />
              <span>+ Remember</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative pl-5 sm:pl-7 border-l-2 border-slate-100 space-y-6">
          {timelineItems.map((item) => {
            const isMeal = item.type === 'meal'
            const isWorkout = item.type === 'workout'
            const isRemember = item.type === 'remember'

            const isDone = item.status === 'completed' || item.status === 'collected'
            const isOverdue = item.status === 'overdue'

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Connector Dot */}
                <div
                  className={`absolute -left-[27px] sm:-left-[35px] top-1.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isOverdue
                      ? 'border-rose-500 bg-rose-50 text-rose-600'
                      : 'border-slate-300 text-slate-400 group-hover:border-emerald-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>

                {/* Event Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-50/50 border-slate-200/50 opacity-75'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Category Icon Badge */}
                    <div
                      className={`p-2.5 rounded-2xl shrink-0 ${
                        isMeal
                          ? 'bg-amber-50 text-amber-800'
                          : isWorkout
                          ? 'bg-rose-50 text-rose-800'
                          : 'bg-purple-50 text-purple-800'
                      }`}
                    >
                      {isMeal && <Utensils className="w-4 h-4" />}
                      {isWorkout && <Dumbbell className="w-4 h-4" />}
                      {isRemember && <Bookmark className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.rawTime}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] font-bold capitalize text-slate-500">
                          {item.type}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-extrabold tracking-tight mt-0.5 truncate ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status Button */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isMeal && (
                      <button
                        onClick={() => onToggleMeal(item.original)}
                        className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                          isDone
                            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isDone ? 'Completed' : 'Mark Ate'}</span>
                      </button>
                    )}

                    {isWorkout && (
                      <button
                        onClick={() => onToggleWorkout(item.original)}
                        className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                          isDone
                            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isDone ? 'Done' : 'Mark Done'}</span>
                      </button>
                    )}

                    {isRemember && (
                      <button
                        onClick={() => onMarkCollected(item.original)}
                        className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                          isDone
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>{isDone ? 'Collected' : 'Mark Collected'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
