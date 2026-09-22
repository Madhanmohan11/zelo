import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  createExpense,
  createTask,
  createRememberItem,
  createMeal,
  createWorkout,
  getExpenses,
  getTasks,
  getRememberItems,
  getMeals,
  getWorkouts
} from './dataService'
import { getAccounts } from './accountService'
import { notifyDataUpdated } from '../utils/events'
import { formatINR } from '../utils/formatters'

/**
 * Client-side intelligent parser fallback if Supabase Edge Function is un-deployed or offline
 */
const parseMessageLocally = (text) => {
  const lower = text.toLowerCase()
  const todayStr = new Date().toISOString().split('T')[0]

  // 1. ADD EXPENSE INTENT
  if (
    lower.includes('expense') ||
    lower.includes('spent') ||
    lower.includes('paid') ||
    lower.includes('bought') ||
    lower.match(/(₹|rs\.?|inr|\bamount\b)\s*\d+/)
  ) {
    const amountMatch = text.match(/(?:₹|rs\.?|inr|\$)?\s*(\d+(?:\.\d{1,2})?)/i)
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null

    // Determine category
    let category = 'Food'
    if (lower.includes('food') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('snack') || lower.includes('coffee') || lower.includes('burger') || lower.includes('pizza') || lower.includes('tea')) {
      category = 'Food'
    } else if (lower.includes('cab') || lower.includes('uber') || lower.includes('ola') || lower.includes('petrol') || lower.includes('travel') || lower.includes('flight') || lower.includes('train')) {
      category = 'Travel'
    } else if (lower.includes('bill') || lower.includes('recharge') || lower.includes('electricity') || lower.includes('wifi')) {
      category = 'Bills'
    } else if (lower.includes('shirt') || lower.includes('shopping') || lower.includes('amazon') || lower.includes('clothes')) {
      category = 'Shopping'
    } else if (lower.includes('medicine') || lower.includes('doctor') || lower.includes('health') || lower.includes('gym')) {
      category = 'Health'
    } else if (lower.includes('movie') || lower.includes('game') || lower.includes('netflix')) {
      category = 'Entertainment'
    }

    // Clean description
    let description = text.replace(/add (an )?expense (for )?/i, '').replace(/spent (for )?/i, '').trim()
    if (!description) description = `${category} expense`

    if (amount) {
      return {
        intent: 'ADD_EXPENSE',
        requiresConfirmation: true,
        data: {
          amount,
          category,
          description,
          spent_at: todayStr,
          payment_method: 'UPI'
        },
        message: `I extracted these expense details. Please confirm to log it to your account:`
      }
    } else {
      return {
        intent: 'GENERAL_CHAT',
        requiresConfirmation: false,
        data: {},
        message: `I notice you want to log an expense, but couldn't detect the amount. Could you specify the amount (e.g. "Add expense of ₹150 for lunch")?`
      }
    }
  }

  // 2. CREATE TASK INTENT
  if (lower.startsWith('create task') || lower.startsWith('add task') || lower.includes('todo') || lower.includes('task to ')) {
    let title = text.replace(/^(create|add) (a )?task (to )?/i, '').trim()
    if (!title) title = 'New Task'

    let priority = 'normal'
    if (lower.includes('urgent') || lower.includes('high priority')) priority = 'high'
    if (lower.includes('low priority')) priority = 'low'

    return {
      intent: 'CREATE_TASK',
      requiresConfirmation: true,
      data: {
        title,
        priority,
        due_date: todayStr
      },
      message: `I prepared this new task for you. Please confirm to save:`
    }
  }

  // 3. CREATE REMINDER INTENT
  if (lower.startsWith('remind me') || lower.startsWith('create reminder') || lower.startsWith('add reminder') || lower.includes('remember')) {
    let title = text.replace(/^(remind me to|create reminder for|add reminder|remember to)/i, '').trim()
    if (!title) title = 'Reminder'

    return {
      intent: 'CREATE_REMINDER',
      requiresConfirmation: true,
      data: {
        title,
        location: '',
        expected_date: todayStr
      },
      message: `I captured this reminder. Please confirm to add it to your remember list:`
    }
  }

  // 4. LOG MEAL INTENT
  if (lower.startsWith('log meal') || lower.startsWith('add meal') || lower.includes('ate ') || lower.includes('had lunch') || lower.includes('had breakfast')) {
    let title = text.replace(/^(log meal|add meal|ate|had)/i, '').trim() || 'Meal'
    let meal_type = 'lunch'
    if (lower.includes('breakfast')) meal_type = 'breakfast'
    if (lower.includes('dinner')) meal_type = 'dinner'
    if (lower.includes('snack')) meal_type = 'evening_snack'

    return {
      intent: 'LOG_MEAL',
      requiresConfirmation: true,
      data: {
        title,
        meal_type,
        scheduled_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      },
      message: `I prepared your meal log. Confirm to add it:`
    }
  }

  // 5. LOG WORKOUT INTENT
  if (lower.startsWith('log workout') || lower.startsWith('add workout') || lower.includes('did workout') || lower.includes('exercise')) {
    let title = text.replace(/^(log workout|add workout|did workout|exercise)/i, '').trim() || 'Workout'
    return {
      intent: 'LOG_WORKOUT',
      requiresConfirmation: true,
      data: {
        title,
        scheduled_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      },
      message: `I prepared your workout log. Confirm to schedule it:`
    }
  }

  // 6. QUERY INTENTS
  if (lower.includes('today expense') || lower.includes('how much spent today') || lower.includes('today spending')) {
    return {
      intent: 'GET_TODAY_EXPENSES',
      requiresConfirmation: false,
      data: {},
      message: `Fetching today's expense summary for you...`
    }
  }

  if (lower.includes('today task') || lower.includes('my tasks') || lower.includes('pending task')) {
    return {
      intent: 'GET_TODAY_TASKS',
      requiresConfirmation: false,
      data: {},
      message: `Here are your pending tasks for today:`
    }
  }

  if (lower.includes('plan my day') || lower.includes('today schedule') || lower.includes('my day')) {
    return {
      intent: 'GET_TODAY_SCHEDULE',
      requiresConfirmation: false,
      data: {},
      message: `Let's look at your schedule and plan for today:`
    }
  }

  if (lower.includes('progress') || lower.includes('analytics') || lower.includes('summary')) {
    return {
      intent: 'GET_PROGRESS_SUMMARY',
      requiresConfirmation: false,
      data: {},
      message: `Here is an overview of your life & financial progress:`
    }
  }

  // GENERAL CHAT
  return {
    intent: 'GENERAL_CHAT',
    requiresConfirmation: false,
    data: {},
    message: `Hello! I'm ZELO AI, your personal life and financial assistant. You can ask me to log expenses (e.g. "Add expense of ₹150 for lunch"), create tasks, set reminders, plan your day, or summarize your spending!`
  }
}

