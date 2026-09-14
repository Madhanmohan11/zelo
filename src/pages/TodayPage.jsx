import React, { useState, useEffect, useCallback } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import {
  Sun,
  Utensils,
  Dumbbell,
  Bookmark,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMeals, getWorkouts, getRememberItems, getExpenses, updateMeal, updateWorkout, updateRememberItem } from '../services/dataService'
import { formatINR } from '../utils/formatters'

export const TodayPage = () => {
  const { user, profile } = useAuth()
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
      
      const activeRemembers = remembers.filter(r => ['waiting', 'ready'].includes((r.status || '').toLowerCase()))
      setRememberItems(activeRemembers)

      const expensesToday = expenses.filter(e => {
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
    window.addEventListener('lifeos_data_updated', handleUpdate)
    return () => window.removeEventListener('lifeos_data_updated', handleUpdate)
  }, [loadDashboardData])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const handleToggleMealStatus = async (meal) => {
    const nextStatus = meal.status === 'completed' ? 'pending' : 'completed'
    try {
      await updateMeal(user.id, meal.id, { status: nextStatus })
      setTodayMeals(prev => prev.map(m => m.id === meal.id ? { ...m, status: nextStatus } : m))
      showToast(`Meal marked as ${nextStatus}`, 'success')
    } catch (e) {
      showToast('Failed to update meal', 'error')
    }
  }

  const handleToggleWorkoutStatus = async (workout) => {
    const nextStatus = workout.status === 'completed' ? 'planned' : 'completed'
    try {
      await updateWorkout(user.id, workout.id, { status: nextStatus })
      setTodayWorkouts(prev => prev.map(w => w.id === workout.id ? { ...w, status: nextStatus } : w))
      showToast(`Workout marked as ${nextStatus}`, 'success')
    } catch (e) {
      showToast('Failed to update workout', 'error')
    }
  }

  const handleMarkCollected = async (item) => {
    try {
      await updateRememberItem(user.id, item.id, { status: 'collected' })
      setRememberItems(prev => prev.filter(r => r.id !== item.id))
      showToast(`Marked "${item.title}" as Collected`, 'success')
    } catch (e) {
      showToast('Failed to update remember item', 'error')
    }
  }

  const todaySpentTotal = todayExpenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)
  const userName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Friend'

  if (loading) {
    return <LoadingState message="Syncing your LifeOS today dashboard..." />
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* GREETING BANNER */}
      <div className="soft-card p-6 sm:p-8 relative overflow-hidden bg-white border border-slate-200/80 shadow-sm">
        <div className="relative z-10">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Sun className="w-4 h-4 text-emerald-600" />
            <span>{formattedDate}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 max-w-md">
            Here is your daily snapshot across food, workout routines, pending errands, and expenses.
          </p>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => openQuickAdd?.('food')}
              className="px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-1.5 transition-all"
            >
              <Utensils className="w-3.5 h-3.5 text-amber-700" />
              <span>Add Meal</span>
            </button>
            <button
              onClick={() => openQuickAdd?.('workout')}
              className="px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-900 flex items-center gap-1.5 transition-all"
            >
              <Dumbbell className="w-3.5 h-3.5 text-rose-700" />
              <span>Add Workout</span>
            </button>
            <button
              onClick={() => openQuickAdd?.('remember')}
              className="px-3.5 py-2 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 flex items-center gap-1.5 transition-all"
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-700" />
              <span>Remember Item</span>
            </button>
            <button
              onClick={() => openQuickAdd?.('expense')}
              className="px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-1.5 transition-all"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD METRICS & GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. TODAY'S FOOD */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 font-bold">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Today's Meals</h3>
                  <span className="text-xs font-medium text-slate-500">Scheduled nutrition for today</span>
                </div>
              </div>
              <Button size="sm" variant="glass" onClick={() => navigate('/food')}>
                View All
              </Button>
            </div>

            {todayMeals.length === 0 ? (
              <EmptyState
                icon={Utensils}
                title="No meals planned for today"
                description="Add your first scheduled meal to track your daily diet."
                actionLabel="Add Food"
                onAction={() => openQuickAdd?.('food')}
              />
            ) : (
              <div className="space-y-2">
                {todayMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleMealStatus(meal)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          meal.status === 'completed'
                            ? 'bg-emerald-500 text-white'
                            : 'border border-slate-300 hover:border-emerald-500 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div>
                        <div className={`text-sm font-bold ${meal.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {meal.title}
                        </div>
                        <div className="text-xs font-medium text-slate-500 capitalize flex items-center gap-2">
                          <span>{meal.meal_type?.replace('_', ' ')}</span>
                          {meal.scheduled_time && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {meal.scheduled_time}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge status={meal.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 2. TODAY'S WORKOUT */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-800 font-bold">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Today's Workout</h3>
                  <span className="text-xs font-medium text-slate-500">Fitness routine & sessions</span>
                </div>
              </div>
              <Button size="sm" variant="glass" onClick={() => navigate('/workout')}>
                View All
              </Button>
            </div>

            {todayWorkouts.length === 0 ? (
              <EmptyState
                icon={Dumbbell}
                title="No workouts scheduled today"
                description="Keep your momentum going by adding today's routine."
                actionLabel="Add Workout"
                onAction={() => openQuickAdd?.('workout')}
              />
            ) : (
              <div className="space-y-2">
                {todayWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleWorkoutStatus(workout)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          workout.status === 'completed'
                            ? 'bg-rose-500 text-white'
                            : 'border border-slate-300 hover:border-rose-500 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div>
                        <div className={`text-sm font-bold ${workout.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {workout.title}
                        </div>
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{workout.scheduled_time || 'Planned'}</span>
                          <span>•</span>
                          <span>{workout.duration_minutes || 45} mins</span>
                        </div>
                      </div>
                    </div>
                    <Badge status={workout.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 3. REMEMBER ITEMS */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-800 font-bold">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Remember Items</h3>
                  <span className="text-xs font-medium text-slate-500">Items given, laundry, repairs</span>
                </div>
              </div>
              <Button size="sm" variant="glass" onClick={() => navigate('/remember')}>
                View All
              </Button>
            </div>

            {rememberItems.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="All caught up!"
                description="No pending items left at shops, laundry, or friends."
                actionLabel="Remember Item"
                onAction={() => openQuickAdd?.('remember')}
              />
            ) : (
              <div className="space-y-2">
                {rememberItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{item.title}</div>
                        {item.location && (
                          <div className="text-xs font-medium text-slate-500">Location: {item.location}</div>
                        )}
                      </div>
                      <Badge status={item.status} />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500 font-medium">
                        {item.expected_date ? `Expected: ${item.expected_date}` : 'Waiting pickup'}
                      </span>
                      <button
                        onClick={() => handleMarkCollected(item)}
                        className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        Mark Collected
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 4. TODAY'S EXPENSES */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Today's Expenses</h3>
                  <span className="text-xs font-medium text-slate-500">Daily spending log</span>
                </div>
              </div>
              <Button size="sm" variant="glass" onClick={() => navigate('/expenses')}>
                View All
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between mb-3">
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Spent Today</span>
                <div className="text-2xl font-black text-emerald-800">{formatINR(todaySpentTotal)}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-semibold">Transactions</span>
                <div className="text-lg font-bold text-slate-900">{todayExpenses.length}</div>
              </div>
            </div>

            {todayExpenses.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title="No expenses logged today"
                description="Track your daily transactions to stay within budget."
                actionLabel="Add Expense"
                onAction={() => openQuickAdd?.('expense')}
              />
            ) : (
              <div className="space-y-2">
                {todayExpenses.slice(0, 3).map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs font-medium"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{exp.description || exp.category}</div>
                      <div className="text-slate-500">{exp.category} • {exp.payment_method}</div>
                    </div>
                    <div className="font-black text-emerald-800 text-sm">{formatINR(exp.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  )
}
