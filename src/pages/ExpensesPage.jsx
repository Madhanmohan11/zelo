import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IndianRupee, Plus, SlidersHorizontal, BarChart3, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/dataService'
import {
  getAccounts,
  createAccount,
  updateAccount,
  deactivateAccount,
  deleteAccount,
  addMoney,
  transferMoney,
  ensureDefaultCashAccount
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
import { DeleteAccountModal } from '../components/expenses/DeleteAccountModal'
import { DeactivateAccountModal } from '../components/expenses/DeactivateAccountModal'
import { AddCashAccountModal } from '../components/expenses/AddCashAccountModal'

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

  const [isAddCashAccountModalOpen, setIsAddCashAccountModalOpen] = useState(false)

  const [isAccountDetailModalOpen, setIsAccountDetailModalOpen] = useState(false)
  const [detailAccount, setDetailAccount] = useState(null)

  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false)
  const [addMoneyAccountId, setAddMoneyAccountId] = useState(null)

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferFromAccountId, setTransferFromAccountId] = useState(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingExpense, setDeletingExpense] = useState(null)

  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(null)

  const [isDeactivateAccountModalOpen, setIsDeactivateAccountModalOpen] = useState(false)
  const [deactivatingAccount, setDeactivatingAccount] = useState(null)

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

  const handleOpenAddCashAccount = () => {
    setIsAddCashAccountModalOpen(true)
  }

  const handleSaveCashAccount = async (cashAccountData) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      const createdAcc = await createAccount(user.id, cashAccountData)
      showToast(`Created cash account "${cashAccountData.name}"`, 'success')
      setIsAddCashAccountModalOpen(false)
      await loadData()
      if (createdAcc?.id) {
        setAddMoneyAccountId(createdAcc.id)
      }
    } catch (err) {
      showToast(err.message || 'Failed to create cash account', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEnsureCashAccount = async () => {
    if (!user) return null
    try {
      const acc = await ensureDefaultCashAccount(user.id, accounts)
      await loadData()
      return acc
    } catch (err) {
      console.error('Error in handleEnsureCashAccount:', err)
      return null
    }
  }

  const handleOpenDeactivateAccountModal = (acc) => {
    setDeactivatingAccount(acc)
    setIsDeactivateAccountModalOpen(true)
  }

  const handleConfirmDeactivateAccount = async () => {
    if (!user || !deactivatingAccount) return
    setIsSubmitting(true)
    try {
      await deactivateAccount(user.id, deactivatingAccount.id)
      showToast(`Account "${deactivatingAccount.name}" deactivated`, 'info')
      setIsDeactivateAccountModalOpen(false)
      setDeactivatingAccount(null)
      await loadData()
    } catch (err) {
      showToast('Failed to deactivate account', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDeleteAccountModal = (acc) => {
    setDeletingAccount(acc)
    setIsDeleteAccountModalOpen(true)
  }

  const handleConfirmDeleteAccount = async () => {
    if (!user || !deletingAccount) return
    setIsSubmitting(true)
    try {
      await deleteAccount(user.id, deletingAccount.id)
      showToast(`Account "${deletingAccount.name}" permanently deleted`, 'info')
      setIsDeleteAccountModalOpen(false)
      setDeletingAccount(null)
      await loadData()
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error')
    } finally {
      setIsSubmitting(false)
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

  const todayExpenses = expenses.filter((e) => (e.spent_at || '').split('T')[0] === todayStr)
  const todayTotal = todayExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const todayCount = todayExpenses.length

  const weekExpenses = expenses.filter((e) => (e.spent_at || '').split('T')[0] >= startOfWeekStr)
  const weekTotal = weekExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const weekCount = weekExpenses.length

  const monthExpenses = expenses.filter((e) => (e.spent_at || '').split('T')[0] >= startOfMonthStr)
  const monthTotal = monthExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const monthCount = monthExpenses.length

  const totalSpending = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const totalCount = expenses.length

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
    <div className="space-y-6 pb-24 sm:pb-28">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100/80 shadow-2xs mt-0.5 shrink-0">
            {activeTab === 'savings' ? (
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <IndianRupee className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {activeTab === 'savings' ? 'Savings' : 'Expense Manager'}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {activeTab === 'savings'
                ? 'Track your income, spending and grow your savings'
                : 'Track daily spending, categories, and monthly totals'}
            </p>
          </div>
        </div>

        <div className="hidden sm:block">
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
          {/* SUMMARY CARDS */}
          <ExpenseSummary
            todayTotal={todayTotal}
            todayCount={todayCount}
            weekTotal={weekTotal}
            weekCount={weekCount}
            monthTotal={monthTotal}
            monthCount={monthCount}
            totalSpending={totalSpending}
            totalCount={totalCount}
          />

          {/* FILTERS BAR */}
          <div id="expense-filters-section">
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
              onToggleFilters={() => {
                const searchEl = document.querySelector('input[placeholder*="Search"]')
                if (searchEl) searchEl.focus()
              }}
            />
          </div>

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
          <div id="expense-analytics-section" className="pt-6 border-t border-slate-200">
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
          expenses={expenses}
          loading={loading}
          userId={user?.id}
          onAccountClick={handleOpenAccountDetail}
          onAddAccountClick={handleOpenAddAccount}
          onAddMoneyClick={() => handleOpenAddMoney()}
          onTransferClick={() => handleOpenTransfer()}
          onOpenEditExpense={handleOpenEditExpense}
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
        onAddCashAccount={handleOpenAddCashAccount}
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

      {/* ADD CASH ACCOUNT MODAL */}
      <AddCashAccountModal
        isOpen={isAddCashAccountModalOpen}
        onClose={() => setIsAddCashAccountModalOpen(false)}
        onSave={handleSaveCashAccount}
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
        onDeactivateAccount={handleOpenDeactivateAccountModal}
        onDeleteAccount={handleOpenDeleteAccountModal}
      />

      {/* ADD MONEY MODAL */}
      <AddMoneyModal
        isOpen={isAddMoneyModalOpen}
        onClose={() => setIsAddMoneyModalOpen(false)}
        onSave={handleSaveAddMoney}
        accounts={accounts}
        preselectedAccountId={addMoneyAccountId}
        onAddCashAccount={handleOpenAddCashAccount}
        onEnsureCashAccount={handleEnsureCashAccount}
        userId={user?.id}
        isSubmitting={isSubmitting}
      />

      {/* TRANSFER MONEY MODAL */}
      <TransferMoneyModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSave={handleSaveTransfer}
        accounts={accounts}
        preselectedFromAccountId={transferFromAccountId}
        onAddCashAccount={handleOpenAddCashAccount}
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

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirm={handleConfirmDeleteAccount}
        account={deletingAccount}
        isSubmitting={isSubmitting}
      />

      {/* DEACTIVATE ACCOUNT CONFIRMATION MODAL */}
      <DeactivateAccountModal
        isOpen={isDeactivateAccountModalOpen}
        onClose={() => setIsDeactivateAccountModalOpen(false)}
        onConfirm={handleConfirmDeactivateAccount}
        account={deactivatingAccount}
        isSubmitting={isSubmitting}
      />

      {/* STICKY BOTTOM ACTION BAR (DEDICATED FOR EXPENSE & SAVINGS PAGE) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/90 py-2 px-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2 px-2">
          {/* 1. FILTER BUTTON */}
          <button
            type="button"
            onClick={() => {
              const filterEl = document.getElementById(activeTab === 'savings' ? 'recent-activity-section' : 'expense-filters-section')
              if (filterEl) filterEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs shadow-2xs border border-slate-200/90 transition-all active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
            <span>Filter</span>
          </button>

          {/* 2. PROMINENT CENTER BUTTON (+ Add Money on Savings, + Add Expense on Expenses) */}
          <button
            type="button"
            onClick={activeTab === 'savings' ? () => handleOpenAddMoney() : handleOpenAddExpense}
            className="flex-[1.4] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>{activeTab === 'savings' ? 'Add Money' : 'Add Expense'}</span>
          </button>

          {/* 3. SUMMARY BUTTON */}
          <button
            type="button"
            onClick={() => {
              const summaryEl = document.getElementById(activeTab === 'savings' ? 'savings-analytics-section' : 'expense-analytics-section')
              if (summaryEl) summaryEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs shadow-2xs border border-slate-200/90 transition-all active:scale-95 cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-700" />
            <span>Summary</span>
          </button>
        </div>
      </div>
    </div>
  )
}

