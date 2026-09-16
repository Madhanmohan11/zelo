import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Bookmark,
  Utensils,
  Dumbbell,
  Droplet,
  Moon,
  Target,
  Sliders,
  Settings,
  HelpCircle,
  Info,
  ChevronRight,
  IndianRupee,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { useModulePreferences } from '../context/ModuleContext'

export const MorePage = () => {
  const navigate = useNavigate()
  const { isModuleEnabled } = useModulePreferences()

  const featureLinks = [
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'View events, schedule, and reminders',
      icon: Calendar,
      badgeBg: 'bg-rose-50 text-rose-600',
      path: '/calendar'
    },
    {
      id: 'remember',
      title: 'Remember Hub',
      description: 'Track items, repairs, lent objects',
      icon: Bookmark,
      badgeBg: 'bg-purple-50 text-purple-600',
      path: '/remember'
    },
    {
      id: 'food',
      title: 'Food',
      description: 'Track your meals and nutrition',
      icon: Utensils,
      badgeBg: 'bg-amber-50 text-amber-600',
      path: '/food'
    },
    {
      id: 'workout',
      title: 'Workout',
      description: 'Log your exercises and fitness',
      icon: Dumbbell,
      badgeBg: 'bg-indigo-50 text-indigo-600',
      path: '/workout'
    },
    {
      id: 'water',
      title: 'Water',
      description: 'Track your daily water intake',
      icon: Droplet,
      badgeBg: 'bg-cyan-50 text-cyan-600',
      path: '/more'
    },
    {
      id: 'sleep',
      title: 'Sleep',
      description: 'Monitor your sleep and rest',
      icon: Moon,
      badgeBg: 'bg-violet-50 text-violet-600',
      path: '/more'
    },
    {
      id: 'goals',
      title: 'Goals',
      description: 'Set and track your life goals',
      icon: Target,
      badgeBg: 'bg-emerald-50 text-emerald-600',
      path: '/more'
    }
  ]

  const appLinks = [
    {
      title: 'Customize Modules',
      description: 'Choose modules and customize your home screen',
      icon: Sliders,
      badgeBg: 'bg-emerald-100 text-emerald-800',
      path: '/customize-modules'
    },
    {
      title: 'Settings',
      description: 'App preferences and security',
      icon: Settings,
      badgeBg: 'bg-slate-100 text-slate-700',
      path: '/profile'
    }
  ]

  return (
    <div className="space-y-6 pb-24 sm:pb-28 animate-in fade-in duration-300 max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="pt-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">More Features</h1>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Access all ZELO tools, settings, and module preferences
        </p>
      </div>

      {/* MODULE FEATURES LIST */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
          Modules & Features
        </h2>

        {/* MONEY MODULE ALWAYS ACCESSIBLE */}
        <Card
          onClick={() => navigate('/expenses')}
          className="p-4 bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <IndianRupee className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Money & Expenses
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Track daily spending, accounts, and savings
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
        </Card>

        {featureLinks.map((item) => {
          const IconComp = item.icon
          const enabled = isModuleEnabled(item.id)

          return (
            <Card
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`p-4 border transition-all cursor-pointer group rounded-2xl ${
                enabled
                  ? 'bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-xs'
                  : 'bg-slate-50/80 border-slate-200/60 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border ${item.badgeBg} shrink-0`}>
                    <IconComp className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h3>
                      {enabled ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Enabled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-extrabold">
                          Off
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </Card>
          )
        })}
      </div>

      {/* APP & SETTINGS SECTION */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
          App Settings
        </h2>

        {appLinks.map((item) => {
          const IconComp = item.icon
          return (
            <Card
              key={item.title}
              onClick={() => navigate(item.path)}
              className="p-4 bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border ${item.badgeBg} shrink-0`}>
                    <IconComp className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
