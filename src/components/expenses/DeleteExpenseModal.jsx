import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Trash2, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { formatINR } from '../../utils/formatters'

export const DeleteExpenseModal = ({
  isOpen,
  onClose,
  onConfirm,
  expense = null,
  account = null,
  isSubmitting = false
}) => {
  if (!expense) return null

  const accountName = account?.name || expense.accounts?.name || expense.payment_method || 'Account'
  const restoredBalance = account ? (account.current_balance || 0) + (parseFloat(expense.amount) || 0) : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Expense Confirmation">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-semibold">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
        </div>

        {/* EXPENSE SUMMARY */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                {expense.description || expense.category}
              </h4>
              <p className="text-xs text-slate-500 font-medium">{expense.category}</p>
            </div>
            <div className="text-lg font-black text-rose-600">
              {formatINR(expense.amount)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-xs flex justify-between text-slate-600 font-medium">
            <span>Payment Source: <strong className="text-slate-900">{accountName}</strong></span>
            <span>{new Date(expense.spent_at || expense.created_at).toLocaleDateString()}</span>
          </div>

          {restoredBalance !== null && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center justify-between text-emerald-900 font-semibold">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                {accountName} balance restored to:
              </span>
              <span className="font-extrabold text-emerald-800">{formatINR(restoredBalance)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            icon={Trash2}
            onClick={onConfirm}
            isLoading={isSubmitting}
          >
            Delete Expense
          </Button>
        </div>
      </div>
    </Modal>
  )
}
