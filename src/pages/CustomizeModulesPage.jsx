import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IndianRupee,
  CheckSquare,
  Calendar,
  Bookmark,
  Utensils,
  Dumbbell,
  Droplet,
  Moon,
  Target,
  Sparkles,
  Lock,
  ArrowLeft,
  Check
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useModulePreferences } from '../context/ModuleContext'
import { useToast } from '../context/ToastContext'

const ICON_MAP = {
  IndianRupee,
  CheckSquare,
  Calendar,
  Bookmark,
  Utensils,
  Dumbbell,
  Droplet,
  Moon,
  Target
}

export const CustomizeModulesPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { allModules, isModuleEnabled, toggleModule, resetToDefaults } = useModulePreferences()

  const handleToggle = (moduleItem) => {
    if (moduleItem.locked) {
      showToast('Money & Expenses module is required and cannot be disabled', 'info')
      return
    }

    const wasEnabled = isModuleEnabled(moduleItem.id)
    toggleModule(moduleItem.id)
    showToast(
      `${moduleItem.name} module ${!wasEnabled ? 'enabled' : 'disabled'}`,
      !wasEnabled ? 'success' : 'info'
    )
  }

  const enabledCount = allModules.filter((m) => isModuleEnabled(m.id)).length

  return (
    <div className="space-y-6 pb-24 sm:pb-28 animate-in fade-in duration-300 max-w-2xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/80 bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customize Your ZELO
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Choose the features you want to use. Change anytime.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetToDefaults}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-all cursor-pointer"
        >
          Reset Defaults
        </button>
      </div>

      {/* ACTIVE SUMMARY BANNER */}
      <div className="p-4 bg-emerald-500 text-white rounded-3xl shadow-md shadow-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-2xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black">Personalized Dashboard</h3>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              {enabledCount} of {allModules.length} modules active on your home screen
            </p>
          </div>
        </div>
      </div>

      {/* MODULES LIST */}
      <div className="space-y-3">
        {allModules.map((moduleItem) => {
          const IconComp = ICON_MAP[moduleItem.icon] || Sparkles
          const enabled = isModuleEnabled(moduleItem.id)

          return (
            <Card
              key={moduleItem.id}
              className={`p-4 transition-all duration-200 rounded-2xl border ${
                enabled
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/60 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Module Icon Badge */}
                  <div className={`p-3 rounded-2xl border ${moduleItem.badgeBg} shrink-0`}>
                    <IconComp className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  {/* Module Name & Description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">
                        {moduleItem.name}
                      </h4>
                      {moduleItem.locked && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Always Active</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                      {moduleItem.description}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div className="shrink-0 ml-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    disabled={moduleItem.locked}
                    onClick={() => handleToggle(moduleItem)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      moduleItem.locked
                        ? 'bg-emerald-500 opacity-60 cursor-not-allowed'
                        : enabled
                        ? 'bg-emerald-500'
                        : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
