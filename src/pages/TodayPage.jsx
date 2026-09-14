import React, { useState, useEffect, useCallback } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import {
  Sun,
  Utensils,
  Dumbbell,
  Bookmark,
  DollarSign,
  Plus,
  Sparkles
} from 'lucide-react'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getMeals,
  getWorkouts,
  getRememberItems,
  getExpenses,
  updateMeal,
  updateWorkout,
  updateRememberItem
} from '../services/dataService'

import { DailyProgress } from '../components/home/DailyProgress'
import { DailyTimeline } from '../components/home/DailyTimeline'
import { RememberPreview } from '../components/home/RememberPreview'
import { ExpenseSnapshot } from '../components/home/ExpenseSnapshot'
import { HealthSnapshot } from '../components/home/HealthSnapshot'

export const TodayPage = () => {
  const { user, profile, userSettings } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { openQuickAdd } = useOutletContext() || {}

  const [loading, setLoading] = useState(true)
  const [todayMeals, setTodayMeals] = useState([])
  const [todayWorkouts, setTodayWorkouts] = useState([])
  const [rememberItems, setRememberItems] = useState([])
  const [todayExpenses, setTodayExpenses] = useState([])

  const todayStr = new Date().toISOString().split('T')[0]

  const loadDashboardData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [meals, workouts, remembers, expenses] = await Promise.all([
        getMeals(user.id, todayStr),
        getWorkouts(user.id, todayStr),
        getRememberItems(user.id),
        getExpenses(user.id)
      ])

      setTodayMeals(meals)
      setTodayWorkouts(workouts)

      const activeRemembers = remembers.filter((r) =>
        ['waiting', 'ready'].includes((r.status || '').toLowerCase())
      )
      setRememberItems(activeRemembers)

      const expensesToday = expenses.filter((e) => {
        const spentDate = (e.spent_at || e.created_at || '').split('T')[0]
        return spentDate === todayStr
      })
      setTodayExpenses(expensesToday)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      showToast('Failed to sync dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, todayStr, showToast])

  useEffect(() => {
    loadDashboardData()

    const handleUpdate = () => loadDashboardData()
    window.addEventListener('zelo_data_updated', handleUpdate)
    return () => window.removeEventListener('zelo_data_updated', handleUpdate)
  }, [loadDashboardData])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const formattedDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  }).toUpperCase()

  const handleToggleMealStatus = async (meal) => {
    const nextStatus = meal.status === 'completed' ? 'pending' : 'completed'
    try {
      await updateMeal(user.id, meal.id, { status: nextStatus })
      setTodayMeals((prev) =>
        prev.map((m) => (m.id === meal.id ? { ...m, status: nextStatus } : m))
      )
      showToast(`Meal marked as ${nextStatus}`, 'success')
    } catch (e) {
      showToast('Failed to update meal', 'error')
    }
  }

  const handleToggleWorkoutStatus = async (workout) => {
    const nextStatus = workout.status === 'completed' ? 'planned' : 'completed'
    try {
      await updateWorkout(user.id, workout.id, { status: nextStatus })
      setTodayWorkouts((prev) =>
        prev.map((w) => (w.id === workout.id ? { ...w, status: nextStatus } : w))
      )
      showToast(`Workout marked as ${nextStatus}`, 'success')
    } catch (e) {
      showToast('Failed to update workout', 'error')
    }
  }

  const handleMarkCollected = async (item) => {
    try {
      await updateRememberItem(user.id, item.id, { status: 'collected' })
      setRememberItems((prev) => prev.filter((r) => r.id !== item.id))
      showToast(`Marked "${item.title}" as Collected`, 'success')
    } catch (e) {
      showToast('Failed to update remember item', 'error')
    }
  }

  const todaySpentTotal = todayExpenses.reduce(
    (acc, curr) => acc + (parseFloat(curr.amount) || 0),
    0
  )
  const userName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'Friend'

  if (loading) {
    return <LoadingState message="Syncing your ZELO today dashboard..." />
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* GREETING & DATE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 flex items-center gap-1.5 mb-1">
            <Sun className="w-3.5 h-3.5 text-emerald-600" />
            <span>{formattedDay} • {formattedDate}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Here's your day at a glance.
          </p>
        </div>

        {/* Desktop / Quick Add Trigger Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickAdd?.('expense')}
            className="px-4 py-2 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Add Entry</span>
          </button>
        </div>
      </div>

      {/* MOBILE DAILY PROGRESS (VISIBLE AT THE TOP FOR MOBILE CLARITY) */}
      <div className="lg:hidden">
        <DailyProgress
          meals={todayMeals}
          workouts={todayWorkouts}
          remembers={rememberItems}
          expenses={todayExpenses}
          spentTotal={todaySpentTotal}
        />
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CENTRAL TIMELINE (7 COLS ON DESKTOP) */}
        <div className="lg:col-span-7 space-y-6">
          <DailyTimeline
            meals={todayMeals}
            workouts={todayWorkouts}
            remembers={rememberItems}
            onToggleMeal={handleToggleMealStatus}
            onToggleWorkout={handleToggleWorkoutStatus}
            onMarkCollected={handleMarkCollected}
            onOpenQuickAdd={(tab) => openQuickAdd?.(tab)}
          />
        </div>

        {/* RIGHT COLUMN: SNAPSHOTS & PROGRESS (5 COLS ON DESKTOP) */}
        <div className="lg:col-span-5 space-y-6">
          {/* DESKTOP PROGRESS SUMMARY */}
          <div className="hidden lg:block">
            <DailyProgress
              meals={todayMeals}
              workouts={todayWorkouts}
              remembers={rememberItems}
              expenses={todayExpenses}
              spentTotal={todaySpentTotal}
            />
          </div>

          {/* DON'T FORGET / REMEMBER PREVIEW */}
          <RememberPreview
            remembers={rememberItems}
            onMarkCollected={handleMarkCollected}
          />

          {/* EXPENSE SNAPSHOT */}
          <ExpenseSnapshot
            expenses={todayExpenses}
            spentTotal={todaySpentTotal}
            budget={userSettings?.daily_expense_budget || 1000}
          />

          {/* HEALTH SNAPSHOT */}
          <HealthSnapshot userSettings={userSettings} />
        </div>
      </div>
    </div>
  )
}
