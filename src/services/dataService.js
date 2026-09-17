import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { notifyDataUpdated } from '../utils/events'
import { mapPriorityToDb, mapPriorityToUi } from '../utils/priority'

// Helper for LocalStorage fallback persistence
export const getLocalData = (key, defaultVal = []) => {
  try {
    const raw = localStorage.getItem(`zelo_${key}`)
    return raw ? JSON.parse(raw) : defaultVal
  } catch (e) {
    console.error('LocalStorage read error:', e)
    return defaultVal
  }
}

export const setLocalData = (key, data) => {
  try {
    localStorage.setItem(`zelo_${key}`, JSON.stringify(data))
  } catch (e) {
    console.error('LocalStorage write error:', e)
  }
}

// -----------------------------------------------------------------------------
// MEALS SERVICE
// -----------------------------------------------------------------------------
export const getMeals = async (userId, targetDate = null) => {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('meals').select('*').eq('user_id', userId)
      if (targetDate) {
        query = query.eq('scheduled_date', targetDate)
      }
      const { data, error } = await query.order('scheduled_time', { ascending: true })
      if (!error && data) return data
      console.warn('Supabase meals table error, using local data fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase meals fetch failed, using fallback:', err.message)
    }
  }

  // Local Storage Mode Fallback
  let allMeals = getLocalData(`meals_${userId}`, [])
  if (targetDate) {
    allMeals = allMeals.filter((m) => m.scheduled_date === targetDate)
  }
  return allMeals.sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''))
}

export const createMeal = async (userId, mealData) => {
  const newMeal = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: mealData.title,
    meal_type: mealData.meal_type || 'lunch',
    description: mealData.description || '',
    scheduled_date: mealData.scheduled_date || new Date().toISOString().split('T')[0],
    scheduled_time: mealData.scheduled_time || '12:00',
    status: 'pending',
    calories: mealData.calories ? parseInt(mealData.calories) : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('meals').insert([newMeal]).select().single()
      if (!error && data) {
        notifyDataUpdated('meals', 'created', data)
        return data
      }
      console.warn('Supabase createMeal table error, using local fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase createMeal failed:', err.message)
    }
  }

  const allMeals = getLocalData(`meals_${userId}`, [])
  allMeals.push(newMeal)
  setLocalData(`meals_${userId}`, allMeals)
  notifyDataUpdated('meals', 'created', newMeal)
  return newMeal
}

export const updateMeal = async (userId, mealId, updates) => {
  const payload = { ...updates, updated_at: new Date().toISOString() }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .update(payload)
        .eq('id', mealId)
        .eq('user_id', userId)
        .select()
        .single()
      if (!error && data) {
        notifyDataUpdated('meals', 'updated', data)
        return data
      }
    } catch (err) {
      console.warn('Supabase updateMeal failed, using fallback:', err.message)
    }
  }

  const allMeals = getLocalData(`meals_${userId}`, [])
  const index = allMeals.findIndex((m) => m.id === mealId)
  if (index !== -1) {
    allMeals[index] = { ...allMeals[index], ...payload }
    setLocalData(`meals_${userId}`, allMeals)
    notifyDataUpdated('meals', 'updated', allMeals[index])
    return allMeals[index]
  }
  notifyDataUpdated('meals', 'updated', payload)
  return payload
}

export const deleteMeal = async (userId, mealId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId)
      if (!error) {
        notifyDataUpdated('meals', 'deleted', { id: mealId })
        return true
      }
    } catch (err) {
      console.warn('Supabase deleteMeal failed, using fallback:', err.message)
    }
  }

  let allMeals = getLocalData(`meals_${userId}`, [])
  allMeals = allMeals.filter((m) => m.id !== mealId)
  setLocalData(`meals_${userId}`, allMeals)
  notifyDataUpdated('meals', 'deleted', { id: mealId })
  return true
}

// -----------------------------------------------------------------------------
// WORKOUTS SERVICE
// -----------------------------------------------------------------------------
export const getWorkouts = async (userId, targetDate = null) => {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('workouts').select('*, workout_exercises(*)').eq('user_id', userId)
      if (targetDate) {
        query = query.eq('scheduled_date', targetDate)
      }
      const { data, error } = await query.order('scheduled_time', { ascending: true })
      if (!error && data) return data
      console.warn('Supabase workouts table error, using local fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase getWorkouts failed:', err.message)
    }
  }

  let allWorkouts = getLocalData(`workouts_${userId}`, [])
  if (targetDate) {
    allWorkouts = allWorkouts.filter((w) => w.scheduled_date === targetDate)
  }
  return allWorkouts
}

