import React, { useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ChevronRight,
  Calendar,
  X
} from 'lucide-react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { EmptyState } from '../ui/EmptyState'
import { formatINR } from '../../utils/formatters'

export const SavingsActivity = ({
  transactions = [],
  accounts = [],
  onItemClick,
  selectedDate,
  onClearDateFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'income', 'expense', 'transfer'
  const [sortOrder, setSortOrder] = useState('latest') // 'latest', 'oldest', 'highest', 'lowest'

  const accountMap = new Map(accounts.map((a) => [a.id, a.name]))

  // Filter logic
  const filteredList = transactions.filter((item) => {
    // Selected calendar date filter
    if (selectedDate) {
      const itemDateStr = new Date(item.date).toISOString().split('T')[0]
      if (itemDateStr !== selectedDate) return false
    }

    // Type filter
    if (typeFilter !== 'all' && item.type !== typeFilter) return false

    // Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false

    // Account filter
    if (accountFilter !== 'all' && item.account_id !== accountFilter && item.to_account_id !== accountFilter) {
      return false
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const title = (item.title || '').toLowerCase()
      const cat = (item.category || '').toLowerCase()
      const acc = (item.accountName || '').toLowerCase()
      return title.includes(q) || cat.includes(q) || acc.includes(q)
    }

    return true
  })

  // Sort logic
  const sortedList = [...filteredList].sort((a, b) => {
    if (sortOrder === 'latest') return new Date(b.date) - new Date(a.date)
    if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date)
    if (sortOrder === 'highest') return Math.abs(b.amount) - Math.abs(a.amount)
    if (sortOrder === 'lowest') return Math.abs(a.amount) - Math.abs(b.amount)
    return 0
  })

  const formatActivityDate = (d) => {
    if (!d) return ''
    const dateObj = new Date(d)
    return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const accountOptions = [
    { value: 'all', label: 'All Accounts' },
    ...accounts.map((acc) => ({ value: acc.id, label: acc.name }))
  ]

  return (
    <div className="space-y-4" id="recent-activity-section">
      {/* SECTION HEADER WITH ACTIVE CALENDAR FILTER INDICATOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Recent Activity
          </h3>

          {selectedDate && (
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              {selectedDate}
              <button
                type="button"
                onClick={onClearDateFilter}
                className="ml-1 hover:text-emerald-950 text-emerald-700 cursor-pointer"
                title="Clear date filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="rounded-full text-xs font-semibold py-1.5 px-3 bg-white border-slate-200"
            options={[
              { value: 'latest', label: 'Latest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'highest', label: 'Highest Amount' },
              { value: 'lowest', label: 'Lowest Amount' }
            ]}
          />
        </div>
      </div>

      {/* SEARCH AND FILTERS ROW */}
      <div className="space-y-2">
        <Input
          icon={Search}
          placeholder="Search activity, category, or account..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-2xl bg-white border-slate-200/80 shadow-2xs text-xs sm:text-sm"
        />

        <div className="grid grid-cols-3 gap-2">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-2xl bg-white text-xs font-semibold border-slate-200/80 shadow-2xs py-2 px-3"
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'income', label: 'Income / Add' },
              { value: 'expense', label: 'Expense' },
              { value: 'transfer', label: 'Transfer' }
            ]}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl bg-white text-xs font-semibold border-slate-200/80 shadow-2xs py-2 px-3"
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Salary', label: 'Salary / Income' },
              { value: 'Food', label: 'Food' },
              { value: 'Shopping', label: 'Shopping' },
              { value: 'Travel', label: 'Travel' },
              { value: 'Bills', label: 'Bills' },
              { value: 'Transfer', label: 'Transfer' },
              { value: 'Other', label: 'Other' }
            ]}
          />

          <Select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="rounded-2xl bg-white text-xs font-semibold border-slate-200/80 shadow-2xs py-2 px-3"
            options={accountOptions}
          />
        </div>
      </div>

      {/* TRANSACTION ACTIVITY LIST */}
      {sortedList.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No recent activity"
          description={selectedDate ? `No transactions recorded on ${selectedDate}.` : 'Add money or log expenses to see your activity timeline.'}
        />
      ) : (
        <div className="space-y-2.5">
          {sortedList.map((item) => {
            const isIncome = item.type === 'income' || item.amount > 0
            const isTransfer = item.type === 'transfer'
            const isExpense = item.type === 'expense'

            let badgeBg = 'bg-emerald-50 text-emerald-600 border-emerald-100'
            let IconComp = TrendingUp
            let sign = '+'
            let amountTextColor = 'text-emerald-700'

            if (isExpense) {
              badgeBg = 'bg-rose-50 text-rose-600 border-rose-100'
              IconComp = TrendingDown
              sign = '-'
              amountTextColor = 'text-rose-600'
            } else if (isTransfer) {
              badgeBg = 'bg-blue-50 text-blue-600 border-blue-100'
              IconComp = ArrowLeftRight
              sign = item.amount >= 0 ? '+' : '-'
              amountTextColor = item.amount >= 0 ? 'text-emerald-700' : 'text-slate-800'
            }

            return (
              <div
                key={item.id}
                onClick={() => onItemClick && onItemClick(item)}
                className="bg-white border border-slate-200/80 hover:border-emerald-200 hover:shadow-xs transition-all rounded-2xl p-3.5 flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-3 rounded-2xl shrink-0 border ${badgeBg}`}>
                    <IconComp className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-slate-900 truncate leading-snug">
                      {item.title}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-slate-700">{item.subtitle}</span>
                      <span>•</span>
                      <span>{item.accountName || 'Account'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {formatActivityDate(item.date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="text-right">
                    <div className={`text-base sm:text-lg font-black tracking-tight ${amountTextColor}`}>
                      {sign}{formatINR(Math.abs(item.amount))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
