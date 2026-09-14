import React, { forwardRef } from 'react'

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9)

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full bg-white border rounded-2xl py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
            Icon ? 'pl-11 pr-4' : 'px-4'
          } ${
            error
              ? 'border-rose-400 focus:ring-rose-400/20'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-sm'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-500 font-semibold">{error}</span>}
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  )
})

Input.displayName = 'Input'