export const createWorkout = async (userId, workoutData, exercises = []) => {
  const workoutId = crypto.randomUUID()
  const newWorkout = {
    id: workoutId,
    user_id: userId,
    title: workoutData.title,
    description: workoutData.description || '',
    scheduled_date: workoutData.scheduled_date || new Date().toISOString().split('T')[0],
    scheduled_time: workoutData.scheduled_time || '18:00',
    duration_minutes: workoutData.duration_minutes || 45,
    status: 'planned',
    notes: workoutData.notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    workout_exercises: []
  }

  const preparedExercises = exercises.map((e) => ({
    id: crypto.randomUUID(),
    workout_id: workoutId,
    user_id: userId,
    name: e.name || e.exercise_name || 'Exercise',
    sets: parseInt(e.sets) || 3,
    reps: parseInt(e.reps) || 10,
    weight_kg: parseFloat(e.weight_kg || e.weight || 0),
    notes: e.notes || ''
  }))

  newWorkout.workout_exercises = preparedExercises

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert([{
          id: newWorkout.id,
          user_id: newWorkout.user_id,
          title: newWorkout.title,
          description: newWorkout.description,
          scheduled_date: newWorkout.scheduled_date,
          scheduled_time: newWorkout.scheduled_time,
          duration_minutes: newWorkout.duration_minutes,
          status: newWorkout.status,
          notes: newWorkout.notes
        }])
        .select()
        .single()

      if (!error && data) {
        if (preparedExercises.length > 0) {
          await supabase.from('workout_exercises').insert(preparedExercises)
        }
        const workoutRes = { ...data, workout_exercises: preparedExercises }
        notifyDataUpdated('workouts', 'created', workoutRes)
        return workoutRes
      }
    } catch (err) {
      console.warn('Supabase createWorkout failed:', err.message)
    }
  }

  const allWorkouts = getLocalData(`workouts_${userId}`, [])
  allWorkouts.push(newWorkout)
  setLocalData(`workouts_${userId}`, allWorkouts)
  notifyDataUpdated('workouts', 'created', newWorkout)
  return newWorkout
}

export const updateWorkout = async (userId, workoutId, updates) => {
  const payload = { ...updates, updated_at: new Date().toISOString() }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .update(payload)
        .eq('id', workoutId)
        .eq('user_id', userId)
        .select()
        .single()
      if (!error && data) {
        notifyDataUpdated('workouts', 'updated', data)
        return data
      }
    } catch (err) {
      console.warn('Supabase updateWorkout failed:', err.message)
    }
  }

  const allWorkouts = getLocalData(`workouts_${userId}`, [])
  const index = allWorkouts.findIndex((w) => w.id === workoutId)
  if (index !== -1) {
    allWorkouts[index] = { ...allWorkouts[index], ...payload }
    setLocalData(`workouts_${userId}`, allWorkouts)
    notifyDataUpdated('workouts', 'updated', allWorkouts[index])
    return allWorkouts[index]
  }
  notifyDataUpdated('workouts', 'updated', payload)
  return payload
}

export const deleteWorkout = async (userId, workoutId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', userId)
      if (!error) {
        notifyDataUpdated('workouts', 'deleted', { id: workoutId })
        return true
      }
    } catch (err) {
      console.warn('Supabase deleteWorkout failed:', err.message)
    }
  }

  let allWorkouts = getLocalData(`workouts_${userId}`, [])
  allWorkouts = allWorkouts.filter((w) => w.id !== workoutId)
  setLocalData(`workouts_${userId}`, allWorkouts)
  notifyDataUpdated('workouts', 'deleted', { id: workoutId })
  return true
}

// -----------------------------------------------------------------------------
// REMEMBER ITEMS SERVICE
// -----------------------------------------------------------------------------
export const getRememberItems = async (userId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('remember_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (!error && data) return data
      console.warn('Supabase remember_items table error, using local fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase getRememberItems failed:', err.message)
    }
  }

  return getLocalData(`remember_${userId}`, []).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )
}

export const createRememberItem = async (userId, itemData) => {
  const newItem = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: itemData.title,
    location: itemData.location || '',
    status: itemData.status || 'waiting',
    given_date: itemData.given_date || new Date().toISOString().split('T')[0],
    expected_date: itemData.expected_date || null,
    reminder_time: itemData.reminder_time || null,
    notes: itemData.notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('remember_items').insert([newItem]).select().single()
      if (!error && data) {
        notifyDataUpdated('remember', 'created', data)
        return data
      }
    } catch (err) {
      console.warn('Supabase createRememberItem failed:', err.message)
    }
  }

  const allItems = getLocalData(`remember_${userId}`, [])
  allItems.push(newItem)
  setLocalData(`remember_${userId}`, allItems)
  notifyDataUpdated('remember', 'created', newItem)
  return newItem
}

export const updateRememberItem = async (userId, itemId, updates) => {
  const payload = { ...updates, updated_at: new Date().toISOString() }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('remember_items')
        .update(payload)
        .eq('id', itemId)
        .eq('user_id', userId)
        .select()
        .single()
      if (!error && data) {
        notifyDataUpdated('remember', 'updated', data)
        return data
      }
    } catch (err) {
      console.warn('Supabase updateRememberItem failed:', err.message)
    }
  }

  const allItems = getLocalData(`remember_${userId}`, [])
  const index = allItems.findIndex((i) => i.id === itemId)
  if (index !== -1) {
    allItems[index] = { ...allItems[index], ...payload }
    setLocalData(`remember_${userId}`, allItems)
    notifyDataUpdated('remember', 'updated', allItems[index])
    return allItems[index]
  }
  notifyDataUpdated('remember', 'updated', payload)
  return payload
}

export const deleteRememberItem = async (userId, itemId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('remember_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId)
      if (!error) {
        notifyDataUpdated('remember', 'deleted', { id: itemId })
        return true
      }
    } catch (err) {
      console.warn('Supabase deleteRememberItem failed:', err.message)
    }
  }

  let allItems = getLocalData(`remember_${userId}`, [])
  allItems = allItems.filter((i) => i.id !== itemId)
  setLocalData(`remember_${userId}`, allItems)
  notifyDataUpdated('remember', 'deleted', { id: itemId })
  return true
}

