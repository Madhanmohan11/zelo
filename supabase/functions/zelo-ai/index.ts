import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  message: string
  conversation_id?: string
  context?: Record<string, any>
}

const SYSTEM_PROMPT = `
You are ZELO AI, an intelligent personal life assistant for the ZELO platform.
Your job is to understand user prompts and respond with structured JSON.

Supported Intents:
1. ADD_EXPENSE: User wants to log/record spending. Data fields: amount (number), category (string: "Food", "Travel", "Shopping", "Bills", "Health", "Entertainment", "Education", "Other"), description (string), date (YYYY-MM-DD or today ISO string). requiresConfirmation MUST BE true.
2. CREATE_TASK: User wants to create a task/todo. Data fields: title (string), priority (string: "low", "normal", "high", "urgent"), due_date (YYYY-MM-DD or null). requiresConfirmation MUST BE true.
3. CREATE_REMINDER: User wants to create a reminder / remember item. Data fields: title (string), location (string or null), expected_date (YYYY-MM-DD or null). requiresConfirmation MUST BE true.
4. LOG_MEAL: User wants to log a meal. Data fields: title (string), meal_type (string: "breakfast", "lunch", "dinner", "snack"), scheduled_time (HH:MM). requiresConfirmation MUST BE true.
5. LOG_WORKOUT: User wants to log a workout. Data fields: title (string), scheduled_time (HH:MM). requiresConfirmation MUST BE true.
6. GET_TODAY_EXPENSES: User asks to see today's expenses. requiresConfirmation MUST BE false.
7. GET_TODAY_TASKS: User asks to see today's tasks. requiresConfirmation MUST BE false.
8. GET_TODAY_REMINDERS: User asks to see reminders. requiresConfirmation MUST BE false.
9. GET_TODAY_SCHEDULE: User asks to plan their day or see today's overall schedule. requiresConfirmation MUST BE false.
10. GET_PROGRESS_SUMMARY: User asks for progress / analytics summary. requiresConfirmation MUST BE false.
11. GENERAL_CHAT: General advice, Q&A, greetings. requiresConfirmation MUST BE false.

CRITICAL RULES:
- Return ONLY valid JSON with no markdown block wrappers if possible, matching this schema:
{
  "intent": "<INTENT_NAME>",
  "requiresConfirmation": boolean,
  "data": { ...extracted structured fields... },
  "message": "<Friendly, helpful conversational response summarizing the intent>"
}
- If required details for an action (like expense amount or task title) are missing, ask for clarification in "message" with intent "GENERAL_CHAT" and requiresConfirmation: false.
- Never invent database table names, SQL commands, or user IDs.
`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { message, conversation_id, context }: RequestBody = await req.json()
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid message parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('AI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'AI Provider API Key is not configured.',
          details: 'Please configure GEMINI_API_KEY in your Supabase project secrets or environment variables.',
          intent: 'GENERAL_CHAT',
          requiresConfirmation: false,
          data: {},
          message: 'AI Provider API Key (GEMINI_API_KEY) is not configured in environment variables. Please add GEMINI_API_KEY to your Supabase secrets.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Gemini REST API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const promptText = `${SYSTEM_PROMPT}\n\nToday Date Context: ${new Date().toISOString().split('T')[0]}\nUser Input: "${message}"`

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API Error:', errText)
      return new Response(
        JSON.stringify({
          error: 'AI service request failed',
          details: errText,
          intent: 'GENERAL_CHAT',
          requiresConfirmation: false,
          data: {},
          message: 'I had trouble connecting to the AI language engine. Please try again in a moment.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const aiResult = await response.json()
    const rawText = aiResult?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    let parsed = {
      intent: 'GENERAL_CHAT',
      requiresConfirmation: false,
      data: {},
      message: rawText
    }

    try {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
      parsed = JSON.parse(cleanJson)
    } catch (e) {
      parsed.message = rawText
    }

    return new Response(
      JSON.stringify({
        user_id: user.id,
        conversation_id,
        ...parsed
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
