import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplet, Moon, Utensils, Dumbbell, Sparkles, ChevronRight } from 'lucide-react'
import { useModulePreferences } from '../../context/ModuleContext'

export const WellnessSection = ({
  waterLog = 1.8,
  waterTarget = 2.5,
  sleepHours = 8,
  todayMeals = [],
  todayWorkouts = []
}) => {
  const navigate = useNavigate()
  const { isModuleEnabled } = useModulePreferences()

  const isWaterEnabled = isModuleEnabled('water')
  const isSleepEnabled = isModuleEnabled('sleep')
  const isFoodEnabled = isModuleEnabled('food')
  const isWorkoutEnabled = isModuleEnabled('workout')

  const anyWellnessEnabled = isWaterEnabled || isSleepEnabled || isFoodEnabled || isWorkoutEnabled

  if (!anyWellnessEnabled) return null

  const waterPct = Math.min(100, Math.round((waterLog / waterTarget) * 100))
  const sleepPct = Math.min(100, Math.round((sleepHours / 8) * 100))

  const wellnessCards = [
    {
      id: 'water',
      title: 'Water',
      value: `${waterLog} / ${waterTarget} L`,
      subtitle: '',
      icon: Droplet,
      iconBg: 'bg-cyan-100 text-cyan-600',
      progress: waterPct,
      progressColor: 'bg-cyan-500',
      route: '/more',
      enabled: isWaterEnabled
    },
    {
      id: 'sleep',
      title: 'Sleep',
      value: `${sleepHours}h`,
      subtitle: 'Last night',
      icon: Moon,
      iconBg: 'bg-purple-100 text-purple-600',
      progress: sleepPct,
      progressColor: 'bg-purple-500',
      route: '/more',
      enabled: isSleepEnabled
    },
    {
      id: 'food',
      title: 'Food',
      value: todayMeals.length > 0 ? `${todayMeals.length} meals` : 'No meals',
      subtitle: 'log your meals',
      icon: Utensils,
      iconBg: 'bg-amber-100 text-amber-600',
      route: '/food',
      enabled: isFoodEnabled
    },
    {
      id: 'workout',
      title: 'Workout',
      value: todayWorkouts.length > 0 ? `${todayWorkouts.length} logged` : 'Rest Day',
      subtitle: todayWorkouts.length > 0 ? 'active day' : 'Take it easy',
      icon: Dumbbell,
      iconBg: 'bg-rose-100 text-rose-600',
      route: '/workout',
      enabled: isWorkoutEnabled
    }
  ].filter((c) => c.enabled)

  return (
    <div className="space-y-3">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Wellness & Habits
        </h2>
        <button
          type="button"
          onClick={() => navigate('/customize-modules')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Edit
        </button>
      </div>

      {/* 2-COLUMN WELLNESS GRID */}
      <div className="grid grid-cols-2 gap-3">
        {wellnessCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.route)}
              className="bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col justify-between cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${card.iconBg} shrink-0`}>
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {card.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>

              <div>
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                  <span>{card.value}</span>
                  {card.subtitle && (
                    <span className="text-[10px] font-semibold text-slate-400 font-sans">
                      {card.subtitle}
                    </span>
                  )}
                </div>

                {/* OPTIONAL PROGRESS BAR */}
                {card.progress !== undefined && (
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${card.progressColor} rounded-full transition-all duration-500`}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* BOTTOM SLOGAN CARD */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0 shadow-2xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs font-bold text-emerald-950 italic">
          "Discipline today creates the life you want tomorrow."
        </div>
      </div>
    </div>
  )
}
