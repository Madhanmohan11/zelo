import React, { useState, useRef, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Utensils, Dumbbell, Bookmark, DollarSign } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { createMeal, createWorkout, createRememberItem, createExpense } from '../services/dataService'
import { formatINR } from '../utils/formatters'

export const QuickAddModal = ({ isOpen, onClose, defaultTab = null, onSuccess = () => {} }) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [activeType, setActiveType] = useState('expense') // 'food', 'workout', 'remember', 'expense'
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quick inputs
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [expenseDesc, setExpenseDesc] = useState('')

  const [rememberTitle, setRememberTitle] = useState('')
  const [rememberLocation, setRememberLocation] = useState('')
  const [expectedDate, setExpectedDate] = useState('')

  const [mealTitle, setMealTitle] = useState('')
  const [mealType, setMealType] = useState('lunch')
  const [mealTime, setMealTime] = useState('13:00')

  const [workoutTitle, setWorkoutTitle] = useState('')
  const [workoutTime, setWorkoutTime] = useState('18:00')

  // Auto focus ref
  const focusInputRef = useRef(null)

  useEffect(() => {
    if (defaultTab) {
      setActiveType(defaultTab)
    }
  }, [defaultTab])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        focusInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, activeType])

  const resetForm = () => {
    setAmount('')
    setExpenseDesc('')
    setRememberTitle('')
    setRememberLocation('')
    setExpectedDate('')
    setMealTitle('')
    setWorkoutTitle('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      if (activeType === 'expense') {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
          throw new Error('Please enter a valid expense amount')
        }
        await createExpense(user.id, {
          amount,
          category,
          payment_method: paymentMethod,
          description: expenseDesc || `${category} expense`
        })
        showToast(`Logged expense ${formatINR(amount)}`, 'success')
      } else if (activeType === 'remember') {
        if (!rememberTitle.trim()) {
          throw new Error('Please specify what you need to remember')
        }
        await createRememberItem(user.id, {
          title: rememberTitle,
          location: rememberLocation,
          expected_date: expectedDate || null
        })
        showToast(`Saved remember item: "${rememberTitle}"`, 'success')
      } else if (activeType === 'food') {
        if (!mealTitle.trim()) {
          throw new Error('Please enter a meal title')
        }
        await createMeal(user.id, {
          title: mealTitle,
          meal_type: mealType,
          scheduled_time: mealTime
        })
        showToast(`Added meal: "${mealTitle}"`, 'success')
      } else if (activeType === 'workout') {
        if (!workoutTitle.trim()) {
          throw new Error('Please enter a workout title')
        }
        await createWorkout(user.id, {
          title: workoutTitle,
          scheduled_time: workoutTime
        })
        showToast(`Scheduled workout: "${workoutTitle}"`, 'success')
      }

      resetForm()
      onSuccess()
      onClose()
    } catch (err) {
      showToast(err.message || 'Failed to save', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const types = [
    { id: 'expense', label: 'Expense', icon: DollarSign, activeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { id: 'remember', label: 'Remember', icon: Bookmark, activeBg: 'bg-purple-50 text-purple-800 border-purple-200' },
    { id: 'food', label: 'Food', icon: Utensils, activeBg: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 'workout', label: 'Workout', icon: Dumbbell, activeBg: 'bg-rose-50 text-rose-800 border-rose-200' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Add to ZELO">
      {/* Selector Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-4 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/60">
        {types.map((t) => {
          const Icon = t.icon
          const isActive = activeType === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveType(t.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* EXPENSE QUICK FORM */}
        {activeType === 'expense' && (
          <>
            <Input
              ref={focusInputRef}
              label="Amount (₹)"
              type="number"
              step="0.01"
              placeholder="e.g. 150"
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
              label="Description (Optional)"
              placeholder="e.g. Lunch with friends"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
            />
          </>
        )}

        {/* REMEMBER QUICK FORM */}
        {activeType === 'remember' && (
          <>
            <Input
              ref={focusInputRef}
              label="What to Remember?"
              placeholder="e.g. 2 shirts given for ironing"
              value={rememberTitle}
              onChange={(e) => setRememberTitle(e.target.value)}
              required
            />
            <Input
              label="Location / Person"
              placeholder="e.g. Ironing shop / Rajesh"
              value={rememberLocation}
              onChange={(e) => setRememberLocation(e.target.value)}
            />
            <Input
              label="Expected Collection Date"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </>
        )}

        {/* FOOD QUICK FORM */}
        {activeType === 'food' && (
          <>
            <Input
              ref={focusInputRef}
              label="Meal Title"
              placeholder="e.g. Oatmeal & Eggs"
              value={mealTitle}
              onChange={(e) => setMealTitle(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Meal Type"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                options={[
                  { value: 'breakfast', label: 'Breakfast' },
                  { value: 'morning_snack', label: 'Morning Snack' },
                  { value: 'lunch', label: 'Lunch' },
                  { value: 'evening_snack', label: 'Evening Snack' },
                  { value: 'dinner', label: 'Dinner' }
                ]}
              />
              <Input
                label="Time"
                type="time"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
              />
            </div>
          </>
        )}

        {/* WORKOUT QUICK FORM */}
        {activeType === 'workout' && (
          <>
            <Input
              ref={focusInputRef}
              label="Workout Title"
              placeholder="e.g. Chest & Triceps"
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              required
            />
            <Input
              label="Scheduled Time"
              type="time"
              value={workoutTime}
              onChange={(e) => setWorkoutTime(e.target.value)}
            />
          </>
        )}

        <div className="pt-2">
          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Save Entry
          </Button>
        </div>
      </form>
    </Modal>
  )
}
