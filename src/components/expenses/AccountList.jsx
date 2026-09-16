import React, { useState, useEffect, useMemo } from 'react'
import { Plus, ArrowLeftRight, Wallet, Shield, Building2, Smartphone, CreditCard, ChevronRight } from 'lucide-react'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { LoadingState } from '../ui/LoadingState'
import { formatINR } from '../../utils/formatters'
import { getMoneyTransactions } from '../../services/accountService'
import { SavingsCalendar } from './SavingsCalendar'
import { SavingsAnalytics } from './SavingsAnalytics'
import { SavingsActivity } from './SavingsActivity'

export const AccountList = ({
  accounts = [],
  expenses = [],
  loading = false,
  userId,
  onAccountClick,
  onAddAccountClick,
  onAddMoneyClick,
  onTransferClick,
  onOpenEditExpense
}) => {
  const [moneyTx, setMoneyTx] = useState([])
  const [loadingTx, setLoadingTx] = useState(false)

  // Period filter state
  const [periodMode, setPeriodMode] = useState('monthly') // 'monthly' | 'yearly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()) // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Calendar selected date filter
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null) // 'YYYY-MM-DD' | null

  // Fetch money transactions (Income deposits & Transfers)
  useEffect(() => {
    if (!userId) return
    let mounted = true
    setLoadingTx(true)

    getMoneyTransactions(userId)
      .then((txs) => {
        if (mounted) setMoneyTx(txs || [])
      })
      .catch((err) => {
        console.warn('Failed to load money transactions:', err)
        if (mounted) setMoneyTx([])
      })
      .finally(() => {
        if (mounted) setLoadingTx(false)
      })

    return () => {
      mounted = false
    }
  }, [userId])

  const activeAccounts = accounts.filter((a) => a.is_active !== false)
  const totalBalance = activeAccounts.reduce(
    (sum, acc) => sum + (parseFloat(acc.current_balance) || 0),
    0
  )
  const hasAccounts = activeAccounts.length > 0

  // Combine all activity items into a unified timeline
  const combinedTransactions = useMemo(() => {
    const expenseItems = expenses.map((e) => ({
      id: e.id,
      type: 'expense',
      title: e.description || e.category,
      category: e.category,
      subtitle: `${e.category} • ${e.payment_method || 'Expense'}`,
      account_id: e.account_id,
      accountName: e.accounts?.name || e.payment_method || 'Cash',
      amount: -parseFloat(e.amount || 0),
      date: e.spent_at || e.created_at,
      raw: e
    }))

    const moneyItems = moneyTx.map((tx) => {
      const isIncome = tx.transaction_type === 'income'
      const isTransfer = tx.transaction_type === 'transfer'

      let amountVal = parseFloat(tx.amount || 0)
      if (isExpense(tx.transaction_type)) amountVal = -amountVal

      let titleVal = tx.description || (isIncome ? 'Deposit' : 'Transfer')
      let subtitleVal = tx.category || (isIncome ? 'Income' : 'Money Transfer')

      const accObj = accounts.find((a) => a.id === tx.account_id)
      const toAccObj = accounts.find((a) => a.id === tx.to_account_id)

      let accName = accObj?.name || 'Account'
      if (isTransfer && toAccObj) {
        accName = `${accObj?.name || 'From'} → ${toAccObj.name}`
      }

      return {
        id: tx.id,
        type: tx.transaction_type,
        title: titleVal,
        category: tx.category || (isIncome ? 'Salary' : 'Transfer'),
        subtitle: subtitleVal,
        account_id: tx.account_id,
        to_account_id: tx.to_account_id,
        accountName: accName,
        amount: isIncome ? amountVal : -amountVal,
        date: tx.transaction_date || tx.created_at,
        raw: tx
      }
    })

    return [...expenseItems, ...moneyItems].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )
  }, [expenses, moneyTx, accounts])

  function isExpense(type) {
    return type === 'expense'
  }

  // Calculate financial metrics for the selected period
  const financialMetrics = useMemo(() => {
    let periodTx = combinedTransactions

    if (periodMode === 'monthly') {
      periodTx = combinedTransactions.filter((item) => {
        const d = new Date(item.date)
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
      })
    } else {
      periodTx = combinedTransactions.filter((item) => {
        const d = new Date(item.date).getFullYear()
        return d === selectedYear
      })
    }

    let totalIncome = 0
    let totalExpenses = 0
    let transfersIn = 0
    let transfersOut = 0

    periodTx.forEach((item) => {
      const amt = Math.abs(item.amount)
      if (item.type === 'income') {
        totalIncome += amt
      } else if (item.type === 'expense') {
        totalExpenses += amt
      } else if (item.type === 'transfer') {
        transfersOut += amt
      }
    })

    const netSavings = Math.max(0, totalIncome - totalExpenses)
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0

    const openingBalance = totalBalance - (totalIncome - totalExpenses)
    const closingBalance = totalBalance

    return {
      openingBalance: Math.max(0, openingBalance),
      totalIncome,
      totalExpenses,
      transfersIn,
      transfersOut,
      closingBalance,
      netSavings,
      savingsRate,
      transactionCount: periodTx.length,
      incomePct: 12,
      expensePct: 8,
      savingsPct: 20
    }
  }, [combinedTransactions, periodMode, selectedMonth, selectedYear, totalBalance])

  // Calculate transaction dots for calendar view
  const activityDates = useMemo(() => {
    const datesMap = {}

    combinedTransactions.forEach((item) => {
      const dateStr = new Date(item.date).toISOString().split('T')[0]
      if (!datesMap[dateStr]) {
        datesMap[dateStr] = { hasIncome: false, hasExpense: false, hasSavings: false }
      }

      if (item.type === 'income') datesMap[dateStr].hasIncome = true
      if (item.type === 'expense') datesMap[dateStr].hasExpense = true
      if (item.type === 'transfer') datesMap[dateStr].hasSavings = true
    })

    return datesMap
  }, [combinedTransactions])

  if (loading) {
    return <LoadingState message="Fetching savings and financial summary..." />
  }

  return (
    <div className="space-y-6">
      {/* 1. TOTAL MONEY AVAILABLE CARD WITH PIGGY GRAPHIC */}
      <Card className="bg-white border border-slate-100/90 shadow-2xs p-5 sm:p-6 relative overflow-hidden rounded-3xl">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
              Total Money Available
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
              {formatINR(totalBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              {hasAccounts
                ? `Across ${activeAccounts.length} active money account${activeAccounts.length === 1 ? '' : 's'}`
                : 'No active money accounts configured'}
            </p>
          </div>

          {/* Cute Piggy Bank Graphic / Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
            <span className="text-3xl sm:text-4xl">🐷</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-2 mt-5 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onAddMoneyClick}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Money</span>
            </button>

            <button
              type="button"
              onClick={onAddAccountClick}
              className="bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 px-4 py-2.5 rounded-full text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>Add Account</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onTransferClick}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-slate-300 shrink-0" />
            <span>Transfer</span>
          </button>
        </div>
      </Card>

      {/* 3. YOUR ACCOUNTS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Your Accounts ({activeAccounts.length})
          </h3>
        </div>

        {!hasAccounts ? (
          <EmptyState
            icon={Wallet}
            title="No accounts added yet"
            description="Add your bank, cash, or digital money account to start tracking your balance."
          />
        ) : (
          <div className="space-y-2.5">
            {activeAccounts.map((account) => {
              const last4 = account.account_number_last4 ? `•••• ${account.account_number_last4}` : ''
              const accTypeLabel = account.account_type === 'bank' ? 'SAVINGS ACCOUNT' : account.account_type === 'cash' ? 'CASH' : 'UPI DIGITAL'

              let IconComp = Building2
              let badgeStyle = 'bg-blue-50 text-blue-600 border-blue-100'

              if (account.account_type === 'cash') {
                IconComp = Wallet
                badgeStyle = 'bg-amber-50 text-amber-600 border-amber-100'
              } else if (account.account_type === 'upi') {
                IconComp = Smartphone
                badgeStyle = 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }

              return (
                <div
                  key={account.id}
                  onClick={() => onAccountClick(account)}
                  className="bg-white border border-slate-200/80 hover:border-emerald-200 hover:shadow-xs transition-all rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-3 rounded-2xl border ${badgeStyle} shrink-0`}>
                      <IconComp className="w-5 h-5 stroke-[2.5]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-extrabold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        {account.nickname || account.bank_name || account.name}
                      </div>
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                        <span>{accTypeLabel}</span>
                        {last4 && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{last4}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Balance</span>
                      <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {formatINR(account.current_balance)}
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

      {/* 4. SAVINGS ANALYTICS & PERIOD FILTERS */}
      <SavingsAnalytics
        periodMode={periodMode}
        onPeriodModeChange={setPeriodMode}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        metrics={financialMetrics}
      />

      {/* 5. MOBILE CALENDAR FILTER COMPONENT */}
      <SavingsCalendar
        year={selectedYear}
        month={selectedMonth}
        onMonthYearChange={(newMonth, newYear) => {
          setSelectedMonth(newMonth)
          setSelectedYear(newYear)
        }}
        selectedDate={selectedCalendarDate}
        onSelectDate={setSelectedCalendarDate}
        activityDates={activityDates}
      />

      {/* 6. RECENT ACTIVITY TIMELINE LIST */}
      <SavingsActivity
        transactions={combinedTransactions}
        accounts={accounts}
        onItemClick={(item) => {
          if (item.type === 'expense' && onOpenEditExpense) {
            onOpenEditExpense(item.raw)
          }
        }}
        selectedDate={selectedCalendarDate}
        onClearDateFilter={() => setSelectedCalendarDate(null)}
      />
    </div>
  )
}
