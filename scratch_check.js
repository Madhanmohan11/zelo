import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yqajckhhuhwapkcmdxkl.supabase.co'
const supabaseKey = 'sb_publishable_INlJpEDlE9KHmZxF7FmUMQ_2CgJKORj'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('Checking Supabase tables...')
  
  const tables = [
    'profiles',
    'user_settings',
    'accounts',
    'money_transactions',
    'meals',
    'workouts',
    'workout_exercises',
    'remember_items',
    'reminders',
    'expenses'
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`Table '${table}': ERROR -> ${error.code} - ${error.message}`)
      } else {
        console.log(`Table '${table}': EXISTS (returned ${data ? data.length : 0} rows)`)
      }
    } catch (e) {
      console.log(`Table '${table}': EXCEPTION -> ${e.message}`)
    }
  }
}

checkDatabase()
