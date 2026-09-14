import React, { useState, useEffect, useCallback } from 'react'
import { DollarSign, Plus, Search, Trash2, Edit2, CreditCard } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/dataService'
import { formatINR } from '../utils/formatters'

export const ExpensesPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'today', 'week', 'month'
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [description, setDescription] = useState('')
  const [spentAt, setSpentAt] = useState(new Date().toISOString().slice(0, 16))
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadExpenses = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getExpenses(user.id)
      setExpenses(data)
    } catch (err) {
      showToast('Failed to load expenses', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const openAddModal = () => {
    setEditingExpense(null)
    setAmount('')
    setCategory('Food')
    setPaymentMethod('UPI')
    setDescription('')
    setSpentAt(new Date().toISOString().slice(0, 16))
    setNotes('')
    setIsModalOpen(true)
  }

  const openEditModal = (exp) => {
    setEditingExpense(exp)
    setAmount(String(exp.amount))
    setCategory(exp.category)
    setPaymentMethod(exp.payment_method || 'UPI')
    setDescription(exp.description || '')
    setSpentAt(exp.spent_at ? new Date(exp.spent_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16))
    setNotes(exp.notes || '')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showToast('Please enter a valid expense amount', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingExpense) {
        await updateExpense(user.id, editingExpense.id, {
          amount,
          category,
          payment_method: paymentMethod,
          description,
          spent_at: new Date(spentAt).toISOString(),
          notes
        })
        showToast('Expense record updated', 'success')
      } else {
        await createExpense(user.id, {
          amount,
          category,
          payment_method: paymentMethod,
          description,
          spent_at: new Date(spentAt).toISOString(),
          notes
        })
        showToast(`Logged expense ${formatINR(amount)}`, 'success')
      }
      setIsModalOpen(false)
      loadExpenses()
    } catch (err) {
      showToast(err.message || 'Failed to save expense', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Delete this expense record?')) return
    try {
      await deleteExpense(user.id, expenseId)
      setExpenses(prev => prev.filter(e => e.id !== expenseId))
      showToast('Expense deleted', 'info')
    } catch (e) {
      showToast('Failed to delete expense', 'error')
    }
  }

  // Calculate Metrics
  const todayStr = new Date().toISOString().split('T')[0]
  const now = new Date()
  
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0]

  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const todayTotal = expenses
    .filter(e => (e.spent_at || '').split('T')[0] === todayStr)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  const weekTotal = expenses
    .filter(e => (e.spent_at || '').split('T')[0] >= startOfWeekStr)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  const monthTotal = expenses
    .filter(e => (e.spent_at || '').split('T')[0] >= startOfMonthStr)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  // Filtered List
  const filteredExpenses = expenses.filter(e => {
    const expDate = (e.spent_at || '').split('T')[0]
    
    if (timeFilter === 'today' && expDate !== todayStr) return false
    if (timeFilter === 'week' && expDate < startOfWeekStr) return false
    if (timeFilter === 'month' && expDate < startOfMonthStr) return false

    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const desc = (e.description || '').toLowerCase()
      const cat = (e.category || '').toLowerCase()
      const pm = (e.payment_method || '').toLowerCase()
      return desc.includes(q) || cat.includes(q) || pm.includes(q)
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Expense Manager</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Track daily spending, categories, and monthly totals</p>
        </div>

        <Button onClick={openAddModal} variant="primary" icon={Plus}>
          Add Expense
        </Button>
      </div>

      {/* Analytics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-50/80 border border-emerald-200/80">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Today's Spending</span>
          <div className="text-2xl font-black text-emerald-950 mt-1">{formatINR(todayTotal)}</div>
        </Card>

        <Card className="bg-indigo-50/80 border border-indigo-200/80">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">This Week</span>
          <div className="text-2xl font-black text-indigo-950 mt-1">{formatINR(weekTotal)}</div>
        </Card>

        <Card className="bg-purple-50/80 border border-purple-200/80">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-800">This Month</span>
          <div className="text-2xl font-black text-purple-950 mt-1">{formatINR(monthTotal)}</div>
        </Card>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search description, category, or payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today Only' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' }
            ]}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Food', label: 'Food' },
              { value: 'Travel', label: 'Travel' },
              { value: 'Shopping', label: 'Shopping' },
              { value: 'Bills', label: 'Bills' },
              { value: 'Health', label: 'Health' },
              { value: 'Entertainment', label: 'Entertainment' },
              { value: 'Education', label: 'Education' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>
      </div>

      {/* Expenses List */}
      {loading ? (
        <LoadingState message="Fetching expenses history..." />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No expenses logged"
          description="Click Add Expense to log your payments and manage your daily budget."
          actionLabel="Log Expense"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((exp) => (
            <Card
              key={exp.id}
              className="flex items-center justify-between p-4 bg-white border border-slate-200/70 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 font-bold shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900">{exp.description || exp.category}</div>
                  <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{exp.category}</span>
                    <span>•</span>
                    <span>{exp.payment_method || 'UPI'}</span>
                    <span>•</span>
                    <span>{new Date(exp.spent_at || exp.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-800">{formatINR(exp.amount)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(exp)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense' : 'Log New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 250"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Food', label: 'Food & Dining' },
                { value: 'Travel', label: 'Travel & Transport' },
                { value: 'Shopping', label: 'Shopping' },
                { value: 'Bills', label: 'Bills & Utilities' },
                { value: 'Health', label: 'Health & Fitness' },
                { value: 'Entertainment', label: 'Entertainment' },
                { value: 'Education', label: 'Education' },
                { value: 'Other', label: 'Other' }
              ]}
            />

            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: 'UPI', label: 'UPI / GPay' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Card', label: 'Debit / Credit Card' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Other', label: 'Other' }
              ]}
            />
          </div>

          <Input
            label="Description / Merchant"
            placeholder="e.g. Lunch at Swagath Restaurant"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Date & Time"
            type="datetime-local"
            value={spentAt}
            onChange={(e) => setSpentAt(e.target.value)}
          />

          <Input
            label="Notes (Optional)"
            placeholder="e.g. Shared with 2 friends"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
              {editingExpense ? 'Update Expense' : 'Log Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
