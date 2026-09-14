import React, { useState } from 'react'
import { Droplets, Moon, Activity, Plus } from 'lucide-react'

export const HealthSnapshot = ({ userSettings = {} }) => {
  const waterTargetMl = userSettings?.water_target_ml || 2500
  const [waterIntakeMl, setWaterIntakeMl] = useState(1750)

  const handleAddWater = () => {
    setWaterIntakeMl((prev) => Math.min(prev + 250, 5000))
  }

  const wakeTime = userSettings?.wake_time || '07:00'
  const sleepTime = userSettings?.sleep_time || '23:00'

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Wellness & Habits</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Water Intake Card */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-blue-900 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                Water
              </span>
              <button
                onClick={handleAddWater}
                title="Add 250ml"
                className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="text-sm font-black text-slate-900">
              {(waterIntakeMl / 1000).toFixed(1)} / {(waterTargetMl / 1000).toFixed(1)} L
            </div>
          </div>
          <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min((waterIntakeMl / waterTargetMl) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Sleep Target Card */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              Sleep Schedule
            </div>
            <div className="text-sm font-black text-slate-900">8h Target</div>
            <div className="text-[10px] font-medium text-slate-500 mt-0.5">
              {wakeTime} Wake • {sleepTime} Sleep
            </div>
          </div>
          <div className="text-[10px] font-bold text-indigo-700 mt-2">
            Rest well tonight
          </div>
        </div>
      </div>
    </div>
  )
}
