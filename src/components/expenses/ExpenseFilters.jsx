import React from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export const ExpenseFilters = ({
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  accountFilter,
  onAccountFilterChange,
  accounts = [],
  onToggleFilters
}) => {
  const accountOptions = [
    { value: 'all', label: 'All Accounts' },
    ...accounts.map((acc) => ({
      value: acc.id,
      label: acc.name
    }))
  ]

  return (
    <div className="space-y-3">
      {/* SEARCH BAR WITH FILTER ICON BUTTON */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search description, category, or account..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-2xl bg-white border-slate-200/80 shadow-2xs text-xs sm:text-sm placeholder:text-slate-400 focus:border-emerald-500"
          />
        </div>

        <button
          type="button"
          onClick={onToggleFilters}
          title="Filter options"
          aria-label="Filter options"
          className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 shadow-2xs transition-all active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* FILTER DROPDOWNS ROW */}
      <div className="grid grid-cols-3 gap-2">
        <Select
          value={timeFilter}
          onChange={(e) => onTimeFilterChange(e.target.value)}
          className="rounded-2xl bg-white text-xs font-semibold border-slate-200/80 shadow-2xs py-2 px-3"
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' }
          ]}
        />

        <Select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="rounded-2xl bg-white text-xs font-semibold border-slate-200/80 shadow-2xs py-2 px-3"
          options={[
            { value: 'all', label: 'All Categories' },
            { value: 'Food', label: 'Food' },
            { value: 'Travel', label: 'Travel' },
            { value: 'Shopping', label: 'Shopping' },
            { value: 'Bills', label: 'Bills' },
            { value: 'Health', label: 'Health' },
            { value: 'Entertainment', label: 'Entertainment' },
            { value: 'Education', label: 'Education' },
            { value: 'Other', label: 'Other' }
          ]}
        />

        <Select
          value={accountFilter}
          onChange={(e) => onAccountFilterChange(e.target.value)}
          className="rounded-2xl bg-white text-xs font-semibold border-slate-200/80 shadow-2xs py-2 px-3"
          options={accountOptions}
        />
      </div>
    </div>
  )
}
