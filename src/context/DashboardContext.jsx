import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getLocalData } from '../services/dataService'

const DashboardContext = createContext(null)

const INITIAL_SUMMARY_STATE = {
  expensesSummary: { spentTotalToday: 0 },
  tasksSummary: { completedToday: 0, totalToday: 0 },
  calendarSummary: { todayEventsCount: 0, todayEventsList: [] },
  rememberSummary: { pendingCount: 0, activeRemembers: [] },
  mealsSummary: { todayMeals: [] },
  workoutsSummary: { todayWorkouts: [] },
  waterSummary: { totalWaterMl: 0, targetWaterMl: 2500 },
  sleepSummary: { lastNightDuration: 0, targetSleepHours: 8 },
  goalsSummary: { activeCount: 0, goalsList: [] }
}

const getTodayStr = () => new Date().toISOString().split('T')[0]

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth()
  const userId = user?.id

  // Load persistent cache from localStorage for instant initial display
  const getInitialCache = useCallback(() => {
    if (!userId) return { cached: INITIAL_SUMMARY_STATE, hasData: false }
    try {
      const raw = localStorage.getItem(`zelo_dashboard_cache_${userId}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        const cached = { ...INITIAL_SUMMARY_STATE, ...parsed }
        const hasData = Boolean(
          cached.expensesSummary?.spentTotalToday ||
          cached.tasksSummary?.totalToday ||
          cached.calendarSummary?.todayEventsCount ||
          cached.rememberSummary?.pendingCount ||
          cached.mealsSummary?.todayMeals?.length ||
          cached.workoutsSummary?.todayWorkouts?.length
        )
        return { cached, hasData }
      }
    } catch (e) {
      console.warn('Failed to load dashboard cache:', e)
    }
    return { cached: INITIAL_SUMMARY_STATE, hasData: false }
  }, [userId])

  const [summaryState, setSummaryState] = useState(() => {
    const { cached } = getInitialCache()
    return cached
  })

  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    const { hasData } = getInitialCache()
    return !hasData
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Tracking active refreshes & request sequence versions for race-condition protection
  const activeRefreshesRef = useRef(new Set())
  const requestVersionsRef = useRef({
    expenses: 0,
    tasks: 0,
    calendar: 0,
    remember: 0,
    meals: 0,
    workouts: 0,
    water: 0,
    sleep: 0,
    goals: 0
  })

  const startRefresh = (key) => {
    activeRefreshesRef.current.add(key)
    setIsRefreshing(true)
    requestVersionsRef.current[key] = (requestVersionsRef.current[key] || 0) + 1
    return requestVersionsRef.current[key]
  }

  const endRefresh = (key) => {
    activeRefreshesRef.current.delete(key)
    if (activeRefreshesRef.current.size === 0) {
      setIsRefreshing(false)
      setIsInitialLoading(false)
    }
  }

  // Persist updated summary state to cache
  const persistCache = useCallback((updatedState) => {
    if (!userId) return
    try {
      localStorage.setItem(`zelo_dashboard_cache_${userId}`, JSON.stringify(updatedState))
    } catch (e) {
      console.warn('Failed to save dashboard cache:', e)
    }
  }, [userId])

  // Update a slice of summary state safely
  const updateSummarySlice = useCallback((sliceKey, sliceValue) => {
    setSummaryState((prev) => {
      const next = { ...prev, [sliceKey]: sliceValue }
      persistCache(next)
      return next
    })
  }, [persistCache])

  // ---------------------------------------------------------------------------
  // INDEPENDENT SUMMARY REFRESH FUNCTIONS
  // ---------------------------------------------------------------------------

  // 1. Expenses Summary
  const refreshExpensesSummary = useCallback(async () => {
    if (!userId) return
    const version = startRefresh('expenses')
    const todayStr = getTodayStr()
    let spentTotalToday = 0

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('expenses')
          .select('amount, spent_at, created_at')
          .eq('user_id', userId)

        if (!error && data) {
          spentTotalToday = data.reduce((acc, curr) => {
            const spentDate = (curr.spent_at || curr.created_at || '').split('T')[0]
            return spentDate === todayStr ? acc + (parseFloat(curr.amount) || 0) : acc
          }, 0)
        } else {
          throw error || new Error('Expenses query error')
        }
      } else {
        throw new Error('Supabase not configured')
      }
    } catch (err) {
      // LocalStorage Fallback
      const localExpenses = getLocalData(`expenses_${userId}`, [])
      spentTotalToday = localExpenses.reduce((acc, curr) => {
        const spentDate = (curr.spent_at || curr.created_at || '').split('T')[0]
        return spentDate === todayStr ? acc + (parseFloat(curr.amount) || 0) : acc
      }, 0)
    } finally {
      if (requestVersionsRef.current.expenses === version) {
        updateSummarySlice('expensesSummary', { spentTotalToday })
      }
      endRefresh('expenses')
    }
  }, [userId, updateSummarySlice])

  // 2. Tasks Summary
  const refreshTasksSummary = useCallback(async () => {
    if (!userId) return
    const version = startRefresh('tasks')
    let completedToday = 0
    let totalToday = 0

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, status')
          .eq('user_id', userId)

        if (!error && data) {
          totalToday = data.length
          completedToday = data.filter((t) => t.status === 'completed').length
        } else {
          throw error || new Error('Tasks query error')
        }
      } else {
        throw new Error('Supabase not configured')
      }
    } catch (err) {
      const localTasks = getLocalData(`tasks_${userId}`, [])
      totalToday = localTasks.length
      completedToday = localTasks.filter((t) => t.status === 'completed').length
    } finally {
      if (requestVersionsRef.current.tasks === version) {
        updateSummarySlice('tasksSummary', { completedToday, totalToday })
      }
      endRefresh('tasks')
    }
  }, [userId, updateSummarySlice])

  // 3. Calendar Summary
  const refreshCalendarSummary = useCallback(async () => {
    if (!userId) return
    const version = startRefresh('calendar')
    const todayStr = getTodayStr()
    let todayEventsCount = 0
    let todayEventsList = []

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('id, title, start_time, end_time, category, location, description, is_all_day')
          .eq('user_id', userId)
          .order('start_time', { ascending: true })

        if (!error && data) {
          const events = data
            .filter((item) => item.start_time && item.start_time.startsWith(todayStr))
            .map((item) => ({
              id: item.id,
              title: item.title,
              event_date: item.start_time.split('T')[0],
              start_time: item.start_time.includes('T') ? item.start_time.split('T')[1].substring(0, 5) : '09:00',
              end_time: item.end_time && item.end_time.includes('T') ? item.end_time.split('T')[1].substring(0, 5) : '10:00',
              category: item.category || 'Personal',
              location: item.location || '',
              is_all_day: Boolean(item.is_all_day)
            }))
          todayEventsCount = events.length
          todayEventsList = events.slice(0, 5)
        } else {
          throw error || new Error('Calendar query error')
        }
      } else {
        throw new Error('Supabase not configured')
      }
    } catch (err) {
      const localEvents = getLocalData(`events_${userId}`, [])
      const events = localEvents.filter((e) => e.event_date === todayStr)
      todayEventsCount = events.length
      todayEventsList = events.slice(0, 5)
    } finally {
      if (requestVersionsRef.current.calendar === version) {
        updateSummarySlice('calendarSummary', { todayEventsCount, todayEventsList })
      }
      endRefresh('calendar')
    }
  }, [userId, updateSummarySlice])

  // 4. Remember Summary
  const refreshRememberSummary = useCallback(async () => {
    if (!userId) return
    const version = startRefresh('remember')
    let pendingCount = 0
    let activeRemembers = []

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('remember_items')
          .select('id, title, location, status, given_date, expected_date, notes, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!error && data) {
          const active = data.filter((r) =>
            ['waiting', 'ready'].includes((r.status || '').toLowerCase())
          )
          pendingCount = active.length
          activeRemembers = active.slice(0, 5)
        } else {
          throw error || new Error('Remember query error')
        }
      } else {
        throw new Error('Supabase not configured')
      }
    } catch (err) {
      const localRemembers = getLocalData(`remember_${userId}`, [])
      const active = localRemembers.filter((r) =>
        ['waiting', 'ready'].includes((r.status || '').toLowerCase())
      )
      pendingCount = active.length
      activeRemembers = active.slice(0, 5)
    } finally {
      if (requestVersionsRef.current.remember === version) {
        updateSummarySlice('rememberSummary', { pendingCount, activeRemembers })
      }
      endRefresh('remember')
    }
  }, [userId, updateSummarySlice])

  // 5. Meals Summary
  const refreshMealsSummary = useCallback(async () => {
    if (!userId) return
    const version = startRefresh('meals')
    const todayStr = getTodayStr()
    let todayMeals = []

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('meals')
          .select('id, title, meal_type, scheduled_date, scheduled_time, status, calories')
          .eq('user_id', userId)
          .eq('scheduled_date', todayStr)
          .order('scheduled_time', { ascending: true })

        if (!error && data) {
          todayMeals = data
        } else {
          throw error || new Error('Meals query error')
        }
      } else {
        throw new Error('Supabase not configured')
      }
    } catch (err) {
      const localMeals = getLocalData(`meals_${userId}`, [])
      todayMeals = localMeals.filter((m) => m.scheduled_date === todayStr)
    } finally {
      if (requestVersionsRef.current.meals === version) {
        updateSummarySlice('mealsSummary', { todayMeals })
      }
      endRefresh('meals')
    }
  }, [userId, updateSummarySlice])

  // 6. Workouts Summary
  const refreshWorkoutsSummary = useCallback(async () => {
    if (!userId) return
    const version = startRefresh('workouts')
    const todayStr = getTodayStr()
    let todayWorkouts = []

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('workouts')
          .select('id, title, description, scheduled_date, scheduled_time, duration_minutes, status, notes')
          .eq('user_id', userId)
          .eq('scheduled_date', todayStr)
          .order('scheduled_time', { ascending: true })

        if (!error && data) {
          todayWorkouts = data
        } else {
          throw error || new Error('Workouts query error')
        }
      } else {
        throw new Error('Supabase not configured')
      }
    } catch (err) {
      const localWorkouts = getLocalData(`workouts_${userId}`, [])
      todayWorkouts = localWorkouts.filter((w) => w.scheduled_date === todayStr)
    } finally {
      if (requestVersionsRef.current.workouts === version) {
        updateSummarySlice('workoutsSummary', { todayWorkouts })
      }
      endRefresh('workouts')
    }
  }, [userId, updateSummarySlice])

  // 7. Water Summary
  const refreshWaterSummary = useCallback(async () => {
    if (!userId) return
    const version = startRefresh('water')
    const todayStr = getTodayStr()
    let totalWaterMl = 0
    let targetWaterMl = 2500

    try {
      const savedTarget = localStorage.getItem(`zelo_water_target_${userId}`)
      if (savedTarget) targetWaterMl = parseInt(savedTarget)

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('water_logs')
          .select('amount_ml, logged_date, created_at')
          .eq('user_id', userId)

        if (!error && data) {
          totalWaterMl = data.reduce((acc, curr) => {
            const loggedDate = curr.logged_date || (curr.created_at || '').split('T')[0]
            return loggedDate === todayStr ? acc + (parseInt(curr.amount_ml) || 0) : acc
          }, 0)
        } else {
          throw error || new Error('Water logs query error')
        }
      } else {
        throw new Error('Supabase not configured')
      }
    } catch (err) {
      const localWater = getLocalData(`water_${userId}`, [])
      totalWaterMl = localWater.reduce((acc, curr) => {
        const loggedDate = (curr.logged_date || curr.created_at || '').split('T')[0]
        return loggedDate === todayStr ? acc + (parseInt(curr.amount_ml) || 0) : acc
      }, 0)
    } finally {
      if (requestVersionsRef.current.water === version) {
        updateSummarySlice('waterSummary', { totalWaterMl, targetWaterMl })
      }
      endRefresh('water')
    }
  }, [userId, updateSummarySlice])

  // 8. Sleep Summary
  const refreshSleepSummary = useCallback(async () => {
    if (!userId) return
    const version = startRefresh('sleep')
    let lastNightDuration = 0
    let targetSleepHours = 8

    try {
      const savedTarget = localStorage.getItem(`zelo_sleep_target_${userId}`)
      if (savedTarget) targetSleepHours = parseFloat(savedTarget)

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('sleep_logs')
          .select('sleep_time, wake_time, duration_minutes, quality_rating')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (!error && data && data.length > 0) {
          const item = data[0]
          lastNightDuration = item.duration_minutes
            ? Math.round((item.duration_minutes / 60) * 10) / 10
            : 0
        } else {
          throw error || new Error('Sleep logs query error')
        }
      } else {
        throw new Error('Supabase not configured')
      }
    } catch (err) {
      const localSleep = getLocalData(`sleep_${userId}`, [])
      if (localSleep.length > 0) {
        lastNightDuration = localSleep[0].duration_hours || 0
      }
    } finally {
      if (requestVersionsRef.current.sleep === version) {
        updateSummarySlice('sleepSummary', { lastNightDuration, targetSleepHours })
      }
      endRefresh('sleep')
    }
  }, [userId, updateSummarySlice])

  // 9. Goals Summary
  const refreshGoalsSummary = useCallback(async () => {
    if (!userId) return
    const version = startRefresh('goals')
    let activeCount = 0
    let goalsList = []

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('goals')
          .select('id, title, status, progress_percentage, target_date')
          .eq('user_id', userId)

        if (!error && data) {
          const active = data.filter((g) => g.status !== 'completed' && g.status !== 'archived')
          activeCount = active.length
          goalsList = active.slice(0, 5)
        } else {
          throw error || new Error('Goals query error')
        }
      } else {
        throw new Error('Supabase not configured')
      }
    } catch (err) {
      const localGoals = getLocalData(`goals_${userId}`, [])
      const active = localGoals.filter((g) => g.status !== 'Completed' && g.status !== 'Cancelled')
      activeCount = active.length
      goalsList = active.slice(0, 5)
    } finally {
      if (requestVersionsRef.current.goals === version) {
        updateSummarySlice('goalsSummary', { activeCount, goalsList })
      }
      endRefresh('goals')
    }
  }, [userId, updateSummarySlice])

  // Refresh All Summaries
  const refreshAllSummaries = useCallback(async () => {
    if (!userId) return
    await Promise.allSettled([
      refreshExpensesSummary(),
      refreshTasksSummary(),
      refreshCalendarSummary(),
      refreshRememberSummary(),
      refreshMealsSummary(),
      refreshWorkoutsSummary(),
      refreshWaterSummary(),
      refreshSleepSummary(),
      refreshGoalsSummary()
    ])
  }, [
    refreshExpensesSummary,
    refreshTasksSummary,
    refreshCalendarSummary,
    refreshRememberSummary,
    refreshMealsSummary,
    refreshWorkoutsSummary,
    refreshWaterSummary,
    refreshSleepSummary,
    refreshGoalsSummary,
    userId
  ])

  // Initial load effect on user login or change
  useEffect(() => {
    if (!userId) {
      setSummaryState(INITIAL_SUMMARY_STATE)
      setIsInitialLoading(false)
      setIsRefreshing(false)
      return
    }

    const { cached, hasData } = getInitialCache()

    if (hasData) {
      setSummaryState(cached)
      setIsInitialLoading(false)
    } else {
      setIsInitialLoading(true)
    }

    // Trigger background SWR refresh
    refreshAllSummaries()
  }, [userId, refreshAllSummaries, getInitialCache])

  // DOM Event Bridge for legacy 'zelo_data_updated' compatibility
  useEffect(() => {
    const handleLegacyEvent = (event) => {
      const moduleName = event?.detail?.module?.toLowerCase() || ''
      if (moduleName === 'expenses' || moduleName === 'money') {
        refreshExpensesSummary()
      } else if (moduleName === 'tasks') {
        refreshTasksSummary()
      } else if (moduleName === 'calendar' || moduleName === 'events') {
        refreshCalendarSummary()
      } else if (moduleName === 'remember') {
        refreshRememberSummary()
      } else if (moduleName === 'meals' || moduleName === 'food') {
        refreshMealsSummary()
      } else if (moduleName === 'workouts' || moduleName === 'workout') {
        refreshWorkoutsSummary()
      } else if (moduleName === 'water') {
        refreshWaterSummary()
      } else if (moduleName === 'sleep') {
        refreshSleepSummary()
      } else if (moduleName === 'goals') {
        refreshGoalsSummary()
      } else {
        refreshAllSummaries()
      }
    }

    window.addEventListener('zelo_data_updated', handleLegacyEvent)
    return () => window.removeEventListener('zelo_data_updated', handleLegacyEvent)
  }, [
    refreshExpensesSummary,
    refreshTasksSummary,
    refreshCalendarSummary,
    refreshRememberSummary,
    refreshMealsSummary,
    refreshWorkoutsSummary,
    refreshWaterSummary,
    refreshSleepSummary,
    refreshGoalsSummary,
    refreshAllSummaries
  ])

  const contextValue = {
    ...summaryState,
    isInitialLoading,
    isRefreshing,
    refreshExpensesSummary,
    refreshTasksSummary,
    refreshCalendarSummary,
    refreshRememberSummary,
    refreshMealsSummary,
    refreshWorkoutsSummary,
    refreshWaterSummary,
    refreshSleepSummary,
    refreshGoalsSummary,
    refreshAllSummaries
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