// -----------------------------------------------------------------------------
// EXPENSES SERVICE
// -----------------------------------------------------------------------------
export const getExpenses = async (userId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('spent_at', { ascending: false })
      if (!error && data) return data
      console.warn('Supabase expenses table error, using local fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase getExpenses failed:', err.message)
    }
  }

  return getLocalData(`expenses_${userId}`, []).sort(
    (a, b) => new Date(b.spent_at) - new Date(a.spent_at)
  )
}

export const createExpense = async (userId, expenseData) => {
  const newExpense = {
    id: crypto.randomUUID(),
    user_id: userId,
    account_id: expenseData.account_id || null,
    amount: parseFloat(expenseData.amount),
    category: expenseData.category || 'Food',
    payment_method: expenseData.payment_method || 'UPI',
    description: expenseData.description || '',
    spent_at: expenseData.spent_at || new Date().toISOString(),
    notes: expenseData.notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('expenses').insert([newExpense]).select().single()
      if (!error && data) {
        notifyDataUpdated('expenses', 'created', data)
        return data
      }
    } catch (err) {
      console.warn('Supabase createExpense failed:', err.message)
    }
  }

  const allExpenses = getLocalData(`expenses_${userId}`, [])
  allExpenses.push(newExpense)
  setLocalData(`expenses_${userId}`, allExpenses)
  notifyDataUpdated('expenses', 'created', newExpense)
  return newExpense
}

export const updateExpense = async (userId, expenseId, updates) => {
  const payload = { ...updates, updated_at: new Date().toISOString() }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', expenseId)
        .eq('user_id', userId)
        .select()
        .single()
      if (!error && data) {
        notifyDataUpdated('expenses', 'updated', data)
        return data
      }
    } catch (err) {
      console.warn('Supabase updateExpense failed:', err.message)
    }
  }

  const allExpenses = getLocalData(`expenses_${userId}`, [])
  const index = allExpenses.findIndex((e) => e.id === expenseId)
  if (index !== -1) {
    allExpenses[index] = { ...allExpenses[index], ...payload }
    setLocalData(`expenses_${userId}`, allExpenses)
    notifyDataUpdated('expenses', 'updated', allExpenses[index])
    return allExpenses[index]
  }
  notifyDataUpdated('expenses', 'updated', payload)
  return payload
}

export const deleteExpense = async (userId, expenseId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', userId)
      if (!error) {
        notifyDataUpdated('expenses', 'deleted', { id: expenseId })
        return true
      }
    } catch (err) {
      console.warn('Supabase deleteExpense failed:', err.message)
    }
  }

  let allExpenses = getLocalData(`expenses_${userId}`, [])
  allExpenses = allExpenses.filter((e) => e.id !== expenseId)
  setLocalData(`expenses_${userId}`, allExpenses)
  notifyDataUpdated('expenses', 'deleted', { id: expenseId })
  return true
}

// -----------------------------------------------------------------------------
// USER PROFILE AND SETTINGS SERVICE
// -----------------------------------------------------------------------------
// USER PROFILE AND SETTINGS SERVICE
// -----------------------------------------------------------------------------
export const getUserProfile = async (userId) => {
  if (!userId) return null
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) return data
      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase profiles fetch error:', error?.message)
      }
    } catch (err) {
      console.warn('Supabase getUserProfile failed:', err.message)
    }
  }

  return getLocalData(`profile_${userId}`, null)
}

export const createUserProfile = async (userId, initialData = {}) => {
  if (!userId) return null

  const newProfile = {
    id: userId,
    full_name: initialData.full_name || 'ZELO User',
    role: 'user',
    avatar_url: null
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .maybeSingle()

      if (!error && data) return data
      if (error) {
        console.warn('Supabase createUserProfile error:', error?.message)
      }
    } catch (err) {
      console.warn('Supabase createUserProfile failed:', err.message)
    }
  }

  setLocalData(`profile_${userId}`, newProfile)
  return newProfile
}

export const updateUserProfile = async (userId, profileData) => {
  if (!userId) return null

  // Strip id, role, created_at, updated_at from client update payload
  const { id, role, created_at, updated_at, ...cleanData } = profileData

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(cleanData)
        .eq('id', userId)
        .select()
        .maybeSingle()

      if (!error && data) return data
      if (error) {
        console.error('Supabase updateUserProfile error:', error?.message)
        throw error
      }
    } catch (err) {
      console.warn('Supabase updateUserProfile failed:', err.message)
      throw err
    }
  }

  const current = await getUserProfile(userId)
  const updated = { ...current, ...cleanData }
  setLocalData(`profile_${userId}`, updated)
  notifyDataUpdated('profile', 'updated', updated)
  return updated
}

export const getUserSettings = async (userId) => {
  if (!userId) return null
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (!error && data) return data
      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase user_settings fetch error:', error?.message)
      }
    } catch (err) {
      console.warn('Supabase getUserSettings failed:', err.message)
    }
  }

  return getLocalData(`settings_${userId}`, null)
}

