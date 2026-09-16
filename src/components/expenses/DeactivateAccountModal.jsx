import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Power, AlertCircle } from 'lucide-react'

export const DeactivateAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  account = null,
  isSubmitting = false
}) => {
  if (!account) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deactivate Account">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold leading-relaxed">
            Deactivating <strong className="text-amber-950">{account.name}</strong> will hide it from active payment selectors while safely preserving your historical spending logs.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            icon={Power}
            onClick={onConfirm}
            isLoading={isSubmitting}
          >
            Deactivate
          </Button>
        </div>
      </div>
    </Modal>
  )
}
