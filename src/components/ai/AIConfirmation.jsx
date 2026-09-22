import React, { useState, useEffect } from 'react'
import { Check, X, IndianRupee, CheckSquare, Bookmark, Utensils, Dumbbell, CreditCard, Building2, Wallet } from 'lucide-react'
import { formatINR } from '../../utils/formatters'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { getAccounts } from '../../services/accountService'

export const AIConfirmation = ({ pendingAction, onConfirm, onCancel, isLoading }) => {
  const { user } = useAuth()
  const [userAccounts, setUserAccounts] = useState([])
  const [selectedAccountId, setSelectedAccountId] = useState('')

  useEffect(() => {
    if (user && pendingAction?.intent === 'ADD_EXPENSE') {
      getAccounts(user.id)
        .then((accs) => {
          const active = accs.filter((a) => a.is_active !== false)
          setUserAccounts(active)
          const initialAcc = pendingAction.data?.account_id
          if (initialAcc && active.some((a) => a.id === initialAcc)) {
            setSelectedAccountId(initialAcc)
          } else if (active.length > 0) {
            setSelectedAccountId(active[0].id)
          }
        })
        .catch((err) => console.error('Failed to load accounts for AI confirmation:', err))
    }
  }, [user, pendingAction])

  if (!pendingAction) return null

  const { intent, data } = pendingAction
  const selectedAccount = userAccounts.find((a) => a.id === selectedAccountId)

  const handleConfirm = () => {
    if (intent === 'ADD_EXPENSE') {
      onConfirm(intent, {
        ...data,
        account_id: selectedAccountId || (userAccounts[0]?.id || null)
      })
    } else {
      onConfirm(intent, data)
    }
  }

  return (
    <div className="p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 border-2 border-emerald-300 rounded-3xl space-y-3.5 shadow-md animate-in zoom-in-95 my-2">
      <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          {intent === 'ADD_EXPENSE' && (
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
              <IndianRupee className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
          {intent === 'CREATE_TASK' && (
            <div className="p-2 bg-blue-500 text-white rounded-xl shadow-xs">
              <CheckSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
          {intent === 'CREATE_REMINDER' && (
            <div className="p-2 bg-purple-500 text-white rounded-xl shadow-xs">
              <Bookmark className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
          {intent === 'LOG_MEAL' && (
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <Utensils className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
          {intent === 'LOG_WORKOUT' && (
            <div className="p-2 bg-rose-500 text-white rounded-xl shadow-xs">
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
              {intent === 'ADD_EXPENSE' && 'Confirm Expense Entry'}
              {intent === 'CREATE_TASK' && 'Confirm Task Creation'}
              {intent === 'CREATE_REMINDER' && 'Confirm Reminder Entry'}
              {intent === 'LOG_MEAL' && 'Confirm Meal Log'}
              {intent === 'LOG_WORKOUT' && 'Confirm Workout Log'}
            </h4>
            <p className="text-[10px] font-bold text-emerald-700">Please review parameters below</p>
          </div>
        </div>

        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
          Action Pending
        </span>
      </div>

      {/* PARAMETERS DETAILS PREVIEW */}
      <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
        {intent === 'ADD_EXPENSE' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Amount:</span>
              <span className="text-lg font-black text-slate-900">{formatINR(data.amount)}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-bold">Category:</span>
              <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {data.category || 'Food'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-bold">Description:</span>
              <span className="font-bold text-slate-800">{data.description || 'Expense'}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-bold">Date:</span>
              <span className="font-bold text-slate-700">{data.spent_at || 'Today'}</span>
            </div>

            {/* ACCOUNT SELECTION DROPDOWN (BANK OR CASH) */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-extrabold">Deduct From Account:</span>
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase">
                  {selectedAccount ? (selectedAccount.account_type === 'cash' ? '💵 Cash' : '🏦 Bank') : ''}
                </span>
              </div>

              {userAccounts.length > 0 ? (
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {userAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_type === 'cash' ? '💵 Cash: ' : '🏦 Bank: '}
                      {acc.name || acc.bank_name || acc.nickname} ({formatINR(acc.current_balance)})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-[11px] text-slate-500 font-medium italic">
                  Default cash wallet will be used.
                </p>
              )}
            </div>
          </>
        )}

        {intent === 'CREATE_TASK' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Task Title:</span>
              <span className="font-black text-slate-900">{data.title}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-bold">Priority:</span>
              <span className="font-extrabold capitalize text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                {data.priority || 'normal'}
              </span>
            </div>
            {data.due_date && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-bold">Due Date:</span>
                <span className="font-bold text-slate-700">{data.due_date}</span>
              </div>
            )}
          </>
        )}

        {intent === 'CREATE_REMINDER' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">What to Remember:</span>
              <span className="font-black text-slate-900">{data.title}</span>
            </div>
            {data.location && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-bold">Location/Person:</span>
                <span className="font-bold text-slate-800">{data.location}</span>
              </div>
            )}
            {data.expected_date && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-bold">Expected Date:</span>
                <span className="font-bold text-slate-700">{data.expected_date}</span>
              </div>
            )}
          </>
        )}

        {intent === 'LOG_MEAL' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Meal Title:</span>
              <span className="font-black text-slate-900">{data.title}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-bold">Meal Type:</span>
              <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 capitalize">
                {data.meal_type || 'lunch'}
              </span>
            </div>
          </>
        )}

        {intent === 'LOG_WORKOUT' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Workout Title:</span>
              <span className="font-black text-slate-900">{data.title}</span>
            </div>
          </>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-2xl text-xs font-bold border-slate-300 hover:bg-slate-100"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          isLoading={isLoading}
          className="flex-1 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25"
        >
          Confirm Action
        </Button>
      </div>
    </div>
  )
}