export const createUserSettings = async (userId, initialSettings = {}) => {
  if (!userId) return null

  const newSettings = {
    user_id: userId,
    wake_time: initialSettings.wake_time || '07:00',
    sleep_time: initialSettings.sleep_time || '23:00',
    water_target_ml: initialSettings.water_target_ml || 2500,
    daily_expense_budget: initialSettings.daily_expense_budget || 1000.00,
    notifications_enabled: initialSettings.notifications_enabled || false,
    notification_settings: initialSettings.notification_settings || {
      daily_reminder: true,
      daily_reminder_time: '08:00',
      meal_reminders: true,
      workout_reminder: true,
      workout_reminder_time: '18:00',
      water_reminder: true,
      expense_reminder: true,
      expense_reminder_time: '21:00',
      goal_reminders: true
    },
    theme: initialSettings.theme || 'light',
    onboarding_completed: initialSettings.onboarding_completed ?? false
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert([newSettings])
        .select()
        .maybeSingle()

      if (!error && data) return data
      if (error) {
        console.warn('Supabase createUserSettings error:', error?.message)
      }
    } catch (err) {
      console.warn('Supabase createUserSettings failed:', err.message)
    }
  }

  setLocalData(`settings_${userId}`, newSettings)
  return newSettings
}

export const updateUserSettings = async (userId, settingsData) => {
  if (!userId) return null

  // Strip user_id, id, created_at, updated_at from client update payload
  const { user_id, id, created_at, updated_at, ...cleanSettings } = settingsData

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(cleanSettings)
        .eq('user_id', userId)
        .select()
        .maybeSingle()

      if (!error && data) return data
      if (error) {
        console.error('Supabase updateUserSettings error:', error?.message)
        if (error.code === 'PGRST204') {
          console.warn('Supabase schema cache missing column, persisting to local fallback:', error.message)
        } else {
          throw error
        }
      }
    } catch (err) {
      if (err?.code !== 'PGRST204') {
        console.warn('Supabase updateUserSettings failed:', err.message)
        throw err
      }
    }
  }

  const current = await getUserSettings(userId)
  const updated = { ...current, ...cleanSettings }
  setLocalData(`settings_${userId}`, updated)
  notifyDataUpdated('settings', 'updated', updated)
  return updated
}

// -----------------------------------------------------------------------------
// TASKS SERVICE
// -----------------------------------------------------------------------------
export const getTasks = async (userId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase getTasks error:', error.message)
        throw error
      }

      if (data) {
        return data.map((task) => {
          let dueDateStr = task.due_date
          let dueTimeStr = null
          if (task.due_date && typeof task.due_date === 'string' && task.due_date.includes('T')) {
            const parts = task.due_date.split('T')
            dueDateStr = parts[0]
            if (parts[1]) {
              dueTimeStr = parts[1].slice(0, 5)
            }
          }
          return {
            ...task,
            priority: mapPriorityToUi(task.priority),
            due_date: dueDateStr,
            due_time: dueTimeStr
          }
        })
      }
    } catch (err) {
      console.warn('Supabase getTasks failed, using local fallback:', err.message)
    }
  }

  return getLocalData(`tasks_${userId}`, []).sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )
}

export const createTask = async (userId, taskData) => {
  let formattedDueDate = taskData.due_date || null
  if (formattedDueDate && taskData.due_time && !formattedDueDate.includes('T')) {
    formattedDueDate = `${formattedDueDate}T${taskData.due_time}:00`
  }

  const dbPayload = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: taskData.title,
    description: taskData.description || '',
    priority: mapPriorityToDb(taskData.priority),
    status: taskData.status || 'pending',
    due_date: formattedDueDate,
    category: taskData.category || 'general'
  }

  const localTask = {
    ...dbPayload,
    due_time: taskData.due_time || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([dbPayload])
        .select()
        .single()

      if (error) {
        console.error('Supabase createTask error:', error.message)
        throw error
      }

      if (data) {
        let dueDateStr = data.due_date
        let dueTimeStr = taskData.due_time || null
        if (data.due_date && typeof data.due_date === 'string' && data.due_date.includes('T')) {
          const parts = data.due_date.split('T')
          dueDateStr = parts[0]
          if (!dueTimeStr && parts[1]) {
            dueTimeStr = parts[1].slice(0, 5)
          }
        }
        const taskRes = {
          ...data,
          due_date: dueDateStr,
          due_time: dueTimeStr
        }
        notifyDataUpdated('tasks', 'created', taskRes)
        return taskRes
      }
    } catch (err) {
      console.error('Supabase createTask failed:', err.message)
      throw err
    }
  }

  const allTasks = getLocalData(`tasks_${userId}`, [])
  allTasks.push(localTask)
  setLocalData(`tasks_${userId}`, allTasks)
  notifyDataUpdated('tasks', 'created', localTask)
  return localTask
}

