import React from 'react';

export function StatCard({ title, value, change, icon: Icon, color = 'teal', subtext }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-50 text-teal-700 border border-slate-100">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {change && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            {change}
          </span>
        )}
      </div>

      {subtext && <p className="mt-2 text-xs text-slate-500 font-medium">{subtext}</p>}
    </div>
  );
}
