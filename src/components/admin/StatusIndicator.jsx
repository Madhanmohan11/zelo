import React from 'react';

export function StatusIndicator({ status, label }) {
  const isOperational = status === 'Operational';

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
      <span className={`relative flex h-2 w-2`}>
        {isOperational && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOperational ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        ></span>
      </span>
      <span>{label || status}</span>
    </div>
  );
}
