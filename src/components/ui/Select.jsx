import React from 'react'

export const Select = ({
  label,
  error,
  options = [],
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 9)

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-white border rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 transition-all shadow-sm ${
          error
            ? 'border-rose-400 focus:ring-rose-400/20'
            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-500 font-semibold">{error}</span>}
    </div>
  )
}
