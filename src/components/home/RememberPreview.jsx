import React from 'react'
import { Bookmark, ArrowRight, CheckCircle2, MapPin, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const RememberPreview = ({ remembers = [], onMarkCollected = () => {} }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Bookmark className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Don't Forget</h3>
        </div>
        <button
          onClick={() => navigate('/remember')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {remembers.length === 0 ? (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-500 flex items-center gap-2">
          <span className="text-emerald-600 font-bold text-sm">✓</span>
          <span>Nothing waiting right now. You're all caught up!</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {remembers.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">{item.title}</div>
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2 mt-0.5">
                  {item.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                      {item.location}
                    </span>
                  )}
                  {item.expected_date && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.expected_date}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onMarkCollected(item)}
                className="px-3 py-1.5 rounded-full bg-white border border-purple-200 text-purple-900 text-xs font-extrabold hover:bg-purple-100 transition-all shrink-0"
              >
                Collected
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
