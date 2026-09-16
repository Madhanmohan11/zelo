import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet,
  CheckCircle2,
  Calendar as CalendarIcon,
  Bookmark,
  ChevronRight,
  BarChart3,
  Settings
} from 'lucide-react'
import { useModulePreferences } from '../../context/ModuleContext'
import { formatINR } from '../../utils/formatters'

export const TodayOverview = ({
  spentTotal = 0,
  tasksCompleted = 3,
  tasksTotal = 5,
  eventsTodayCount = 0,
  rememberPendingCount = 0
}) => {
  const navigate = useNavigate()
  const { isModuleEnabled } = useModulePreferences()

  const cardItems = [
    {
      id: 'money',
      title: 'Money',
      value: formatINR(spentTotal),
      subtitle: 'spent today',
      icon: Wallet,
      iconBg: 'bg-emerald-100 text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      graphic: <BarChart3 className="w-5 h-5 text-emerald-500 opacity-80" />,
      route: '/expenses',
      enabled: isModuleEnabled('money')
    },
    {
      id: 'tasks',
      title: 'Tasks',
      value: `${tasksCompleted} / ${tasksTotal}`,
      subtitle: 'completed',
      icon: CheckCircle2,
      iconBg: 'bg-blue-100 text-blue-700',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-100',
      graphic: (
        <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-blue-600 animate-spin-slow opacity-80" />
      ),
      route: '/remember',
      enabled: isModuleEnabled('tasks')
    },
    {
      id: 'calendar',
      title: 'Calendar',
      value: `${eventsTodayCount}`,
      subtitle: 'events today',
      icon: CalendarIcon,
      iconBg: 'bg-rose-100 text-rose-700',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-100',
      graphic: <CalendarIcon className="w-5 h-5 text-rose-400 opacity-80" />,
      route: '/calendar',
      enabled: isModuleEnabled('calendar')
    },
    {
      id: 'remember',
      title: 'Remember',
      value: rememberPendingCount > 0 ? `${rememberPendingCount} pending` : 'All clear',
      subtitle: rememberPendingCount > 0 ? 'items awaiting' : 'No pending items',
      icon: Bookmark,
      iconBg: 'bg-purple-100 text-purple-700',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-100',
      graphic: <Bookmark className="w-5 h-5 text-purple-400 opacity-80" />,
      route: '/remember',
      enabled: isModuleEnabled('remember')
    }
  ].filter((item) => item.enabled)

  if (cardItems.length === 0) return null

  return (
    <div className="space-y-3">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Today's Overview
        </h2>
        <button
          type="button"
          onClick={() => navigate('/customize-modules')}
          className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Customize</span>
        </button>
      </div>

      {/* 2-COLUMN RESPONSIVE GRID */}
      <div className="grid grid-cols-2 gap-3">
        {cardItems.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.route)}
              className="bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              {/* TOP ICON & TITLE ROW */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${item.iconBg} shrink-0`}>
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>

              {/* VALUE & GRAPHIC ROW */}
              <div className="flex items-end justify-between gap-1">
                <div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
                <div className="shrink-0 pb-0.5">{item.graphic}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
