import React from 'react'

export const Badge = ({ children, status = 'default', className = '' }) => {
  const styles = {
    completed: 'bg-[#D1FAE5] text-emerald-800 font-bold',
    ready: 'bg-[#A7F3D0] text-emerald-900 font-bold',
    pending: 'bg-[#FDE68A]/70 text-amber-900 font-bold',
    waiting: 'bg-[#FDE68A]/70 text-amber-900 font-bold',
    planned: 'bg-[#E9D5FF]/70 text-purple-900 font-bold',
    in_progress: 'bg-indigo-100 text-indigo-800 font-bold animate-pulse',
    skipped: 'bg-slate-100 text-slate-600 font-bold',
    collected: 'bg-blue-100 text-blue-800 font-bold',
    returned: 'bg-purple-100 text-purple-800 font-bold',
    cancelled: 'bg-[#FECACA]/70 text-rose-900 font-bold',
    overdue: 'bg-[#FECACA] text-rose-950 font-black',
    default: 'bg-slate-100 text-slate-700 font-bold'
  }

  const normalizedStatus = (status || 'default').toLowerCase()
  const activeStyle = styles[normalizedStatus] || styles.default

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-wider ${activeStyle} ${className}`}
    >
      {children || status}
    </span>
  )
}
