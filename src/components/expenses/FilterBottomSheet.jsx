import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Calendar, Tag, CreditCard, Search, RotateCcw, Check, SlidersHorizontal } from 'lucide-react'

export const FilterBottomSheet = ({
  isOpen,
  onClose,
  timeFilter,
  setTimeFilter,
  customFromDate,
  setCustomFromDate,
  customToDate,
  setCustomToDate,
  categoryFilter,
  setCategoryFilter,
  accountFilter,
  setAccountFilter,
  searchQuery,
  setSearchQuery,
  accounts = [],
  onApply,
  onReset
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
    { value: 'Food', label: 'Food & Dining' },
    { value: 'Bills', label: 'Bills & Utilities' },
    { value: 'Transport', label: 'Transport & Travel' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Health', label: 'Health & Medical' },
    { value: 'Education', label: 'Education' },
    { value: 'Other', label: 'Other' }
  ]

  const handleApply = () => {
    onApply()
    onClose()
  }

  const handleReset = () => {
    onReset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Expenses">
      <div className="space-y-4">
        {/* TIME PERIOD FILTER PILLS */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Time Period
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            {[
              { id: 'today', label: 'Today', icon: Calendar },
              { id: 'month', label: 'Month', icon: Calendar },
              { id: 'year', label: 'Year', icon: Calendar },
              { id: 'custom', label: 'Custom', icon: Calendar }
            ].map((item) => {
              const isSelected = timeFilter === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTimeFilter(item.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5 mb-1" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* CUSTOM DATE RANGE (SHOWN ONLY WHEN CUSTOM IS SELECTED) */}
        {timeFilter === 'custom' && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Custom Date Range</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY DROPDOWN */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>Category</span>
          </label>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-slate-50 border-slate-200 text-xs font-semibold py-2.5 px-3"
            options={categoryOptions}
          />
        </div>

        {/* ACCOUNT DROPDOWN */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <span>Account</span>
          </label>
          <Select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="rounded-xl bg-slate-50 border-slate-200 text-xs font-semibold py-2.5 px-3"
            options={accountOptions}
          />
        </div>

        {/* SEARCH INPUT */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search Keywords</span>
          </label>
          <Input
            icon={Search}
            placeholder="Search description or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl bg-slate-50 border-slate-200 text-xs py-2.5"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-3 grid grid-cols-2 gap-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="w-full justify-center rounded-xl"
            icon={RotateCcw}
          >
            Reset
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleApply}
            className="w-full justify-center rounded-xl bg-emerald-800 hover:bg-emerald-900"
            icon={Check}
          >
            Apply Filter
          </Button>
        </div>
      </div>
    </Modal>
  )
}
