import React from 'react'
import { Sparkles, ChevronRight } from 'lucide-react'

export const HomeHeader = ({ userName = 'Friend', dateStr = '', quote = 'Stay consistent. Your future self will thank you.' }) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const formattedDate = dateStr || new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-amber-50/40 p-5 sm:p-6 shadow-xs">
      {/* BACKGROUND DECORATIVE LANDSCAPE ARTWORK */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-90 hidden sm:block">
        <svg className="w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="none" fill="none">
          <circle cx="150" cy="35" r="22" fill="#FDBA74" fillOpacity="0.45" />
          <path d="M70 120 Q120 70 200 100 L200 120 Z" fill="#6EE7B7" fillOpacity="0.35" />
          <path d="M100 120 Q150 80 200 110 L200 120 Z" fill="#34D399" fillOpacity="0.3" />
        </svg>
      </div>

      {/* TOP DECORATIVE SLOGAN TEXT */}
      <div className="absolute top-4 right-5 hidden sm:block text-right">
        <span className="text-xs font-serif italic text-emerald-800/80 tracking-wide font-medium">
          A better you <br />
          <span className="font-sans font-bold not-italic text-emerald-900 text-[13px]">Every day</span>
        </span>
      </div>

      {/* MAIN GREETING CONTENT */}
      <div className="relative z-10 max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>{getGreeting()}, {userName}</span>
          <span className="inline-block animate-bounce text-xl">👋</span>
        </h1>

        <p className="text-xs font-extrabold text-slate-500 mt-1 uppercase tracking-wider">
          {formattedDate}
        </p>

        <p className="text-xs font-semibold text-slate-600 mt-0.5">
          Small steps today, bigger results tomorrow.
        </p>

        {/* QUOTE PILL CARD */}
        <div className="mt-4 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 transition-all hover:border-emerald-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="truncate text-xs font-bold text-slate-800">
              "{quote}"
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  )
}