export const updateTask = async (userId, taskId, updates) => {
  const dbPayload = {}
  if (updates.title !== undefined) dbPayload.title = updates.title
  if (updates.description !== undefined) dbPayload.description = updates.description
  if (updates.priority !== undefined) dbPayload.priority = mapPriorityToDb(updates.priority)
  if (updates.status !== undefined) dbPayload.status = updates.status
  if (updates.category !== undefined) dbPayload.category = updates.category

  if (updates.due_date !== undefined || updates.due_time !== undefined) {
    let rawDate = updates.due_date
    let rawTime = updates.due_time
    if (rawDate && rawTime && !rawDate.includes('T')) {
      dbPayload.due_date = `${rawDate}T${rawTime}:00`
    } else {
      dbPayload.due_date = rawDate || null
    }
  }

  dbPayload.updated_at = new Date().toISOString()

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(dbPayload)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Supabase updateTask error:', error.message)
        throw error
      }

      if (data) {
        let dueDateStr = data.due_date
        let dueTimeStr = updates.due_time || null
        if (data.due_date && typeof data.due_date === 'string' && data.due_date.includes('T')) {
          const parts = data.due_date.split('T')
          dueDateStr = parts[0]
          if (!dueTimeStr && parts[1]) {
            dueTimeStr = parts[1].slice(0, 5)
          }
        }
        const updatedTaskRes = {
          ...data,
          due_date: dueDateStr,
          due_time: dueTimeStr
        }
        notifyDataUpdated('tasks', 'updated', updatedTaskRes)
        return updatedTaskRes
      }
    } catch (err) {
      console.error('Supabase updateTask failed:', err.message)
      throw err
    }
  }

  const allTasks = getLocalData(`tasks_${userId}`, [])
  const index = allTasks.findIndex((t) => t.id === taskId)
  if (index !== -1) {
    allTasks[index] = { ...allTasks[index], ...updates, ...dbPayload }
    setLocalData(`tasks_${userId}`, allTasks)
    notifyDataUpdated('tasks', 'updated', allTasks[index])
    return allTasks[index]
  }
  notifyDataUpdated('tasks', 'updated', { ...updates, ...dbPayload })
  return { ...updates, ...dbPayload }
}

export const deleteTask = async (userId, taskId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId)

      if (error) {
        console.error('Supabase deleteTask error:', error.message)
        throw error
      }
      notifyDataUpdated('tasks', 'deleted', { id: taskId })
      return true
    } catch (err) {
      console.error('Supabase deleteTask failed:', err.message)
      throw err
    }
  }

  let allTasks = getLocalData(`tasks_${userId}`, [])
  allTasks = allTasks.filter((t) => t.id !== taskId)
  setLocalData(`tasks_${userId}`, allTasks)
  notifyDataUpdated('tasks', 'deleted', { id: taskId })
  return true
}


// -----------------------------------------------------------------------------
// PERSONAL EVENTS SERVICE
// -----------------------------------------------------------------------------
export const getEvents = async (userId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true })

      if (!error && data) {
        return data.map((item) => {
          const startDate = item.start_time ? item.start_time.split('T')[0] : ''
          const startTime = item.start_time && item.start_time.includes('T')
            ? item.start_time.split('T')[1].substring(0, 5)
            : '09:00'
          const endTime = item.end_time && item.end_time.includes('T')
            ? item.end_time.split('T')[1].substring(0, 5)
            : '10:00'

          return {
            id: item.id,
            user_id: item.user_id,
            title: item.title,
            event_date: startDate,
            start_time: startTime,
            end_time: endTime,
            is_all_day: Boolean(item.is_all_day),
            category: item.category || 'Personal',
            location: item.location || '',
            notes: item.description || '',
            status: 'pending',
            created_at: item.created_at
          }
        })
      }
      if (error) console.warn('Supabase calendar_events fetch error:', error?.message)
    } catch (err) {
      console.warn('Supabase getEvents failed:', err.message)
    }
  }

  return getLocalData(`events_${userId}`, []).sort(
    (a, b) => new Date(a.event_date || 0) - new Date(b.event_date || 0)
  )
}

export const createEvent = async (userId, eventData) => {
  const eventDate = eventData.event_date || new Date().toISOString().split('T')[0]
  const startTime = eventData.start_time || '09:00'
  const endTime = eventData.end_time || '10:00'

  const startTimeObj = new Date(`${eventDate}T${startTime}:00`).toISOString()
  const endTimeObj = new Date(`${eventDate}T${endTime}:00`).toISOString()

  const dbPayload = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: eventData.title,
    description: eventData.notes || eventData.description || '',
    start_time: startTimeObj,
    end_time: endTimeObj,
    location: eventData.location || '',
    is_all_day: Boolean(eventData.is_all_day),
    category: eventData.category || 'general'
  }

  const localItem = {
    id: dbPayload.id,
    user_id: userId,
    title: eventData.title,
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    is_all_day: Boolean(eventData.is_all_day),
    category: eventData.category || 'Personal',
    location: eventData.location || '',
    notes: eventData.notes || '',
    status: 'pending',
    created_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('calendar_events').insert([dbPayload]).select().single()
    if (error) {
      console.error('Supabase createEvent error:', error.message)
      throw error
    }
    if (data) {
      notifyDataUpdated('calendar', 'created', localItem)
      return localItem
    }
  }

  const allEvents = getLocalData(`events_${userId}`, [])
  allEvents.push(localItem)
  setLocalData(`events_${userId}`, allEvents)
  notifyDataUpdated('calendar', 'created', localItem)
  return localItem
}

