import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Helper for LocalStorage fallback persistence
const getLocalData = (key, defaultVal = []) => {
  try {
    const raw = localStorage.getItem(`zelo_${key}`)
    return raw ? JSON.parse(raw) : defaultVal
  } catch (e) {
    console.error('LocalStorage read error:', e)
    return defaultVal
  }
}

const setLocalData = (key, data) => {
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
      if (!error && data) return data
      console.warn('Supabase createMeal table error, using local fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase createMeal failed:', err.message)
    }
  }

  const allMeals = getLocalData(`meals_${userId}`, [])
  allMeals.push(newMeal)
  setLocalData(`meals_${userId}`, allMeals)
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
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase updateMeal failed, using fallback:', err.message)
    }
  }

  const allMeals = getLocalData(`meals_${userId}`, [])
  const index = allMeals.findIndex((m) => m.id === mealId)
  if (index !== -1) {
    allMeals[index] = { ...allMeals[index], ...payload }
    setLocalData(`meals_${userId}`, allMeals)
    return allMeals[index]
  }
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
      if (!error) return true
    } catch (err) {
      console.warn('Supabase deleteMeal failed, using fallback:', err.message)
    }
  }

  let allMeals = getLocalData(`meals_${userId}`, [])
  allMeals = allMeals.filter((m) => m.id !== mealId)
  setLocalData(`meals_${userId}`, allMeals)
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
    name: e.name,
    sets: parseInt(e.sets) || 3,
    reps: parseInt(e.reps) || 10,
    weight_kg: parseFloat(e.weight_kg) || 0,
    completed_sets: 0,
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
        return { ...data, workout_exercises: preparedExercises }
      }
    } catch (err) {
      console.warn('Supabase createWorkout failed:', err.message)
    }
  }

  const allWorkouts = getLocalData(`workouts_${userId}`, [])
  allWorkouts.push(newWorkout)
  setLocalData(`workouts_${userId}`, allWorkouts)
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
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase updateWorkout failed:', err.message)
    }
  }

  const allWorkouts = getLocalData(`workouts_${userId}`, [])
  const index = allWorkouts.findIndex((w) => w.id === workoutId)
  if (index !== -1) {
    allWorkouts[index] = { ...allWorkouts[index], ...payload }
    setLocalData(`workouts_${userId}`, allWorkouts)
    return allWorkouts[index]
  }
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
      if (!error) return true
    } catch (err) {
      console.warn('Supabase deleteWorkout failed:', err.message)
    }
  }

  let allWorkouts = getLocalData(`workouts_${userId}`, [])
  allWorkouts = allWorkouts.filter((w) => w.id !== workoutId)
  setLocalData(`workouts_${userId}`, allWorkouts)
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
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase createRememberItem failed:', err.message)
    }
  }

  const allItems = getLocalData(`remember_${userId}`, [])
  allItems.push(newItem)
  setLocalData(`remember_${userId}`, allItems)
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
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase updateRememberItem failed:', err.message)
    }
  }

  const allItems = getLocalData(`remember_${userId}`, [])
  const index = allItems.findIndex((i) => i.id === itemId)
  if (index !== -1) {
    allItems[index] = { ...allItems[index], ...payload }
    setLocalData(`remember_${userId}`, allItems)
    return allItems[index]
  }
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
      if (!error) return true
    } catch (err) {
      console.warn('Supabase deleteRememberItem failed:', err.message)
    }
  }

  let allItems = getLocalData(`remember_${userId}`, [])
  allItems = allItems.filter((i) => i.id !== itemId)
  setLocalData(`remember_${userId}`, allItems)
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
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase createExpense failed:', err.message)
    }
  }

  const allExpenses = getLocalData(`expenses_${userId}`, [])
  allExpenses.push(newExpense)
  setLocalData(`expenses_${userId}`, allExpenses)
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
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase updateExpense failed:', err.message)
    }
  }

  const allExpenses = getLocalData(`expenses_${userId}`, [])
  const index = allExpenses.findIndex((e) => e.id === expenseId)
  if (index !== -1) {
    allExpenses[index] = { ...allExpenses[index], ...payload }
    setLocalData(`expenses_${userId}`, allExpenses)
    return allExpenses[index]
  }
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
      if (!error) return true
    } catch (err) {
      console.warn('Supabase deleteExpense failed:', err.message)
    }
  }

  let allExpenses = getLocalData(`expenses_${userId}`, [])
  allExpenses = allExpenses.filter((e) => e.id !== expenseId)
  setLocalData(`expenses_${userId}`, allExpenses)
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
        throw error
      }
    } catch (err) {
      console.warn('Supabase updateUserSettings failed:', err.message)
      throw err
    }
  }

  const current = await getUserSettings(userId)
  const updated = { ...current, ...cleanSettings }
  setLocalData(`settings_${userId}`, updated)
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
      if (!error && data) return data
      console.warn('Supabase tasks table error, using local fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase getTasks failed:', err.message)
    }
  }

  return getLocalData(`tasks_${userId}`, []).sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )
}

