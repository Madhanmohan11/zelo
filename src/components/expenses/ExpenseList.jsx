import React, { useState, useRef, useEffect } from 'react'
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Film,
  GraduationCap,
  CreditCard,
  Edit2,
  Trash2,
  IndianRupee,
  MoreVertical,
  Coffee,
  Bus,
  Zap,
  Tag
} from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { LoadingState } from '../ui/LoadingState'
import { formatINR } from '../../utils/formatters'

const getCategoryIcon = (category, description = '') => {
  const catLower = (category || '').toLowerCase()
  const descLower = (description || '').toLowerCase()

  if (descLower.includes('coffee') || descLower.includes('tea') || descLower.includes('chai')) {
    return Coffee
  }
  if (descLower.includes('bus') || descLower.includes('cab') || descLower.includes('uber') || descLower.includes('auto')) {
    return Bus
  }

  switch (catLower) {
    case 'food':
    case 'dining':
      return Utensils
    case 'transport':
    case 'travel':
      return Car
    case 'shopping':
    case 'grocery':
      return ShoppingBag
    case 'bills':
    case 'utilities':
      return Receipt
    case 'health':
    case 'medical':
      return HeartPulse
    case 'entertainment':
    case 'movie':
      return Film
    case 'education':
      return GraduationCap
    default:
      return CreditCard
  }
}

const getCategoryStyle = (category, description = '') => {
  const catLower = (category || '').toLowerCase()
  const descLower = (description || '').toLowerCase()

  if (descLower.includes('coffee') || descLower.includes('tea') || descLower.includes('chai')) {
    return 'bg-amber-100/80 text-amber-800 border-amber-200/60'
  }
  if (descLower.includes('bus') || descLower.includes('cab') || descLower.includes('uber')) {
    return 'bg-sky-100/80 text-sky-800 border-sky-200/60'
  }

  switch (catLower) {
    case 'food':
    case 'dining':
      return 'bg-emerald-100/80 text-emerald-800 border-emerald-200/60'
    case 'shopping':
    case 'grocery':
      return 'bg-pink-100/80 text-pink-800 border-pink-200/60'
    case 'transport':
    case 'travel':
      return 'bg-sky-100/80 text-sky-800 border-sky-200/60'
    case 'bills':
    case 'utilities':
      return 'bg-amber-100/80 text-amber-800 border-amber-200/60'
    case 'health':
    case 'medical':
      return 'bg-rose-100/80 text-rose-800 border-rose-200/60'
    case 'entertainment':
    case 'movie':
      return 'bg-purple-100/80 text-purple-800 border-purple-200/60'
    case 'education':
      return 'bg-indigo-100/80 text-indigo-800 border-indigo-200/60'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200/60'
  }
}

export const ExpenseList = ({
  expenses = [],
  accounts = [],
  loading = false,
  onAddExpenseClick,
  onEdit,
  onDelete,
  onClearFilters
}) => {
  const [activeMenuId, setActiveMenuId] = useState(null)
  const menuRef = useRef(null)

  // Close popup menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const accountMap = new Map((accounts || []).map((a) => [a.id, a]))

  if (loading) {
    return <LoadingState message="Fetching expenses history..." />
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <IndianRupee className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900">No expenses found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Try another date range or clear your filters to view transaction history.
          </p>
        </div>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            Clear Filters
          </button>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // GROUP TRANSACTIONS BY DATE (YYYY-MM-DD)
  // ---------------------------------------------------------------------------
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const yesterdayObj = new Date(now)
  yesterdayObj.setDate(now.getDate() - 1)
  const yesterdayStr = `${yesterdayObj.getFullYear()}-${String(yesterdayObj.getMonth() + 1).padStart(2, '0')}-${String(yesterdayObj.getDate()).padStart(2, '0')}`

  const groupsMap = new Map()

  expenses.forEach((exp) => {
    const rawDate = exp.spent_at || exp.created_at
    const dateObj = new Date(rawDate)
    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`

    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, {
        dateKey,
        dateObj,
        items: [],
        total: 0
      })
    }
    const grp = groupsMap.get(dateKey)
    grp.items.push(exp)
    grp.total += parseFloat(exp.amount) || 0
  })

  // Sort date groups descending
  const sortedGroupKeys = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a))

  const getDateGroupLabel = (dateKey, dateObj) => {
    if (dateKey === todayStr) {
      return `Today, ${dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    if (dateKey === yesterdayStr) {
      return `Yesterday, ${dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    return dateObj.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-4" ref={menuRef}>
      {sortedGroupKeys.map((dateKey) => {
        const group = groupsMap.get(dateKey)
        const dateLabel = getDateGroupLabel(dateKey, group.dateObj)

        return (
          <div key={dateKey} className="space-y-1.5">
            {/* DATE GROUP HEADER WITH SECTION TOTAL */}
            <div className="flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>{dateLabel}</span>
              <span className="font-extrabold text-slate-700">{formatINR(group.total)}</span>
            </div>

            {/* COMPACT TRANSACTION ROWS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100/90 overflow-hidden shadow-2xs">
              {group.items.map((exp) => {
                const CategoryIcon = getCategoryIcon(exp.category, exp.description)
                const categoryStyle = getCategoryStyle(exp.category, exp.description)
                const account = exp.accounts || accountMap.get(exp.account_id)
                const accountName = account?.name || exp.payment_method || 'Cash'

                const timeObj = new Date(exp.spent_at || exp.created_at)
                const timeStr = timeObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

                const isMenuOpen = activeMenuId === exp.id

                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 sm:p-3.5 hover:bg-slate-50/80 transition-colors relative group"
                  >
                    {/* LEFT SIDE: ICON + TITLE + METADATA */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shrink-0 ${categoryStyle}`}>
                        <CategoryIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug">
                          {exp.description || exp.category}
                        </div>

                        <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <span className="text-slate-700 font-bold truncate max-w-[120px] sm:max-w-[180px]">
                            {accountName}
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">{exp.category}</span>
                          <span>•</span>
                          <span className="text-slate-400">{timeStr}</span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE: AMOUNT + THREE-DOT MENU */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-black text-rose-600 tracking-tight">
                          -{formatINR(exp.amount)}
                        </div>
                      </div>

                      {/* THREE-DOT ACTION MENU BUTTON */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuId(isMenuOpen ? null : exp.id)
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Actions"
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* POPUP DROPDOWN MENU */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-8 z-30 w-36 bg-white rounded-2xl shadow-lg border border-slate-200 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null)
                                onEdit(exp)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null)
                                onDelete(exp)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
