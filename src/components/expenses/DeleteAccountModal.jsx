import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Trash2, AlertTriangle } from 'lucide-react'
import { formatINR } from '../../utils/formatters'

export const DeleteAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  account = null,
  isSubmitting = false
}) => {
  if (!account) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Account Request">
      <div className="space-y-4">
        {/* SECURITY ALERT BADGE BOX */}
        <div className="flex items-start gap-3 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold leading-relaxed">
            Permanently deleting this account will remove it from your balances and transaction filters. This action cannot be undone.
          </p>
        </div>

        {/* ACCOUNT SUMMARY CARD */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-black text-slate-900">
                {account.name}
              </h4>
              <p className="text-xs font-semibold text-slate-500 uppercase">{account.account_type} Account</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400">Current Balance</span>
              <div className="text-base font-black text-slate-900">
                {formatINR(account.current_balance)}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Close
          </Button>
          <Button
            type="button"
            variant="danger"
            icon={Trash2}
            onClick={onConfirm}
            isLoading={isSubmitting}
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