/**
 * Get or create active conversation for user
 */
export const getOrCreateActiveConversation = async (userId) => {
  if (!userId) return null

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: convs, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (!error && convs && convs.length > 0) {
        return convs[0]
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('ai_conversations')
        .insert([{ user_id: userId, title: 'ZELO AI Session' }])
        .select()
        .single()

      if (!createError && newConv) {
        return newConv
      }
    } catch (err) {
      console.warn('Supabase ai_conversations error:', err)
    }
  }

  return {
    id: `local_conv_${userId}`,
    user_id: userId,
    title: 'ZELO AI Session',
    created_at: new Date().toISOString()
  }
}

/**
 * Fetch messages for conversation
 */
export const getConversationMessages = async (userId, conversationId) => {
  if (!userId || !conversationId) return []

  if (isSupabaseConfigured && supabase && !conversationId.startsWith('local_')) {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        return data
      }
    } catch (err) {
      console.warn('Error fetching ai_messages:', err)
    }
  }

  const localMsgs = localStorage.getItem(`zelo_ai_messages_${userId}`)
  return localMsgs ? JSON.parse(localMsgs) : []
}

/**
 * Save single message
 */
export const saveAIMessage = async (userId, conversationId, messageObj) => {
  const msgRecord = {
    id: crypto.randomUUID(),
    conversation_id: conversationId && !conversationId.startsWith('local_') ? conversationId : null,
    user_id: userId,
    sender: messageObj.sender,
    content: messageObj.content,
    metadata: messageObj.metadata || {},
    created_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase && msgRecord.conversation_id) {
    try {
      await supabase.from('ai_messages').insert([msgRecord])
    } catch (err) {
      console.warn('Failed to insert ai_message to Supabase:', err)
    }
  }

  // Local storage backup
  const key = `zelo_ai_messages_${userId}`
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  existing.push(msgRecord)
  localStorage.setItem(key, JSON.stringify(existing.slice(-100))) // Keep last 100 messages

  return msgRecord
}

