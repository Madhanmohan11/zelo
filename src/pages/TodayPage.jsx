import React from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDashboard } from '../context/DashboardContext'
import {
  updateMeal,
  updateWorkout,
  updateRememberItem
} from '../services/dataService'

import { DynamicHero } from '../components/home/DynamicHero'
import { TodayOverview } from '../components/home/TodayOverview'
import { TodaySchedule } from '../components/home/TodaySchedule'
import { MoneySnapshot } from '../components/home/MoneySnapshot'
import { DontForget } from '../components/home/DontForget'
import { WellnessSection } from '../components/home/WellnessSection'
import { RefreshCw } from 'lucide-react'

export const TodayPage = () => {
  const { user, profile, userSettings } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { openQuickAdd } = useOutletContext() || {}

  const {
    expensesSummary,
    tasksSummary,
    calendarSummary,
    rememberSummary,
    mealsSummary,
    workoutsSummary,
    waterSummary,
    sleepSummary,
    goalsSummary,
    isInitialLoading,
    isRefreshing,
    refreshMealsSummary,
    refreshWorkoutsSummary,
    refreshRememberSummary,
    refreshAllSummaries
  } = useDashboard()

  const handleToggleMealStatus = async (meal) => {
    const nextStatus = meal.status === 'completed' ? 'pending' : 'completed'
    try {
      await updateMeal(user.id, meal.id, { status: nextStatus })
      refreshMealsSummary()
      showToast(`Meal marked as ${nextStatus}`, 'success')
    } catch (e) {
      showToast('Failed to update meal', 'error')
    }
  }

  const handleToggleWorkoutStatus = async (workout) => {
    const nextStatus = workout.status === 'completed' ? 'planned' : 'completed'
    try {
      await updateWorkout(user.id, workout.id, { status: nextStatus })
      refreshWorkoutsSummary()
      showToast(`Workout marked as ${nextStatus}`, 'success')
    } catch (e) {
      showToast('Failed to update workout', 'error')
    }
  }

  const handleMarkCollected = async (item) => {
    try {
      await updateRememberItem(user.id, item.id, { status: 'collected' })
      refreshRememberSummary()
      showToast(`Marked "${item.title}" as Collected`, 'success')
    } catch (e) {
      showToast('Failed to update remember item', 'error')
    }
  }

  const userName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'Madhan'

  // Combine preview items into today's schedule
  const scheduleItems = [
    ...(mealsSummary.todayMeals || []).map((m) => ({ ...m, type: 'meal', time: m.scheduled_time })),
    ...(workoutsSummary.todayWorkouts || []).map((w) => ({ ...w, type: 'workout', time: w.scheduled_time })),
    ...(rememberSummary.activeRemembers || []).map((r) => ({ ...r, type: 'remember', time: r.given_date }))
  ]

  // Render full-page loader only on first boot when no cached summary exists
  if (isInitialLoading) {
    return <LoadingState message="Syncing your ZELO dashboard..." />
  }

  const waterLoggedL = Math.round((waterSummary.totalWaterMl / 1000) * 10) / 10
  const waterTargetL = Math.round((waterSummary.targetWaterMl / 1000) * 10) / 10

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto pb-12 relative">
      {/* BACKGROUND REFRESHING INDICATOR (NON-BLOCKING) */}
      {isRefreshing && (
        <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-semibold w-fit mx-auto shadow-2xs animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          <span>Updating dashboard...</span>
        </div>
      )}

      {/* 1. DYNAMIC TIME-BASED HERO SECTION */}
      <DynamicHero
        userName={userName}
        customSlogan={userSettings?.custom_slogan}
        dynamicHeroEnabled={userSettings?.dynamic_hero_enabled ?? true}
        autoTimeBgEnabled={userSettings?.auto_time_bg_enabled ?? true}
        onSloganUpdated={() => refreshAllSummaries()}
      />

      {/* 2. TODAY'S OVERVIEW (ENABLED MODULES GRID) */}
      <TodayOverview
        spentTotal={expensesSummary.spentTotalToday}
        tasksCompleted={tasksSummary.completedToday}
        tasksTotal={tasksSummary.totalToday}
        eventsTodayCount={calendarSummary.todayEventsCount}
        rememberPendingCount={rememberSummary.pendingCount}
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
        spentTotal={expensesSummary.spentTotalToday}
        dailyBudget={userSettings?.daily_expense_budget || 1000}
      />

      {/* 5. ATTENTION / REMINDERS (DON'T FORGET) */}
      <DontForget
        remembers={rememberSummary.activeRemembers}
        onMarkCollected={handleMarkCollected}
      />

      {/* 6. OPTIONAL WELLNESS & HABITS SECTION */}
      <WellnessSection
        waterLog={waterLoggedL}
        waterTarget={waterTargetL}
        sleepHours={sleepSummary.lastNightDuration}
        todayMeals={mealsSummary.todayMeals}
        todayWorkouts={workoutsSummary.todayWorkouts}
        activeGoalsCount={goalsSummary.activeCount}
      />
    </div>
  )
}

