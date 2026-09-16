import React, { useState, useEffect, useCallback } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
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

import { HomeHeader } from '../components/home/HomeHeader'
import { TodayOverview } from '../components/home/TodayOverview'
import { TodaySchedule } from '../components/home/TodaySchedule'
import { MoneySnapshot } from '../components/home/MoneySnapshot'
import { DontForget } from '../components/home/DontForget'
import { WellnessSection } from '../components/home/WellnessSection'

import { useModulePreferences } from '../context/ModuleContext'

export const TodayPage = () => {
  const { user, profile, userSettings } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { openQuickAdd } = useOutletContext() || {}
  const { isModuleEnabled } = useModulePreferences()

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

      setTodayMeals(meals || [])
      setTodayWorkouts(workouts || [])

      const activeRemembers = (remembers || []).filter((r) =>
        ['waiting', 'ready'].includes((r.status || '').toLowerCase())
      )
      setRememberItems(activeRemembers)

      const expensesToday = (expenses || []).filter((e) => {
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
    'Madhan'

  // Combine items into today's schedule
  const scheduleItems = [
    ...todayMeals.map((m) => ({ ...m, type: 'meal', time: m.scheduled_time })),
    ...todayWorkouts.map((w) => ({ ...w, type: 'workout', time: w.scheduled_time })),
    ...rememberItems.map((r) => ({ ...r, type: 'remember', time: r.given_date }))
  ]

  if (loading) {
    return <LoadingState message="Syncing your ZELO dashboard..." />
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto pb-12">
      {/* 1. HEADER SECTION */}
      <HomeHeader userName={userName} />

      {/* 2. TODAY'S OVERVIEW (ENABLED MODULES GRID) */}
      <TodayOverview
        spentTotal={todaySpentTotal}
        tasksCompleted={3}
        tasksTotal={5}
        eventsTodayCount={0}
        rememberPendingCount={rememberItems.length}
      />

      {/* 3. TODAY'S SCHEDULE (TIMELINE / EMPTY STATE) */}
      <TodaySchedule
        scheduleItems={scheduleItems}
        onOpenQuickAdd={(tab) => openQuickAdd?.(tab)}
        onToggleMeal={handleToggleMealStatus}
        onToggleWorkout={handleToggleWorkoutStatus}
        onMarkCollected={handleMarkCollected}
      />

      {/* 4. SPENDING TODAY (MONEY SNAPSHOT) */}
      <MoneySnapshot
        spentTotal={todaySpentTotal}
        dailyBudget={userSettings?.daily_expense_budget || 1000}
      />

      {/* 5. ATTENTION / REMINDERS (DON'T FORGET) */}
      <DontForget
        remembers={rememberItems}
        onMarkCollected={handleMarkCollected}
      />

      {/* 6. OPTIONAL WELLNESS & HABITS SECTION */}
      <WellnessSection
        waterLog={1.8}
        waterTarget={2.5}
        sleepHours={8}
        todayMeals={todayMeals}
        todayWorkouts={todayWorkouts}
      />
    </div>
  )
}
