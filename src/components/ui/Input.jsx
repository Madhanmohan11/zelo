import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type
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
          <div className="absolute left-3.5 text-slate-400 pointer-events-none z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={actualType}
          className={`w-full bg-white border rounded-2xl py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
            Icon ? 'pl-11' : 'px-4'
          } ${isPassword ? 'pr-11' : 'pr-4'} ${
            error
              ? 'border-rose-400 focus:ring-rose-400/20'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-sm'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg transition-colors cursor-pointer z-10"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-rose-500 font-semibold">{error}</span>}
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  )
})

Input.displayName = 'Input'