export const createTask = async (userId, taskData) => {
  const newTask = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: taskData.title,
    description: taskData.description || '',
    due_date: taskData.due_date || null,
    due_time: taskData.due_time || null,
    priority: taskData.priority || 'normal',
    status: taskData.status || 'pending',
    completed_at: taskData.status === 'completed' ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('tasks').insert([newTask]).select().single()
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase createTask failed:', err.message)
    }
  }

  const allTasks = getLocalData(`tasks_${userId}`, [])
  allTasks.push(newTask)
  setLocalData(`tasks_${userId}`, allTasks)
  return newTask
}

export const updateTask = async (userId, taskId, updates) => {
  const payload = { ...updates, updated_at: new Date().toISOString() }
  if (updates.status === 'completed' && !updates.completed_at) {
    payload.completed_at = new Date().toISOString()
  } else if (updates.status && updates.status !== 'completed') {
    payload.completed_at = null
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single()
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase updateTask failed:', err.message)
    }
  }

  const allTasks = getLocalData(`tasks_${userId}`, [])
  const index = allTasks.findIndex((t) => t.id === taskId)
  if (index !== -1) {
    allTasks[index] = { ...allTasks[index], ...payload }
    setLocalData(`tasks_${userId}`, allTasks)
    return allTasks[index]
  }
  return payload
}

export const deleteTask = async (userId, taskId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId)
      if (!error) return true
    } catch (err) {
      console.warn('Supabase deleteTask failed:', err.message)
    }
  }

  let allTasks = getLocalData(`tasks_${userId}`, [])
  allTasks = allTasks.filter((t) => t.id !== taskId)
  setLocalData(`tasks_${userId}`, allTasks)
  return true
}

// -----------------------------------------------------------------------------
// PERSONAL EVENTS SERVICE
// -----------------------------------------------------------------------------
export const getEvents = async (userId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: true })
      if (!error && data) return data
      console.warn('Supabase user_events table error, using local fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase getEvents failed:', err.message)
    }
  }

  return getLocalData(`events_${userId}`, []).sort(
    (a, b) => new Date(a.event_date || 0) - new Date(b.event_date || 0)
  )
}

export const createEvent = async (userId, eventData) => {
  const newEvent = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: eventData.title,
    event_date: eventData.event_date || new Date().toISOString().split('T')[0],
    start_time: eventData.start_time || '09:00',
    end_time: eventData.end_time || '10:00',
    is_all_day: eventData.is_all_day ?? false,
    category: eventData.category || 'Personal',
    location: eventData.location || '',
    notes: eventData.notes || '',
    status: eventData.status || 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('user_events').insert([newEvent]).select().single()
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase createEvent failed:', err.message)
    }
  }

  const allEvents = getLocalData(`events_${userId}`, [])
  allEvents.push(newEvent)
  setLocalData(`events_${userId}`, allEvents)
  return newEvent
}

export const updateEvent = async (userId, eventId, updates) => {
  const payload = { ...updates, updated_at: new Date().toISOString() }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_events')
        .update(payload)
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single()
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase updateEvent failed:', err.message)
    }
  }

  const allEvents = getLocalData(`events_${userId}`, [])
  const index = allEvents.findIndex((e) => e.id === eventId)
  if (index !== -1) {
    allEvents[index] = { ...allEvents[index], ...payload }
    setLocalData(`events_${userId}`, allEvents)
    return allEvents[index]
  }
  return payload
}

export const deleteEvent = async (userId, eventId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('user_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId)
      if (!error) return true
    } catch (err) {
      console.warn('Supabase deleteEvent failed:', err.message)
    }
  }

  let allEvents = getLocalData(`events_${userId}`, [])
  allEvents = allEvents.filter((e) => e.id !== eventId)
  setLocalData(`events_${userId}`, allEvents)
  return true
}

