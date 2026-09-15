import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yqajckhhuhwapkcmdxkl.supabase.co'
const supabaseKey = 'sb_publishable_INlJpEDlE9KHmZxF7FmUMQ_2CgJKORj'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('=== VERIFYING SUPABASE DATABASE TABLES ===\n')

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
    'expenses',
    'tasks',
    'goals',
    'habits',
    'habit_logs',
    'water_logs',
    'sleep_logs',
    'calendar_events',
    'notifications',
    'activity_logs',
    'ai_conversations',
    'ai_messages'
  ]

  let missingCount = 0
  let existingCount = 0

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`❌ Table '${table}': NOT FOUND -> ${error.code} - ${error.message}`)
        missingCount++
      } else {
        console.log(`✅ Table '${table}': QUERYABLE (returned ${data ? data.length : 0} rows)`)
        existingCount++
      }
    } catch (e) {
      console.log(`❌ Table '${table}': EXCEPTION -> ${e.message}`)
      missingCount++
    }
  }

  console.log(`\n=== SUMMARY: ${existingCount}/${tables.length} tables queryable, ${missingCount} missing ===`)
}

checkDatabase()