/**
 * Process user prompt with backend Edge Function or local fallback
 */
export const sendAIMessage = async (userId, conversationId, text) => {
  if (!userId || !text) throw new Error('Missing user or message')

  // Save user message
  await saveAIMessage(userId, conversationId, {
    sender: 'user',
    content: text
  })

  let aiResponse = null

  // Try calling Supabase Edge Function 'zelo-ai' if configured
  if (isSupabaseConfigured && supabase && !conversationId.startsWith('local_')) {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (token) {
        const { data, error } = await supabase.functions.invoke('zelo-ai', {
          body: {
            message: text,
            conversation_id: conversationId
          }
        })

        if (!error && data && data.message) {
          aiResponse = data
        }
      }
    } catch (err) {
      console.warn('Edge Function invoke standard call fallback:', err)
    }
  }

  // If Edge function unavailable or no API key, use intelligent client-side parser fallback
  if (!aiResponse) {
    aiResponse = parseMessageLocally(text)
  }

  // Attach additional read context data if read intent
  if (aiResponse.intent === 'GET_TODAY_EXPENSES') {
    const expenses = await getExpenses(userId)
    const todayStr = new Date().toISOString().split('T')[0]
    const todayExpenses = expenses.filter((e) => (e.spent_at || '').split('T')[0] === todayStr)
    const total = todayExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
    aiResponse.data = {
      expenses: todayExpenses,
      total,
      count: todayExpenses.length
    }
    aiResponse.message = `You spent ${formatINR(total)} across ${todayExpenses.length} expense(s) today.`
  } else if (aiResponse.intent === 'GET_TODAY_TASKS') {
    const tasks = await getTasks(userId)
    const pendingTasks = tasks.filter((t) => t.status !== 'completed')
    aiResponse.data = {
      tasks: pendingTasks,
      count: pendingTasks.length
    }
    aiResponse.message = `You have ${pendingTasks.length} pending task(s) on your list.`
  } else if (aiResponse.intent === 'GET_PROGRESS_SUMMARY' || aiResponse.intent === 'GET_TODAY_SCHEDULE') {
    const [expenses, tasks, meals, workouts] = await Promise.all([
      getExpenses(userId),
      getTasks(userId),
      getMeals(userId),
      getWorkouts(userId)
    ])
    const todayStr = new Date().toISOString().split('T')[0]
    const todayExp = expenses.filter((e) => (e.spent_at || '').split('T')[0] === todayStr)
    const totalExp = todayExp.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
    const pendingTasks = tasks.filter((t) => t.status !== 'completed')

    aiResponse.data = {
      todaySpending: totalExp,
      todayExpensesCount: todayExp.length,
      pendingTasksCount: pendingTasks.length,
      mealsCount: meals.length,
      workoutsCount: workouts.length
    }
    aiResponse.message = `Summary for today: Spent ${formatINR(totalExp)} (${todayExp.length} items), ${pendingTasks.length} pending task(s), ${meals.length} meal(s) planned.`
  }

  // Save AI response to DB
  await saveAIMessage(userId, conversationId, {
    sender: 'assistant',
    content: aiResponse.message || 'Done',
    metadata: {
      intent: aiResponse.intent,
      requiresConfirmation: aiResponse.requiresConfirmation,
      data: aiResponse.data
    }
  })

  return aiResponse
}

