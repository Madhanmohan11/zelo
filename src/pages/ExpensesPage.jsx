import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IndianRupee, Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/dataService'
import {
  getAccounts,
  createAccount,
  updateAccount,
  deactivateAccount,
  addMoney,
  transferMoney
} from '../services/accountService'
import { formatINR } from '../utils/formatters'

// Sub-components
import { ExpenseTabs } from '../components/expenses/ExpenseTabs'
import { ExpenseSummary } from '../components/expenses/ExpenseSummary'
import { ExpenseFilters } from '../components/expenses/ExpenseFilters'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { ExpenseModal } from '../components/expenses/ExpenseModal'
import { AccountList } from '../components/expenses/AccountList'
import { AccountModal } from '../components/expenses/AccountModal'
import { AccountDetailModal } from '../components/expenses/AccountDetailModal'
import { AddMoneyModal } from '../components/expenses/AddMoneyModal'
import { TransferMoneyModal } from '../components/expenses/TransferMoneyModal'
import { MonthlyAnalysis } from '../components/expenses/MonthlyAnalysis'
import { YearlyAnalysis } from '../components/expenses/YearlyAnalysis'
import { DeleteExpenseModal } from '../components/expenses/DeleteExpenseModal'

export const ExpensesPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  // Determine active sub-tab from route
  const activeTab = location.pathname.includes('/savings') ? 'savings' : 'expenses'

  const handleTabChange = (tab) => {
    if (tab === 'savings') {
      navigate('/expenses/savings')
    } else {
      navigate('/expenses')
    }
  }

  // Data state
  const [expenses, setExpenses] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  // Expense filters & search
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'today', 'week', 'month'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState('all')

  // Analytics view mode
  const [analyticsMode, setAnalyticsMode] = useState('monthly') // 'monthly', 'yearly'

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)

  const [isAccountDetailModalOpen, setIsAccountDetailModalOpen] = useState(false)
  const [detailAccount, setDetailAccount] = useState(null)

  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false)
  const [addMoneyAccountId, setAddMoneyAccountId] = useState(null)

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferFromAccountId, setTransferFromAccountId] = useState(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingExpense, setDeletingExpense] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // -----------------------------------------------------------------------------
  // DATA FETCHING & SYNCHRONIZATION
  // -----------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [fetchedAccounts, fetchedExpenses] = await Promise.all([
        getAccounts(user.id),
        getExpenses(user.id)
      ])

      setAccounts(fetchedAccounts)
      setExpenses(fetchedExpenses)
    } catch (err) {
      console.error('Data load error:', err)
      showToast('Failed to load expense and account data', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    loadData()

    // Global listener for Quick Add modal updates
    const handleGlobalUpdate = () => loadData()
    window.addEventListener('zelo_data_updated', handleGlobalUpdate)
    return () => window.removeEventListener('zelo_data_updated', handleGlobalUpdate)
  }, [loadData])

  // -----------------------------------------------------------------------------
  // EXPENSE HANDLERS
  // -----------------------------------------------------------------------------
  const handleOpenAddExpense = () => {
    setEditingExpense(null)
    setIsExpenseModalOpen(true)
  }

  const handleOpenEditExpense = (exp) => {
    setEditingExpense(exp)
    setIsExpenseModalOpen(true)
  }

  const handleSaveExpense = async (expenseData) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      if (editingExpense) {
        await updateExpense(user.id, editingExpense.id, expenseData)
        showToast('Expense updated successfully', 'success')
      } else {
        await createExpense(user.id, expenseData)
        showToast(`Logged expense ${formatINR(expenseData.amount)}`, 'success')
      }
      setIsExpenseModalOpen(false)
      await loadData()
    } catch (err) {
      showToast(err.message || 'Failed to save expense', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDeleteExpense = (exp) => {
    setDeletingExpense(exp)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDeleteExpense = async () => {
    if (!user || !deletingExpense) return
    setIsSubmitting(true)
    try {
      await deleteExpense(user.id, deletingExpense.id)
      showToast('Expense deleted and account balance restored', 'info')
      setIsDeleteModalOpen(false)
      setDeletingExpense(null)
      await loadData()
    } catch (err) {
      showToast('Failed to delete expense', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // -----------------------------------------------------------------------------
  // ACCOUNT HANDLERS
  // -----------------------------------------------------------------------------
  const handleOpenAddAccount = () => {
    setEditingAccount(null)
    setIsAccountModalOpen(true)
  }

  const handleOpenEditAccount = (acc) => {
    setEditingAccount(acc)
    setIsAccountModalOpen(true)
  }

  const handleSaveAccount = async (accountData) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      if (editingAccount) {
        await updateAccount(user.id, editingAccount.id, accountData)
        showToast('Account updated', 'success')
      } else {
        await createAccount(user.id, accountData)
        showToast(`Created account "${accountData.name}"`, 'success')
      }
      setIsAccountModalOpen(false)
      await loadData()
    } catch (err) {
      showToast(err.message || 'Failed to save account', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeactivateAccount = async (accountId) => {
    if (!user) return
    try {
      await deactivateAccount(user.id, accountId)
      showToast('Account deactivated', 'info')
      await loadData()
    } catch (err) {
      showToast('Failed to deactivate account', 'error')
    }
  }

  const handleOpenAccountDetail = (acc) => {
    setDetailAccount(acc)
    setIsAccountDetailModalOpen(true)
  }

  // -----------------------------------------------------------------------------
  // ADD MONEY & TRANSFER HANDLERS
  // -----------------------------------------------------------------------------
  const activeAccounts = accounts.filter((a) => a.is_active !== false)

  const handleOpenAddMoney = (accId = null) => {
    if (activeAccounts.length === 0) {
      showToast('Please add an account first before adding money', 'info')
      handleOpenAddAccount()
      return
    }
    setAddMoneyAccountId(accId)
    setIsAddMoneyModalOpen(true)
  }

  const handleSaveAddMoney = async (moneyData) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      await addMoney(user.id, moneyData)
      showToast(`Added ${formatINR(moneyData.amount)} deposit`, 'success')
      setIsAddMoneyModalOpen(false)
      await loadData()
    } catch (err) {
      showToast(err.message || 'Failed to add money', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenTransfer = (fromAccId = null) => {
    if (activeAccounts.length < 2) {
      showToast('Add at least two accounts before transferring money', 'info')
      return
    }
    setTransferFromAccountId(fromAccId)
    setIsTransferModalOpen(true)
  }

  const handleSaveTransfer = async (transferData) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      await transferMoney(user.id, transferData)
      showToast(`Transferred ${formatINR(transferData.amount)} between accounts`, 'success')
      setIsTransferModalOpen(false)
      await loadData()
    } catch (err) {
      showToast(err.message || 'Failed to transfer money', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // -----------------------------------------------------------------------------
  // METRICS & FILTER CALCULATIONS
  // -----------------------------------------------------------------------------
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0]

  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const todayTotal = expenses
    .filter((e) => (e.spent_at || '').split('T')[0] === todayStr)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  const weekTotal = expenses
    .filter((e) => (e.spent_at || '').split('T')[0] >= startOfWeekStr)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  const monthTotal = expenses
    .filter((e) => (e.spent_at || '').split('T')[0] >= startOfMonthStr)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  const totalSpending = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  // Filtered expense list
  const filteredExpenses = expenses.filter((e) => {
    const expDate = (e.spent_at || '').split('T')[0]

    if (timeFilter === 'today' && expDate !== todayStr) return false
    if (timeFilter === 'week' && expDate < startOfWeekStr) return false
    if (timeFilter === 'month' && expDate < startOfMonthStr) return false

    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false
    if (accountFilter !== 'all' && e.account_id !== accountFilter) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const desc = (e.description || '').toLowerCase()
      const cat = (e.category || '').toLowerCase()
      const accName = (e.accounts?.name || e.payment_method || '').toLowerCase()
      return desc.includes(q) || cat.includes(q) || accName.includes(q)
    }

    return true
  })

  // Account object lookup for delete modal
  const accountMap = new Map(accounts.map((a) => [a.id, a]))

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-600" />
            <span>Expense Manager</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Track daily spending, categories, and monthly totals
          </p>
        </div>

        <div>
          {activeTab === 'expenses' ? (
            <Button onClick={handleOpenAddExpense} variant="primary" icon={Plus}>
              Add Expense
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => handleOpenAddMoney()} variant="primary" icon={Plus}>
                Add Money
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* SUB-TABS CONTROL: [ Expenses ] [ Savings ] */}
      <ExpenseTabs activeTab={activeTab} onChange={handleTabChange} />

      {/* -----------------------------------------------------------------------
          EXPENSES TAB VIEW
         ----------------------------------------------------------------------- */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* SUMMARY BAR */}
          <ExpenseSummary
            todayTotal={todayTotal}
            weekTotal={weekTotal}
            monthTotal={monthTotal}
            totalSpending={totalSpending}
          />

          {/* FILTERS BAR */}
          <ExpenseFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            accountFilter={accountFilter}
            onAccountFilterChange={setAccountFilter}
            accounts={accounts}
          />

          {/* EXPENSES LIST */}
          <ExpenseList
            expenses={filteredExpenses}
            accounts={accounts}
            loading={loading}
            onEdit={handleOpenEditExpense}
            onDelete={handleOpenDeleteExpense}
            onAddExpenseClick={handleOpenAddExpense}
          />

          {/* SPENDING ANALYTICS SECTION */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Spending Analytics
              </h2>

              {/* SEGMENTED TOGGLE: [ Monthly ] [ Yearly ] */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAnalyticsMode('monthly')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    analyticsMode === 'monthly'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsMode('yearly')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    analyticsMode === 'yearly'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {analyticsMode === 'monthly' ? (
              <MonthlyAnalysis expenses={expenses} accounts={accounts} />
            ) : (
              <YearlyAnalysis expenses={expenses} />
            )}
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          SAVINGS TAB VIEW
         ----------------------------------------------------------------------- */}
      {activeTab === 'savings' && (
        <AccountList
          accounts={accounts}
          loading={loading}
          onAccountClick={handleOpenAccountDetail}
          onAddAccountClick={handleOpenAddAccount}
          onAddMoneyClick={() => handleOpenAddMoney()}
          onTransferClick={() => handleOpenTransfer()}
        />
      )}

      {/* -----------------------------------------------------------------------
          MODALS & DIALOGS
         ----------------------------------------------------------------------- */}
      {/* EXPENSE MODAL */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        accounts={accounts}
        isSubmitting={isSubmitting}
      />

      {/* ACCOUNT MODAL */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
        editingAccount={editingAccount}
        isSubmitting={isSubmitting}
      />

      {/* ACCOUNT DETAIL MODAL */}
      <AccountDetailModal
        isOpen={isAccountDetailModalOpen}
        onClose={() => setIsAccountDetailModalOpen(false)}
        account={detailAccount}
        userId={user?.id}
        expenses={expenses}
        onEditAccount={handleOpenEditAccount}
        onAddMoney={(accId) => handleOpenAddMoney(accId)}
        onTransfer={(accId) => handleOpenTransfer(accId)}
        onDeactivateAccount={handleDeactivateAccount}
      />

      {/* ADD MONEY MODAL */}
      <AddMoneyModal
        isOpen={isAddMoneyModalOpen}
        onClose={() => setIsAddMoneyModalOpen(false)}
        onSave={handleSaveAddMoney}
        accounts={accounts}
        preselectedAccountId={addMoneyAccountId}
        isSubmitting={isSubmitting}
      />

      {/* TRANSFER MONEY MODAL */}
      <TransferMoneyModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSave={handleSaveTransfer}
        accounts={accounts}
        preselectedFromAccountId={transferFromAccountId}
        isSubmitting={isSubmitting}
      />

      {/* DELETE EXPENSE MODAL */}
      <DeleteExpenseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteExpense}
        expense={deletingExpense}
        account={deletingExpense ? accountMap.get(deletingExpense.account_id) : null}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
