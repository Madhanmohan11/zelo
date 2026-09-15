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
export const getUserProfile = async (userId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (!error && data) return data
      console.warn('Supabase profiles table error, using local fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase getUserProfile failed:', err.message)
    }
  }

  return getLocalData(`profile_${userId}`, {
    id: userId,
    full_name: 'Madhan',
    avatar_url: null,
    timezone: 'UTC',
    onboarding_completed: true
  })
}

export const getUserSettings = async (userId) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).single()
      if (!error && data) return data
      console.warn('Supabase user_settings table error, using local fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase getUserSettings failed:', err.message)
    }
  }

  return getLocalData(`settings_${userId}`, {
    user_id: userId,
    wake_time: '07:00',
    sleep_time: '23:00',
    water_target_ml: 2500,
    daily_expense_budget: 1000.00,
    notifications_enabled: false
  })
}

export const updateUserProfile = async (userId, profileData) => {
  const payload = { ...profileData, updated_at: new Date().toISOString() }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...payload })
        .select()
        .single()
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase updateUserProfile failed:', err.message)
    }
  }

  const current = await getUserProfile(userId)
  const updated = { ...current, ...payload }
  setLocalData(`profile_${userId}`, updated)
  return updated
}

export const updateUserSettings = async (userId, settingsData) => {
  const payload = { ...settingsData, updated_at: new Date().toISOString() }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, ...payload })
        .select()
        .single()
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase updateUserSettings failed:', err.message)
    }
  }

  const current = await getUserSettings(userId)
  const updated = { ...current, ...payload }
  setLocalData(`settings_${userId}`, updated)
  return updated
}
