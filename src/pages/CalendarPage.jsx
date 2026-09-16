import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Bookmark,
  Utensils,
  Dumbbell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { getExpenses, getMeals, getWorkouts, getRememberItems } from '../services/dataService'
import { formatINR } from '../utils/formatters'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export const CalendarPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  // Data states
  const [expenses, setExpenses] = useState([])
  const [meals, setMeals] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [remembers, setRemembers] = useState([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    if (!user) return
    let mounted = true
    setLoading(true)

    Promise.all([
      getExpenses(user.id),
      getMeals(user.id),
      getWorkouts(user.id),
      getRememberItems(user.id)
    ])
      .then(([expData, mealData, workoutData, remData]) => {
        if (!mounted) return
        setExpenses(expData || [])
        setMeals(mealData || [])
        setWorkouts(workoutData || [])
        setRemembers(remData || [])
      })
      .catch((e) => console.warn('Error loading calendar data:', e))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [user])

  // Calendar day calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Sun
    const totalDays = lastDayOfMonth.getDate()

    const days = []

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateStr: ''
      })
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d)
      const dateStr = dateObj.toISOString().split('T')[0]
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr
      })
    }

    return days
  }, [year, month])

  // Map entries per date
  const eventsByDate = useMemo(() => {
    const map = {}

    expenses.forEach((e) => {
      const dateKey = (e.spent_at || e.created_at || '').split('T')[0]
      if (!dateKey) return
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push({
        type: 'expense',
        title: e.description || e.category,
        subtitle: `${e.category} • ${formatINR(e.amount)}`,
        icon: Clock,
        color: 'text-rose-600 bg-rose-50'
      })
    })

    meals.forEach((m) => {
      const dateKey = (m.date || m.created_at || '').split('T')[0]
      if (!dateKey) return
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push({
        type: 'meal',
        title: m.name || m.type || 'Meal',
        subtitle: `Nutrition • ${m.calories || 0} kcal`,
        icon: Utensils,
        color: 'text-amber-600 bg-amber-50'
      })
    })

    workouts.forEach((w) => {
      const dateKey = (w.date || w.created_at || '').split('T')[0]
      if (!dateKey) return
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push({
        type: 'workout',
        title: w.title || w.type || 'Workout',
        subtitle: `${w.duration_minutes || 30} mins • ${w.status || 'planned'}`,
        icon: Dumbbell,
        color: 'text-indigo-600 bg-indigo-50'
      })
    })

    remembers.forEach((r) => {
      const dateKey = (r.created_at || '').split('T')[0]
      if (!dateKey) return
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push({
        type: 'remember',
        title: r.title,
        subtitle: r.person ? `With ${r.person}` : 'Item reminder',
        icon: Bookmark,
        color: 'text-purple-600 bg-purple-50'
      })
    })

    return map
  }, [expenses, meals, workouts, remembers])

  const selectedDateEvents = eventsByDate[selectedDateStr] || []

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  return (
    <div className="space-y-6 pb-24 sm:pb-28 animate-in fade-in duration-300 max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Calendar & Events</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            View daily events, schedule, expenses, and reminders
          </p>
        </div>

        <Button onClick={() => navigate('/today')} variant="outline" size="sm">
          Today
        </Button>
      </div>

      {/* MONTH & YEAR CONTROLS */}
      <Card className="p-4 bg-white border border-slate-200/90 rounded-3xl shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}
              className="bg-slate-100 font-extrabold text-xs text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}
              className="bg-slate-100 font-extrabold text-xs text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200/60"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200/60"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DAY OF WEEK HEADERS */}
        <div className="grid grid-cols-7 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* CALENDAR GRID */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (!day.isCurrentMonth) {
              return (
                <div key={idx} className="h-11 sm:h-12 flex items-center justify-center text-xs text-slate-300 font-medium">
                  {day.dayNumber}
                </div>
              )
            }

            const isSelected = selectedDateStr === day.dateStr
            const dateEvents = eventsByDate[day.dateStr] || []
            const hasEntries = dateEvents.length > 0

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/25'
                    : hasEntries
                    ? 'bg-emerald-50/80 text-emerald-950 font-extrabold border border-emerald-200/80'
                    : 'hover:bg-slate-100 text-slate-800 font-semibold'
                }`}
              >
                <span>{day.dayNumber}</span>

                {/* Entry Dot Indicator */}
                {hasEntries && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      isSelected ? 'bg-white' : 'bg-emerald-600'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* SELECTED DATE ENTRIES DETAILS */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
          Events & Logged Activity for {selectedDateStr}
        </h3>

        {selectedDateEvents.length === 0 ? (
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl text-center space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-extrabold text-slate-700">No events or entries logged on this date</p>
            <p className="text-[11px] text-slate-500">Tap the center + button anytime to add entries.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateEvents.map((item, idx) => {
              const IconComponent = item.icon
              return (
                <div
                  key={idx}
                  className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${item.color}`}>
                      <IconComponent className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{item.subtitle}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