export const updateEvent = async (userId, eventId, updates) => {
  const payload = {}

  if (updates.title) payload.title = updates.title
  if (updates.notes !== undefined || updates.description !== undefined) {
    payload.description = updates.notes !== undefined ? updates.notes : updates.description
  }
  if (updates.location !== undefined) payload.location = updates.location
  if (updates.is_all_day !== undefined) payload.is_all_day = Boolean(updates.is_all_day)
  if (updates.category) payload.category = updates.category

  const eventDate = updates.event_date || new Date().toISOString().split('T')[0]

  if (updates.start_time) {
    payload.start_time = updates.start_time.includes('T')
      ? updates.start_time
      : new Date(`${eventDate}T${updates.start_time}:00`).toISOString()
  }

  if (updates.end_time) {
    payload.end_time = updates.end_time.includes('T')
      ? updates.end_time
      : new Date(`${eventDate}T${updates.end_time}:00`).toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(payload)
      .eq('id', eventId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase updateEvent error:', error.message)
      throw error
    }
    if (data) {
      notifyDataUpdated('calendar', 'updated', data)
      return data
    }
  }

  const allEvents = getLocalData(`events_${userId}`, [])
  const index = allEvents.findIndex((e) => e.id === eventId)
  if (index !== -1) {
    allEvents[index] = { ...allEvents[index], ...updates }
    setLocalData(`events_${userId}`, allEvents)
    notifyDataUpdated('calendar', 'updated', allEvents[index])
    return allEvents[index]
  }
  notifyDataUpdated('calendar', 'updated', payload)
  return payload
}

export const deleteEvent = async (userId, eventId) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId)
    if (!error) {
      notifyDataUpdated('calendar', 'deleted', { id: eventId })
      return true
    }
  }

  let allEvents = getLocalData(`events_${userId}`, [])
  allEvents = allEvents.filter((e) => e.id !== eventId)
  setLocalData(`events_${userId}`, allEvents)
  notifyDataUpdated('calendar', 'deleted', { id: eventId })
  return true
}

// -----------------------------------------------------------------------------
// WATER LOGS SERVICE
// -----------------------------------------------------------------------------
export const getWaterLogs = async (userId, targetDate = null) => {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('water_logs')
        .select('id, user_id, amount_ml, logged_date, logged_time, created_at')
        .eq('user_id', userId)
      if (targetDate) {
        query = query.eq('logged_date', targetDate)
      }
      const { data, error } = await query.order('created_at', { ascending: false })
      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          amount_ml: item.amount_ml,
          logged_date: item.logged_date || targetDate,
          logged_time: item.logged_time || '12:00',
          created_at: item.created_at
        }))
      }
      if (error) console.warn('Supabase water_logs fetch error:', error?.message)
    } catch (err) {
      console.warn('Supabase getWaterLogs failed:', err.message)
    }
  }

  let allLogs = getLocalData(`water_${userId}`, [])
  if (targetDate) {
    allLogs = allLogs.filter((w) => (w.logged_date || w.created_at || '').split('T')[0] === targetDate)
  }
  return allLogs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
}

export const addWaterLog = async (userId, logData) => {
  const lDate = logData.logged_date || new Date().toISOString().split('T')[0]
  const lTime = logData.logged_time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

  const dbPayload = {
    id: crypto.randomUUID(),
    user_id: userId,
    amount_ml: parseInt(logData.amount_ml || 250),
    logged_date: lDate,
    logged_time: lTime.length === 5 ? lTime : '12:00'
  }

  const localLog = {
    ...dbPayload,
    created_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('water_logs').insert([dbPayload]).select().single()
    if (error) {
      console.error('Supabase addWaterLog error:', error.message)
      throw error
    }
    if (data) {
      notifyDataUpdated('water', 'created', localLog)
      return localLog
    }
  }

  const allLogs = getLocalData(`water_${userId}`, [])
  allLogs.push(localLog)
  setLocalData(`water_${userId}`, allLogs)
  notifyDataUpdated('water', 'created', localLog)
  return localLog
}

export const updateWaterLog = async (userId, logId, updates) => {
  const payload = {}

  if (updates.amount_ml) payload.amount_ml = parseInt(updates.amount_ml)
  if (updates.logged_date) payload.logged_date = updates.logged_date
  if (updates.logged_time) payload.logged_time = updates.logged_time

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('water_logs')
      .update(payload)
      .eq('id', logId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase updateWaterLog error:', error.message)
      throw error
    }
    if (data) {
      notifyDataUpdated('water', 'updated', data)
      return data
    }
  }

  const allLogs = getLocalData(`water_${userId}`, [])
  const index = allLogs.findIndex((w) => w.id === logId)
  if (index !== -1) {
    allLogs[index] = { ...allLogs[index], ...updates }
    setLocalData(`water_${userId}`, allLogs)
    notifyDataUpdated('water', 'updated', allLogs[index])
    return allLogs[index]
  }
  notifyDataUpdated('water', 'updated', payload)
  return payload
}

export const deleteWaterLog = async (userId, logId) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('water_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId)
    if (!error) {
      notifyDataUpdated('water', 'deleted', { id: logId })
      return true
    }
  }

  let allLogs = getLocalData(`water_${userId}`, [])
  allLogs = allLogs.filter((w) => w.id !== logId)
  setLocalData(`water_${userId}`, allLogs)
  notifyDataUpdated('water', 'deleted', { id: logId })
  return true
}

export const getWaterTarget = async (userId) => {
  const target = localStorage.getItem(`zelo_water_target_${userId}`)
  return target ? parseInt(target) : 2500
}

export const saveWaterTarget = async (userId, targetMl) => {
  localStorage.setItem(`zelo_water_target_${userId}`, String(targetMl))
  return parseInt(targetMl)
}

