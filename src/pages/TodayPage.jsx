import React, { useState, useEffect, useCallback } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import {
  Sun,
  Utensils,
  Dumbbell,
  Bookmark,
  IndianRupee,
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

import { useModulePreferences } from '../context/ModuleContext'

export const TodayPage = () => {
  const { user, profile, userSettings } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { openQuickAdd } = useOutletContext() || {}
  const { isModuleEnabled } = useModulePreferences()

  const [loading, setLoading] = useState(true)
  const [showCustomizeBanner, setShowCustomizeBanner] = useState(true)
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
      </div>

      {/* OPTIONAL DISMISSIBLE CUSTOMIZE HOME BANNER */}
      {showCustomizeBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-2xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Make ZELO your own</h4>
              <p className="text-[11px] font-medium text-slate-600">Choose the features you want to see on your dashboard.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => navigate('/customize-modules')}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all shadow-2xs cursor-pointer"
            >
              Customize Home
            </button>
            <button
              type="button"
              onClick={() => setShowCustomizeBanner(false)}
              className="p-1 text-slate-400 hover:text-slate-600 text-sm font-extrabold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
          {isModuleEnabled('remember') && (
            <RememberPreview
              remembers={rememberItems}
              onMarkCollected={handleMarkCollected}
            />
          )}

          {/* EXPENSE SNAPSHOT (MONEY IS ALWAYS ENABLED) */}
          {isModuleEnabled('money') && (
            <ExpenseSnapshot
              expenses={todayExpenses}
              spentTotal={todaySpentTotal}
              budget={userSettings?.daily_expense_budget || 1000}
            />
          )}

          {/* HEALTH SNAPSHOT */}
          {(isModuleEnabled('food') || isModuleEnabled('workout')) && (
            <HealthSnapshot userSettings={userSettings} />
          )}
        </div>
      </div>
    </div>
  )
}
