import React, { useState } from 'react'
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
  Wallet,
  Building2,
  Smartphone,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { LoadingState } from '../ui/LoadingState'
import { formatINR } from '../../utils/formatters'

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Food':
      return Utensils
    case 'Transport':
    case 'Travel':
      return Car
    case 'Shopping':
      return ShoppingBag
    case 'Bills':
      return Receipt
    case 'Health':
      return HeartPulse
    case 'Entertainment':
      return Film
    case 'Education':
      return GraduationCap
    default:
      return CreditCard
  }
}

const getCategoryColor = (category) => {
  switch (category) {
    case 'Food':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    case 'Shopping':
      return 'bg-pink-50 text-pink-600 border-pink-100'
    case 'Transport':
    case 'Travel':
      return 'bg-sky-50 text-sky-600 border-sky-100'
    case 'Bills':
      return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'Health':
      return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'Entertainment':
      return 'bg-purple-50 text-purple-600 border-purple-100'
    case 'Education':
      return 'bg-indigo-50 text-indigo-600 border-indigo-100'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const getAccountIcon = (accountType) => {
  switch (accountType) {
    case 'cash':
      return Wallet
    case 'bank':
      return Building2
    case 'upi':
      return Smartphone
    default:
      return CreditCard
  }
}

export const ExpenseList = ({
  expenses = [],
  accounts = [],
  loading = false,
  onAddExpenseClick,
  onEdit,
  onDelete,
  onEditExpense,
  onDeleteExpense,
  categoryFilter = 'all',
  onCategoryFilterChange
}) => {
  const [sortOrder, setSortOrder] = useState('desc')
  const accountMap = new Map((accounts || []).map((a) => [a.id, a]))

  if (loading) {
    return <LoadingState message="Fetching expenses history..." />
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={IndianRupee}
        title="No expenses logged"
        description="Add your first expense to start tracking your daily spending and account balances."
        actionLabel="Log Expense"
        onAction={onAddExpenseClick}
      />
    )
  }

  const formatExpenseDate = (spentAt) => {
    if (!spentAt) return ''
    const dateObj = new Date(spentAt)
    const today = new Date()

    const isToday =
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const isYesterday =
      dateObj.getDate() === yesterday.getDate() &&
      dateObj.getMonth() === yesterday.getMonth() &&
      dateObj.getFullYear() === yesterday.getFullYear()

    const timeStr = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

    if (isToday) {
      return `Today, ${timeStr}`
    }
    if (isYesterday) {
      return `Yesterday, ${timeStr}`
    }

    const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    return `${dateStr}`
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    const timeA = new Date(a.spent_at || a.created_at).getTime()
    const timeB = new Date(b.spent_at || b.created_at).getTime()
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
  })

  return (
    <div className="space-y-3">
      {/* SECTION HEADER & SORT TOGGLE */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
          Recent Expenses
        </h3>

        <button
          type="button"
          onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-xl transition-all cursor-pointer border border-slate-200/50"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <span>{sortOrder === 'desc' ? 'Latest first' : 'Oldest first'}</span>
        </button>
      </div>

      {/* TRANSACTION ITEMS */}
      <div className="space-y-2.5">
        {sortedExpenses.map((exp) => {
          const CategoryIcon = getCategoryIcon(exp.category)
          const categoryColor = getCategoryColor(exp.category)
          const account = exp.accounts || accountMap.get(exp.account_id)
          const accountName = account?.name || exp.payment_method || 'Cash'
          const AccountIcon = getAccountIcon(account?.account_type)

          return (
            <Card
              key={exp.id}
              className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 hover:border-emerald-200 hover:shadow-xs transition-all rounded-2xl group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-3 rounded-2xl shrink-0 border ${categoryColor}`}>
                  <CategoryIcon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate leading-snug">
                    {exp.description || exp.category}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-slate-700">{accountName}</span>
                    <span>•</span>
                    <span className="text-slate-600">{exp.category}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {formatExpenseDate(exp.spent_at || exp.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                <div className="text-right">
                  <div className="text-base sm:text-lg font-black text-emerald-700 tracking-tight">
                    {formatINR(exp.amount)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => (onEdit || onEditExpense)?.(exp)}
                    title="Edit expense"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => (onDelete || onDeleteExpense)?.(exp)}
                    title="Delete expense"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors hidden sm:block" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