// -----------------------------------------------------------------------------
// SLEEP LOGS SERVICE
// -----------------------------------------------------------------------------
export const getSleepLogs = async (userId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('id, user_id, sleep_time, wake_time, duration_minutes, quality_rating, notes, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        const qualityMap = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' }
        return data.map((item) => {
          const startDate = item.sleep_time ? item.sleep_time.split('T')[0] : ''
          const startTime = item.sleep_time && item.sleep_time.includes('T')
            ? item.sleep_time.split('T')[1].substring(0, 5)
            : '23:00'
          const endTime = item.wake_time && item.wake_time.includes('T')
            ? item.wake_time.split('T')[1].substring(0, 5)
            : '07:00'
          const durationHours = item.duration_minutes
            ? Math.round((item.duration_minutes / 60) * 10) / 10
            : 8.0

          const qualityStr = typeof item.quality_rating === 'number'
            ? (qualityMap[item.quality_rating] || 'Good')
            : 'Good'

          return {
            id: item.id,
            user_id: item.user_id,
            sleep_date: startDate,
            bedtime: startTime,
            wake_time: endTime,
            duration_hours: durationHours,
            quality: qualityStr,
            notes: item.notes || '',
            created_at: item.created_at
          }
        })
      }
      if (error) console.warn('Supabase sleep_logs table error, using local fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase getSleepLogs failed:', err.message)
    }
  }

  return getLocalData(`sleep_${userId}`, []).sort(
    (a, b) => new Date(b.sleep_date || b.created_at || 0) - new Date(a.sleep_date || a.created_at || 0)
  )
}

export const addSleepLog = async (userId, logData) => {
  const sDate = logData.sleep_date || new Date().toISOString().split('T')[0]
  const bTime = logData.bedtime || '23:00'
  const wTime = logData.wake_time || '07:00'

  const sleepStart = new Date(`${sDate}T${bTime}:00`)
  let sleepEnd = new Date(`${sDate}T${wTime}:00`)
  if (sleepEnd <= sleepStart) {
    sleepEnd.setDate(sleepEnd.getDate() + 1)
  }

  const durationMinutes = Math.max(0, Math.round((sleepEnd.getTime() - sleepStart.getTime()) / 60000))

  const qualityStringMap = { 'Poor': 1, 'Fair': 2, 'Good': 3, 'Very Good': 4, 'Excellent': 5 }
  const qualityNum = typeof logData.quality === 'number'
    ? logData.quality
    : (qualityStringMap[logData.quality] || 3)

  const dbPayload = {
    id: crypto.randomUUID(),
    user_id: userId,
    sleep_time: sleepStart.toISOString(),
    wake_time: sleepEnd.toISOString(),
    duration_minutes: durationMinutes,
    quality_rating: qualityNum,
    notes: logData.notes || ''
  }

  const localLog = {
    id: dbPayload.id,
    user_id: userId,
    sleep_date: sDate,
    bedtime: bTime,
    wake_time: wTime,
    duration_hours: Math.round((durationMinutes / 60) * 10) / 10,
    quality: logData.quality || 'Good',
    notes: logData.notes || '',
    created_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('sleep_logs').insert([dbPayload]).select().single()
    if (error) {
      console.error('Supabase addSleepLog error:', error.message)
      throw error
    }
    if (data) {
      notifyDataUpdated('sleep', 'created', localLog)
      return localLog
    }
  }

  const allLogs = getLocalData(`sleep_${userId}`, [])
  allLogs.push(localLog)
  setLocalData(`sleep_${userId}`, allLogs)
  notifyDataUpdated('sleep', 'created', localLog)
  return localLog
}

export const updateSleepLog = async (userId, logId, updates) => {
  const payload = {}

  if (updates.notes !== undefined) payload.notes = updates.notes
  if (updates.quality) {
    const qualityStringMap = { 'Poor': 1, 'Fair': 2, 'Good': 3, 'Very Good': 4, 'Excellent': 5 }
    payload.quality_rating = typeof updates.quality === 'number'
      ? updates.quality
      : (qualityStringMap[updates.quality] || 3)
  }

  if (updates.sleep_date || updates.bedtime || updates.wake_time) {
    const sDate = updates.sleep_date || new Date().toISOString().split('T')[0]
    const bTime = updates.bedtime || '23:00'
    const wTime = updates.wake_time || '07:00'

    const sleepStart = new Date(`${sDate}T${bTime}:00`)
    let sleepEnd = new Date(`${sDate}T${wTime}:00`)
    if (sleepEnd <= sleepStart) {
      sleepEnd.setDate(sleepEnd.getDate() + 1)
    }

    payload.sleep_time = sleepStart.toISOString()
    payload.wake_time = sleepEnd.toISOString()
    payload.duration_minutes = Math.max(0, Math.round((sleepEnd.getTime() - sleepStart.getTime()) / 60000))
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sleep_logs')
      .update(payload)
      .eq('id', logId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase updateSleepLog error:', error.message)
      throw error
    }
    if (data) {
      notifyDataUpdated('sleep', 'updated', data)
      return data
    }
  }

  const allLogs = getLocalData(`sleep_${userId}`, [])
  const index = allLogs.findIndex((s) => s.id === logId)
  if (index !== -1) {
    allLogs[index] = { ...allLogs[index], ...updates }
    setLocalData(`sleep_${userId}`, allLogs)
    notifyDataUpdated('sleep', 'updated', allLogs[index])
    return allLogs[index]
  }
  notifyDataUpdated('sleep', 'updated', payload)
  return payload
}