/**
 * Execute confirmed action after user taps Confirm
 */
export const executeConfirmedAction = async (userId, intent, actionData) => {
  if (!userId) throw new Error('User authentication required')

  let resultMessage = 'Action completed successfully'

  if (intent === 'ADD_EXPENSE') {
    if (!actionData.amount || isNaN(actionData.amount) || actionData.amount <= 0) {
      throw new Error('Valid expense amount is required')
    }

    // Determine default account if not specified
    let targetAccountId = actionData.account_id
    if (!targetAccountId) {
      const accounts = await getAccounts(userId)
      const active = accounts.filter((a) => a.is_active !== false)
      if (active.length > 0) {
        targetAccountId = active[0].id
      }
    }

    const created = await createExpense(userId, {
      amount: actionData.amount,
      category: actionData.category || 'Food',
      description: actionData.description || 'Logged via ZELO AI',
      spent_at: actionData.spent_at || new Date().toISOString(),
      account_id: targetAccountId || null,
      payment_method: actionData.payment_method || 'UPI'
    })

    notifyDataUpdated('expenses', 'created', created)
    resultMessage = `Successfully logged expense ${formatINR(actionData.amount)} for "${actionData.description || actionData.category}"!`
  } else if (intent === 'CREATE_TASK') {
    if (!actionData.title) throw new Error('Task title is required')

    const created = await createTask(userId, {
      title: actionData.title,
      priority: actionData.priority || 'normal',
      due_date: actionData.due_date || null
    })

    notifyDataUpdated('tasks', 'created', created)
    resultMessage = `Created task: "${actionData.title}"!`
  } else if (intent === 'CREATE_REMINDER') {
    if (!actionData.title) throw new Error('Reminder title is required')

    const created = await createRememberItem(userId, {
      title: actionData.title,
      location: actionData.location || '',
      expected_date: actionData.expected_date || null
    })

    notifyDataUpdated('remember', 'created', created)
    resultMessage = `Saved reminder: "${actionData.title}"!`
  } else if (intent === 'LOG_MEAL') {
    if (!actionData.title) throw new Error('Meal title is required')

    const created = await createMeal(userId, {
      title: actionData.title,
      meal_type: actionData.meal_type || 'lunch',
      scheduled_time: actionData.scheduled_time || '13:00'
    })

    notifyDataUpdated('food', 'created', created)
    resultMessage = `Logged meal: "${actionData.title}"!`
  } else if (intent === 'LOG_WORKOUT') {
    if (!actionData.title) throw new Error('Workout title is required')

    const created = await createWorkout(userId, {
      title: actionData.title,
      scheduled_time: actionData.scheduled_time || '18:00'
    })

    notifyDataUpdated('workout', 'created', created)
    resultMessage = `Scheduled workout: "${actionData.title}"!`
  } else {
    throw new Error(`Unsupported intent action: ${intent}`)
  }

  // Also record confirmation result message in AI conversation history
  const key = `zelo_ai_messages_${userId}`
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  existing.push({
    id: crypto.randomUUID(),
    user_id: userId,
    sender: 'assistant',
    content: `✅ ${resultMessage}`,
    metadata: { intent: 'ACTION_CONFIRMED', requiresConfirmation: false },
    created_at: new Date().toISOString()
  })
  localStorage.setItem(key, JSON.stringify(existing))

  return resultMessage
}
