import React from 'react'
import { Loader2 } from 'lucide-react'

export const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
      <span className="text-sm font-semibold">{message}</span>
    </div>
  )
}
