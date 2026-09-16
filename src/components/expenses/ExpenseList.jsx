import React from 'react'
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
  Smartphone
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
  const accountMap = new Map((accounts || []).map((a) => [a.id, a]))

  const categories = ['all', 'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other']

  const filteredExpenses = categoryFilter === 'all'
    ? expenses
    : expenses.filter((e) => e.category === categoryFilter)

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

    const timeStr = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

    if (isToday) {
      return `Today, ${timeStr}`
    }

    const dateStr = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short' })
    return `${dateStr} • ${timeStr}`
  }

  return (
    <div className="space-y-2">
      {expenses.map((exp) => {
        const CategoryIcon = getCategoryIcon(exp.category)
        const account = exp.accounts || accountMap.get(exp.account_id)
        const accountName = account?.name || exp.payment_method || 'Cash'
        const AccountIcon = getAccountIcon(account?.account_type)

        return (
          <Card
            key={exp.id}
            className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 hover:border-emerald-200 hover:shadow-xs transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold shrink-0 border border-emerald-100">
                <CategoryIcon className="w-5 h-5" />
              </div>

              <div>
                <div className="text-sm font-bold text-slate-900 leading-snug">
                  {exp.description || exp.category}
                </div>
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span className="text-slate-700">{exp.category}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                    <AccountIcon className="w-3 h-3 text-slate-400" />
                    {accountName}
                  </span>
                  <span>•</span>
                  <span>{formatExpenseDate(exp.spent_at || exp.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-base sm:text-lg font-black text-emerald-800 tracking-tight">
                  {formatINR(exp.amount)}
                </div>
              </div>

              <div className="flex items-center gap-0.5">
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
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
