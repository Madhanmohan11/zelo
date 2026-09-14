import React from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from './Button'

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'You have no entries recorded yet.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/70 rounded-3xl border border-dashed border-slate-200 my-4 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