export const deleteSleepLog = async (userId, logId) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId)

    if (!error) {
      notifyDataUpdated('sleep', 'deleted', { id: logId })
      return true
    }
  }

  let allLogs = getLocalData(`sleep_${userId}`, [])
  allLogs = allLogs.filter((s) => s.id !== logId)
  setLocalData(`sleep_${userId}`, allLogs)
  notifyDataUpdated('sleep', 'deleted', { id: logId })
  return true
}

export const getSleepTarget = async (userId) => {
  const target = localStorage.getItem(`zelo_sleep_target_${userId}`)
  return target ? parseFloat(target) : 8.0
}

export const saveSleepTarget = async (userId, targetHours) => {
  localStorage.setItem(`zelo_sleep_target_${userId}`, String(targetHours))
  return parseFloat(targetHours)
}

// -----------------------------------------------------------------------------
// GOALS SERVICE
// -----------------------------------------------------------------------------
export const getGoals = async (userId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('id, user_id, title, description, target_date, status, progress_percentage, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (!error && data) {
        return data.map((g) => {
          const pct = typeof g.progress_percentage === 'number' ? g.progress_percentage : 0

          const statusMap = {
            'not_started': 'Not Started',
            'in_progress': 'In Progress',
            'active': 'In Progress',
            'completed': 'Completed',
            'archived': 'Archived'
          }
          const statusStr = statusMap[g.status] || (pct >= 100 ? 'Completed' : 'In Progress')

          return {
            id: g.id,
            user_id: g.user_id,
            title: g.title,
            description: g.description || '',
            target_date: g.target_date,
            progress_percentage: pct,
            status: statusStr,
            created_at: g.created_at,
            updated_at: g.updated_at
          }
        })
      }
      if (error) {
        console.warn('Supabase goals table error, using local fallback:', error?.message)
      }
    } catch (err) {
      console.warn('Supabase getGoals failed:', err.message)
    }
  }

  return getLocalData(`goals_${userId}`, []).sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )
}

export const createGoal = async (userId, goalData) => {
  const progressPct = Math.min(100, Math.max(0, parseInt(goalData.progress_percentage || 0)))

  let dbStatus = 'in_progress'
  if (progressPct >= 100 || goalData.status === 'Completed') {
    dbStatus = 'completed'
  } else if (goalData.status === 'Not Started') {
    dbStatus = 'not_started'
  }

  // Strictly valid database columns for public.goals table
  const dbPayload = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: goalData.title,
    description: goalData.description || '',
    target_date: goalData.target_date || null,
    progress_percentage: progressPct,
    status: dbStatus
  }

  const localGoal = {
    id: dbPayload.id,
    user_id: userId,
    title: goalData.title,
    description: goalData.description || '',
    target_date: dbPayload.target_date,
    progress_percentage: progressPct,
    status: progressPct >= 100 ? 'Completed' : (goalData.status || 'In Progress'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('goals').insert([dbPayload]).select().single()
    if (error) {
      console.error('Supabase createGoal error:', error.message)
      throw error
    }
    if (data) {
      notifyDataUpdated('goals', 'created', localGoal)
      return localGoal
    }
  }

  const allGoals = getLocalData(`goals_${userId}`, [])
  allGoals.push(localGoal)
  setLocalData(`goals_${userId}`, allGoals)
  notifyDataUpdated('goals', 'created', localGoal)
  return localGoal
}

export const updateGoal = async (userId, goalId, updates) => {
  const payload = { updated_at: new Date().toISOString() }

  if (updates.title) payload.title = updates.title
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.target_date !== undefined) payload.target_date = updates.target_date

  if (typeof updates.progress_percentage === 'number') {
    const pct = Math.min(100, Math.max(0, updates.progress_percentage))
    payload.progress_percentage = pct
    if (pct >= 100) {
      payload.status = 'completed'
    } else if (updates.status === 'In Progress') {
      payload.status = 'in_progress'
    }
  }

  if (updates.status) {
    if (updates.status === 'Completed') payload.status = 'completed'
    else if (updates.status === 'Not Started') payload.status = 'not_started'
    else if (updates.status === 'In Progress') payload.status = 'in_progress'
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('goals')
      .update(payload)
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase updateGoal error:', error.message)
      throw error
    }
    if (data) {
      notifyDataUpdated('goals', 'updated', data)
      return data
    }
  }

  const allGoals = getLocalData(`goals_${userId}`, [])
  const index = allGoals.findIndex((g) => g.id === goalId)
  if (index !== -1) {
    allGoals[index] = { ...allGoals[index], ...updates, updated_at: new Date().toISOString() }
    setLocalData(`goals_${userId}`, allGoals)
    notifyDataUpdated('goals', 'updated', allGoals[index])
    return allGoals[index]
  }
  notifyDataUpdated('goals', 'updated', payload)
  return payload
}

export const deleteGoal = async (userId, goalId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId)
      if (!error) {
        notifyDataUpdated('goals', 'deleted', { id: goalId })
        return true
      }
    } catch (err) {
      console.warn('Supabase deleteGoal failed:', err.message)
    }
  }

  let allGoals = getLocalData(`goals_${userId}`, [])
  allGoals = allGoals.filter((g) => g.id !== goalId)
  setLocalData(`goals_${userId}`, allGoals)
  notifyDataUpdated('goals', 'deleted', { id: goalId })
  return true
}


