import React from 'react'
import { Search, SlidersHorizontal, Calendar, X, Filter, Plus } from 'lucide-react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export const ExpenseFilters = ({
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  customFromDate,
  onCustomFromDateChange,
  customToDate,
  onCustomToDateChange,
  categoryFilter,
  onCategoryFilterChange,
  accountFilter,
  onAccountFilterChange,
  accounts = [],
  onOpenFilterSheet,
  onClearFilters,
  onAddExpenseClick
}) => {
  const accountOptions = [
    { value: 'all', label: 'All Accounts' },
    ...accounts.map((acc) => ({
      value: acc.id,
      label: acc.name
    }))
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Food', label: 'Food' },
    { value: 'Bills', label: 'Bills' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Health', label: 'Health' },
    { value: 'Education', label: 'Education' },
    { value: 'Other', label: 'Other' }
  ]

  const hasActiveFilters =
    timeFilter !== 'month' ||
    categoryFilter !== 'all' ||
    accountFilter !== 'all' ||
    searchQuery.trim() !== ''

  return (
    <div className="space-y-2.5">
      {/* 0. ADD EXPENSE HEADER ROW */}
      {onAddExpenseClick && (
        <div className="flex items-center justify-between gap-2 pt-0.5 pb-0.5">
          <span className="text-xs font-extrabold text-slate-700 tracking-tight">
            Transaction History
          </span>
          <button
            type="button"
            onClick={onAddExpenseClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      )}

      {/* 1. SEARCH BAR */}
      <div>
        <Input
          icon={Search}
          placeholder="Search expenses..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-2xl bg-white border-slate-200/80 shadow-2xs text-xs sm:text-sm placeholder:text-slate-400 focus:border-emerald-500"
        />
      </div>

      {/* 2. TIME PERIOD PILLS: [ Today ] [ Month ] [ Year ] [ Custom ] */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'today', label: 'Today' },
          { id: 'month', label: 'Month' },
          { id: 'year', label: 'Year' },
          { id: 'custom', label: 'Custom' }
        ].map((item) => {
          const isSelected = timeFilter === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTimeFilterChange(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {item.label}
            </button>
          )
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer whitespace-nowrap ml-auto"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 3. INLINE CUSTOM DATE RANGE INPUTS (IF CUSTOM IS ACTIVE) */}
      {timeFilter === 'custom' && (
        <div className="p-3 bg-white border border-slate-200/90 rounded-2xl space-y-2 text-xs shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Custom Date Range</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 mb-0.5 uppercase">From Date</span>
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => onCustomFromDateChange(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-400 mb-0.5 uppercase">To Date</span>
              <input
                type="date"
                value={customToDate}
                onChange={(e) => onCustomToDateChange(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. CATEGORY & ACCOUNT DROPDOWNS ROW */}
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="rounded-2xl bg-white text-xs font-semibold border-slate-200/80 shadow-2xs py-2 px-3"
          options={categoryOptions}
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
