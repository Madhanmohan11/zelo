import React from 'react';
import { Activity, Dumbbell, Utensils, IndianRupee, Bell } from 'lucide-react';

export function ActivityTimeline({ activities = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />;
      case 'food':
        return <Utensils className="w-3.5 h-3.5 text-teal-600" />;
      case 'expense':
        return <IndianRupee className="w-3.5 h-3.5 text-amber-600" />;
      case 'remember':
        return <Bell className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {activities.map((act) => (
        <div key={act.id} className="relative flex items-start justify-between gap-4 group">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-200 group-hover:border-teal-600 flex items-center justify-center transition-colors shadow-xs">
            {getIcon(act.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{act.userName}</span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {act.category}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{act.title}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{act.detail}</p>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{act.timestamp}</span>
        </div>
      ))}
    </div>
  );
}
