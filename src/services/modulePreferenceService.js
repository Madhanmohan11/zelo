import { supabase, isSupabaseConfigured } from '../lib/supabase'

// -----------------------------------------------------------------------------
// MODULE DEFINITIONS
// -----------------------------------------------------------------------------
export const ALL_MODULES = [
  {
    id: 'money',
    name: 'Money & Expenses',
    shortName: 'Money',
    icon: 'IndianRupee',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Track spending, accounts, deposits, and savings',
    defaultEnabled: true,
    locked: true, // Cannot be disabled
    route: '/expenses'
  },
  {
    id: 'tasks',
    name: 'Tasks',
    shortName: 'Tasks',
    icon: 'CheckSquare',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Manage your daily to-do list and action items',
    defaultEnabled: true,
    locked: false,
    route: '/tasks'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    shortName: 'Calendar',
    icon: 'Calendar',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Events, schedule, reminders, and notes',
    defaultEnabled: true,
    locked: false,
    route: '/calendar'
  },
  {
    id: 'remember',
    name: 'Remember',
    shortName: 'Remember',
    icon: 'Bookmark',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Track lent/borrowed items and important objects',
    defaultEnabled: true,
    locked: false,
    route: '/remember'
  },
  {
    id: 'food',
    name: 'Food',
    shortName: 'Food',
    icon: 'Utensils',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Track meals, nutrition, and daily calories',
    defaultEnabled: false,
    locked: false,
    route: '/food'
  },
  {
    id: 'workout',
    name: 'Workout',
    shortName: 'Workout',
    icon: 'Dumbbell',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Log exercises, workouts, and fitness routines',
    defaultEnabled: false,
    locked: false,
    route: '/workout'
  },
  {
    id: 'water',
    name: 'Water',
    shortName: 'Water',
    icon: 'Droplet',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: 'Monitor daily hydration and water intake',
    defaultEnabled: false,
    locked: false,
    route: '/more'
  },
  {
    id: 'sleep',
    name: 'Sleep',
    shortName: 'Sleep',
    icon: 'Moon',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
    description: 'Monitor sleep duration and rest quality',
    defaultEnabled: false,
    locked: false,
    route: '/more'
  },
  {
    id: 'goals',
    name: 'Goals',
    shortName: 'Goals',
    icon: 'Target',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Set and track personal life goals and milestones',
    defaultEnabled: false,
    locked: false,
    route: '/more'
  }
]

export const DEFAULT_ENABLED_MODULES = ['money', 'tasks', 'calendar', 'remember']

// LocalStorage helpers
const getLocalData = (key, defaultVal) => {
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
// GET USER MODULE PREFERENCES
// -----------------------------------------------------------------------------
export const getModulePreferences = async (userId) => {
  if (!userId) return DEFAULT_ENABLED_MODULES

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('enabled_modules')
        .eq('user_id', userId)
        .maybeSingle()

      if (!error && data && Array.isArray(data.enabled_modules) && data.enabled_modules.length > 0) {
        // Ensure 'money' is always included
        const set = new Set([...data.enabled_modules, 'money'])
        return Array.from(set)
      }
    } catch (e) {
      console.warn('Supabase fetch user_settings error, falling back to local:', e)
    }
  }

  const localPrefs = getLocalData(`module_prefs_${userId}`, null)
  if (Array.isArray(localPrefs) && localPrefs.length > 0) {
    const set = new Set([...localPrefs, 'money'])
    return Array.from(set)
  }

  return DEFAULT_ENABLED_MODULES
}

// -----------------------------------------------------------------------------
// UPDATE USER MODULE PREFERENCES
// -----------------------------------------------------------------------------
export const updateModulePreferences = async (userId, enabledModules = []) => {
  if (!userId) return DEFAULT_ENABLED_MODULES

  // Always ensure 'money' is enabled
  const sanitizedModules = Array.from(new Set([...enabledModules, 'money']))

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: userId,
            enabled_modules: sanitizedModules,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )

      if (error) {
        console.warn('Error saving module preferences to Supabase:', error)
      }
    } catch (e) {
      console.warn('Exception updating Supabase module preferences:', e)
    }
  }

  setLocalData(`module_prefs_${userId}`, sanitizedModules)
  return sanitizedModules
}
