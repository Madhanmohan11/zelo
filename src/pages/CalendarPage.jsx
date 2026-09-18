import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Settings,
  Sparkles,
  Sun,
  Moon,
  Bookmark,
  Check,
  Flag,
  Globe,
  Tag,
  X,
  Filter,
  Info,
  Edit2,
  Trash2
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDashboard } from '../context/DashboardContext'
import {
  getRememberItems,
  getTasks,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from '../services/dataService'
import { getPriorityDisplayLabel } from '../utils/priority'
import { getTamilDateDetails } from '../services/tamilCalendarService'
import { getHolidaysForDate, getHolidaysForMonth, getHolidaysForYear, HOLIDAY_CATEGORIES } from '../services/holidayService'
import { getPanchangamTimings, DEFAULT_LOCATION } from '../services/panchangamService'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const CalendarPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const dashboard = useDashboard()
  const navigate = useNavigate()

  // Base dates
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0])
  const [activeTab, setActiveTab] = useState('Overview') // 'Overview' | 'Events' | 'Panchangam' | 'Holidays'
  const [loading, setLoading] = useState(false)

  // Preferences & Settings
  const [langPref, setLangPref] = useState(() => localStorage.getItem('zelo_calendar_lang') || 'both') // 'english' | 'tamil' | 'both'
  const [locationPref, setLocationPref] = useState(() => localStorage.getItem('zelo_calendar_city') || 'Chennai')
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Data states
  const [personalEvents, setPersonalEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [remembers, setRemembers] = useState([])

  // Create Event Modal state
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventCategory, setNewEventCategory] = useState('Personal')
  const [newEventTime, setNewEventTime] = useState('09:00')
  const [newEventEndTime, setNewEventEndTime] = useState('10:00')
  const [newEventLocation, setNewEventLocation] = useState('')
  const [newEventNotes, setNewEventNotes] = useState('')
  const [newEventIsAllDay, setNewEventIsAllDay] = useState(false)

  // Event Details Modal & Edit Event Modal state
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false)

  const [showEditEventModal, setShowEditEventModal] = useState(false)
  const [editEventTitle, setEditEventTitle] = useState('')
  const [editEventCategory, setEditEventCategory] = useState('Personal')
  const [editEventStartDate, setEditEventStartDate] = useState('')
  const [editEventStartTime, setEditEventStartTime] = useState('09:00')
  const [editEventEndDate, setEditEventEndDate] = useState('')
  const [editEventEndTime, setEditEventEndTime] = useState('10:00')
  const [editEventLocation, setEditEventLocation] = useState('')
  const [editEventNotes, setEditEventNotes] = useState('')
  const [editEventIsAllDay, setEditEventIsAllDay] = useState(false)

  // Delete Event Confirm state
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [deletingEventId, setDeletingEventId] = useState(null)

  // Holidays Filter
  const [holidayFilter, setHolidayFilter] = useState('All')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Load user data
  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [evtData, taskData, remData] = await Promise.all([
        getEvents(user.id),
        getTasks(user.id),
        getRememberItems(user.id)
      ])
      setPersonalEvents(evtData || [])
      setTasks(taskData || [])
      setRemembers(remData || [])
    } catch (e) {
      console.warn('Error loading calendar data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  // Save language preference
  const handleLanguageChange = (newLang) => {
    setLangPref(newLang)
    localStorage.setItem('zelo_calendar_lang', newLang)
  }

  // Save city location preference
  const handleLocationChange = (newCity) => {
    setLocationPref(newCity)
    localStorage.setItem('zelo_calendar_city', newCity)
  }

  // Computed Tamil Details for selected date
  const selectedTamilDetails = useMemo(() => {
    return getTamilDateDetails(selectedDateStr, langPref)
  }, [selectedDateStr, langPref])

  // Computed Panchangam & Timings for selected date
  const selectedPanchangam = useMemo(() => {
    return getPanchangamTimings(selectedDateStr, { ...DEFAULT_LOCATION, city: locationPref })
  }, [selectedDateStr, locationPref])

  // Computed Holidays & Observances for selected date
  const selectedHolidays = useMemo(() => {
    return getHolidaysForDate(selectedDateStr, year)
  }, [selectedDateStr, year])

  // Computed Month Holidays & Observances
  const monthHolidays = useMemo(() => {
    return getHolidaysForMonth(year, month, holidayFilter)
  }, [year, month, holidayFilter])

  // Calculate days grid for current calendar month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDayOfMonth.getDay()
    const totalDays = lastDayOfMonth.getDate()

    const days = []
    const prevMonthLastDay = new Date(year, month, 0).getDate()

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateStr: ''
      })
    }

    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(month + 1).padStart(2, '0')
      const dayStr = String(d).padStart(2, '0')
      const dateStr = `${year}-${monthStr}-${dayStr}`
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr
      })
    }

    return days
  }, [year, month])

  // Map events, tasks, remembers, holidays per date for monthly grid dots
  const dateMap = useMemo(() => {
    const map = {}

    // 1. Personal Events
    personalEvents.forEach((e) => {
      const dateKey = (e.event_date || '').split('T')[0]
      if (!dateKey) return
      if (!map[dateKey]) map[dateKey] = { personal: [], tasks: [], remembers: [], holidays: [], festivals: [], important: [] }
      map[dateKey].personal.push(e)
    })

    // 2. Tasks
    tasks.forEach((t) => {
      const dateKey = (t.due_date || t.created_at || '').split('T')[0]
      if (!dateKey) return
      if (!map[dateKey]) map[dateKey] = { personal: [], tasks: [], remembers: [], holidays: [], festivals: [], important: [] }
      map[dateKey].tasks.push(t)
    })

    // 3. Remember items
    remembers.forEach((r) => {
      const dateKey = (r.expected_date || r.created_at || '').split('T')[0]
      if (!dateKey) return
      if (!map[dateKey]) map[dateKey] = { personal: [], tasks: [], remembers: [], holidays: [], festivals: [], important: [] }
      map[dateKey].remembers.push(r)
    })

    // 4. Holidays & Festivals
    const allYearHolidays = getHolidaysForYear(year)
    allYearHolidays.forEach((h) => {
      if (!map[h.date]) map[h.date] = { personal: [], tasks: [], remembers: [], holidays: [], festivals: [], important: [] }
      if (h.category === HOLIDAY_CATEGORIES.GOVT || h.category === HOLIDAY_CATEGORIES.NATIONAL) {
        map[h.date].holidays.push(h)
      } else if (h.category === HOLIDAY_CATEGORIES.FESTIVAL) {
        map[h.date].festivals.push(h)
      } else {
        map[h.date].important.push(h)
      }
    })

    return map
  }, [personalEvents, tasks, remembers, year])

  // Items for selected date
  const selectedDateMap = dateMap[selectedDateStr] || { personal: [], tasks: [], remembers: [], holidays: [], festivals: [], important: [] }

  // Create personal event handler
  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!newEventTitle.trim() || !user) return

    try {
      await createEvent(user.id, {
        title: newEventTitle.trim(),
        category: newEventCategory,
        event_date: selectedDateStr,
        start_time: newEventTime,
        end_time: newEventEndTime,
        location: newEventLocation,
        notes: newEventNotes,
        is_all_day: newEventIsAllDay
      })
      setNewEventTitle('')
      setNewEventLocation('')
      setNewEventNotes('')
      setShowAddEventModal(false)
      showToast('Event created successfully!', 'success')
      loadData()
      if (dashboard?.refreshCalendarSummary) {
        dashboard.refreshCalendarSummary()
      }
    } catch (err) {
      console.error('Failed to create event:', err)
      showToast('Failed to create event', 'error')
    }
  }

  // Open Event Details Modal
  const handleOpenEventDetails = (evt) => {
    setSelectedEvent(evt)
    setShowEventDetailsModal(true)
  }

  // Open Edit Event Modal pre-filled
  const handleOpenEditEvent = (evt) => {
    setSelectedEvent(evt)
    setEditEventTitle(evt.title || '')
    setEditEventCategory(evt.category || 'Personal')
    setEditEventStartDate(evt.event_date || selectedDateStr)
    setEditEventStartTime(evt.start_time || '09:00')
    setEditEventEndDate(evt.event_date || selectedDateStr)
    setEditEventEndTime(evt.end_time || '10:00')
    setEditEventLocation(evt.location || '')
    setEditEventNotes(evt.notes || evt.description || '')
    setEditEventIsAllDay(Boolean(evt.is_all_day))

    setShowEventDetailsModal(false)
    setShowEditEventModal(true)
  }

  // Handle Update Event
  const handleUpdateEvent = async (e) => {
    e.preventDefault()
    if (!editEventTitle.trim() || !selectedEvent || !user) return

    try {
      await updateEvent(user.id, selectedEvent.id, {
        title: editEventTitle.trim(),
        category: editEventCategory,
        event_date: editEventStartDate,
        start_time: editEventStartTime,
        end_time: editEventEndTime,
        location: editEventLocation,
        notes: editEventNotes,
        is_all_day: editEventIsAllDay
      })

      setShowEditEventModal(false)
      setSelectedEvent(null)
      showToast('Event updated successfully!', 'success')
      loadData()
      if (dashboard?.refreshCalendarSummary) {
        dashboard.refreshCalendarSummary()
      }
    } catch (err) {
      console.error('Failed to update event:', err)
      showToast('Failed to update event', 'error')
    }
  }

  // Confirm Delete Event Trigger
  const handleConfirmDeleteEvent = (eventId) => {
    setDeletingEventId(eventId)
    setShowDeleteConfirmModal(true)
  }

  // Execute Delete Event
  const handleDeleteEvent = async () => {
    if (!deletingEventId || !user) return

    try {
      await deleteEvent(user.id, deletingEventId)
      setShowDeleteConfirmModal(false)
      setShowEventDetailsModal(false)
      setSelectedEvent(null)
      setDeletingEventId(null)
      showToast('Event deleted', 'info')
      loadData()
      if (dashboard?.refreshCalendarSummary) {
        dashboard.refreshCalendarSummary()
      }
    } catch (err) {
      console.error('Failed to delete event:', err)
      showToast('Failed to delete event', 'error')
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleTodayClick = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDateStr(today.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300 max-w-2xl mx-auto px-4 sm:px-0 pt-2">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-2xs">
            <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Calendar</h1>
            <p className="text-xs font-semibold text-slate-500">Plan your day. Live a better you.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleTodayClick} variant="outline" size="sm" className="rounded-xl text-xs font-bold border-slate-200">
            Today
          </Button>
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl transition-colors border border-slate-200/80"
            title="Calendar Settings"
          >
            <Settings className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* MONTHLY CALENDAR CARD */}
      <Card className="p-4 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-4">
        {/* Month & Year Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}
              className="bg-slate-100 font-extrabold text-xs text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="bg-slate-100 font-extrabold text-xs text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
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

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 text-center">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
            <div key={d} className="text-[10px] font-black uppercase tracking-wider text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
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
            const isToday = new Date().toISOString().split('T')[0] === day.dateStr
            const dayEntry = dateMap[day.dateStr] || { personal: [], tasks: [], remembers: [], holidays: [], festivals: [], important: [] }

            const hasPersonal = dayEntry.personal.length > 0
            const hasTask = dayEntry.tasks.length > 0
            const hasRemember = dayEntry.remembers.length > 0
            const hasGovtHoliday = dayEntry.holidays.length > 0
            const hasFestival = dayEntry.festivals.length > 0
            const hasImportant = dayEntry.important.length > 0

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`h-11 sm:h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500 ring-offset-1'
                    : isToday
                    ? 'bg-emerald-50 text-emerald-950 font-black border-2 border-emerald-400'
                    : 'hover:bg-slate-100 text-slate-800 font-bold'
                }`}
              >
                <span className="text-xs">{day.dayNumber}</span>

                {/* Color-Coded Indicator Dots */}
                <div className="flex items-center gap-0.5 mt-0.5 max-w-full overflow-hidden px-1">
                  {hasPersonal && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} title="Personal Event" />}
                  {hasTask && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-200' : 'bg-emerald-600'}`} title="Task" />}
                  {hasRemember && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-purple-200' : 'bg-purple-600'}`} title="Remember" />}
                  {hasGovtHoliday && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-200' : 'bg-rose-600'}`} title="Government Holiday" />}
                  {hasFestival && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-sky-200' : 'bg-sky-500'}`} title="Festival" />}
                  {hasImportant && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-indigo-200' : 'bg-indigo-600'}`} title="Important Day" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>My Event</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Task</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Remember</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Festival</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>Important Day</span>
          </div>
        </div>
      </Card>

      {/* SELECTED DATE DETAILS SECTION */}
      <div className="space-y-4">
        {/* TAMIL TEMPLE HERO BANNER CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-5 shadow-lg border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none flex items-center justify-end pr-2">
            <svg viewBox="0 0 200 200" className="w-48 h-48 fill-emerald-300">
              <path d="M100 10 L120 40 L115 40 L130 70 L125 70 L140 100 L135 100 L150 140 L50 140 L65 100 L60 100 L75 70 L70 70 L85 40 L80 40 Z" />
              <rect x="70" y="140" width="60" height="50" rx="4" />
              <circle cx="100" cy="165" r="15" />
            </svg>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  {new Date(selectedDateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Language Selector */}
              <select
                value={langPref}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-800/90 text-white text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-700 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="both">Tamil + EN</option>
                <option value="tamil">தமிழ் மட்டுமே</option>
                <option value="english">English Only</option>
              </select>
            </div>

            {/* Tamil Date Highlight */}
            <div className="flex items-baseline gap-3 pt-1">
              <div className="bg-emerald-500/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-400/30 text-center">
                <span className="text-2xl font-black text-emerald-300">
                  {selectedTamilDetails?.tamilDayNum || 1}
                </span>
                <span className="block text-[9px] font-bold text-emerald-200 uppercase tracking-wider">
                  {new Date(selectedDateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedTamilDetails?.shortDisplay || 'புரட்டாசி 1, வியாழன்'}
                </h2>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {selectedTamilDetails?.formattedMonth} Month • {selectedTamilDetails?.formattedYear} Year
                </p>
              </div>
            </div>

            <p className="text-xs font-medium italic text-emerald-100/80 pt-1 border-t border-slate-800">
              "Discipline today, a better tomorrow."
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-extrabold text-slate-600 overflow-x-auto scrollbar-none">
          {['Overview', 'Events', 'Panchangam', 'Holidays'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-emerald-950 shadow-2xs font-black border border-slate-200/60'
                  : 'hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* TAMIL CALENDAR DETAILS CARD */}
            <Card className="p-4 bg-white border border-slate-200/90 rounded-3xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Tamil Calendar Details
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('Panchangam')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View More <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between py-1 px-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-500">Tamil Month</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.formattedMonth}</span>
                </div>
                <div className="flex justify-between py-1 px-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-500">Tamil Year</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.formattedYear}</span>
                </div>
                <div className="flex justify-between py-1 px-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-500">Tithi</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.formattedTithi}</span>
                </div>
                <div className="flex justify-between py-1 px-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-500">Nakshatra</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.formattedNakshatra}</span>
                </div>
                <div className="flex justify-between py-1 px-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-500">Yogam</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.formattedYogam}</span>
                </div>
                <div className="flex justify-between py-1 px-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-500">Karanam</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.formattedKaranam}</span>
                </div>
                <div className="flex justify-between py-1 px-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-500">Sunrise</span>
                  <span className="font-extrabold text-slate-900">{selectedPanchangam?.sunrise}</span>
                </div>
                <div className="flex justify-between py-1 px-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-500">Sunset</span>
                  <span className="font-extrabold text-slate-900">{selectedPanchangam?.sunset}</span>
                </div>
              </div>
            </Card>

            {/* AUSPICIOUS & INAUSPICIOUS TIMINGS CARD */}
            <Card className="p-4 bg-white border border-slate-200/90 rounded-3xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Auspicious & Inauspicious Timings ({locationPref})
                </h3>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Auspicious Periods</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedPanchangam?.auspiciousTimings.map((item) => (
                    <div key={item.id} className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-0.5">
                      <span className="text-[11px] font-extrabold text-emerald-950 block">{item.title}</span>
                      <span className="text-xs font-black text-emerald-700 block">{item.primary}</span>
                      {item.secondary && (
                        <span className="text-[10px] font-bold text-emerald-600 block">{item.secondary}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-rose-700">Traditional Inauspicious Periods</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedPanchangam?.inauspiciousTimings.map((item) => (
                    <div key={item.id} className="p-2.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl space-y-0.5">
                      <span className="text-[11px] font-extrabold text-rose-950 block">{item.title}</span>
                      <span className="text-xs font-black text-rose-700 block">{item.primary}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-semibold italic text-center pt-1">
                * Timings are based on {locationPref}, Tamil Nadu (IST).
              </p>
            </Card>
          </div>
        )}

        {/* TAB CONTENT: EVENTS */}
        {activeTab === 'Events' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Events & Schedule for {selectedDateStr}
              </h3>
              <Button
                onClick={() => setShowAddEventModal(true)}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Event
              </Button>
            </div>

            {/* List Personal Events, Tasks, Remembers */}
            {selectedDateMap.personal.length === 0 &&
            selectedDateMap.tasks.length === 0 &&
            selectedDateMap.remembers.length === 0 ? (
              <Card className="p-6 bg-white border border-slate-200/80 rounded-3xl text-center space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-extrabold text-slate-700">No personal events or tasks for this date</p>
                <p className="text-[11px] text-slate-500">Tap "+ Add Event" above to create an event.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {/* Personal Events Cards */}
                {selectedDateMap.personal.map((evt) => (
                  <Card
                    key={evt.id}
                    onClick={() => handleOpenEventDetails(evt)}
                    className="p-3.5 bg-white border border-slate-200/90 hover:border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
                        <CalendarIcon className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {evt.title}
                          </h4>
                          <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            {evt.category || 'Personal'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{evt.start_time} - {evt.end_time || '10:00'}</span>
                          {evt.location && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{evt.location}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEditEvent(evt)
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Event"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleConfirmDeleteEvent(evt.id)
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}

                {/* Tasks */}
                {selectedDateMap.tasks.map((task) => (
                  <Card key={task.id} className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900">{task.title}</h4>
                          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Task
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Priority: {getPriorityDisplayLabel(task.priority)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Remember Items */}
                {selectedDateMap.remembers.map((rem) => (
                  <Card key={rem.id} className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                        <Bookmark className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900">{rem.title}</h4>
                          <span className="text-[9px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            Remember
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {rem.location ? `Location: ${rem.location}` : 'Reminder'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* IMPORTANT TODAY SECTION */}
            {selectedHolidays.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Important Today ({selectedHolidays.length})
                </h4>
                <div className="space-y-2">
                  {selectedHolidays.map((h, idx) => (
                    <Card key={idx} className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{h.name}</span>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {h.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{h.desc}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: PANCHANGAM */}
        {activeTab === 'Panchangam' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <Card className="p-4 bg-white border border-slate-200/90 rounded-3xl shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                Detailed Panchangam Overview ({selectedDateStr})
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-500">Tamil Date & Day</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.shortDisplay}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-500">Tithi (திதி)</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.formattedTithi}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-500">Nakshatra (நட்சத்திரம்)</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.formattedNakshatra}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-500">Yogam (யோகம்)</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.formattedYogam}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-500">Karanam (கரணம்)</span>
                  <span className="font-extrabold text-slate-900">{selectedTamilDetails?.formattedKaranam}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-500">Sunrise / Sunset</span>
                  <span className="font-extrabold text-slate-900">{selectedPanchangam?.sunrise} / {selectedPanchangam?.sunset}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB CONTENT: HOLIDAYS */}
        {activeTab === 'Holidays' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-extrabold">
              {['All', HOLIDAY_CATEGORIES.GOVT, HOLIDAY_CATEGORIES.NATIONAL, HOLIDAY_CATEGORIES.FESTIVAL, HOLIDAY_CATEGORIES.IMPORTANT].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setHolidayFilter(f)}
                  className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                    holidayFilter === f
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f === 'All' ? 'All Holidays' : f}
                </button>
              ))}
            </div>

            {monthHolidays.length === 0 ? (
              <Card className="p-6 bg-white border border-slate-200/80 rounded-3xl text-center space-y-2">
                <Flag className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-extrabold text-slate-700">No holidays or festivals found for this filter</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {monthHolidays.map((item, idx) => (
                  <Card key={idx} className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{item.name}</span>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <span className="text-xs font-black text-emerald-700 block">{item.date}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">{item.state}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* EVENT DETAILS VIEW MODAL */}
      {showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Event Details</h3>
              <button
                type="button"
                onClick={() => {
                  setShowEventDetailsModal(false)
                  setSelectedEvent(null)
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Event Main Banner Card */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl shrink-0">
                  <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-black text-slate-900 tracking-tight">{selectedEvent.title}</h2>
                  <p className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedEvent.start_time} - {selectedEvent.end_time || '10:00 AM'}</span>
                  </p>
                  {selectedEvent.location && (
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedEvent.location}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Category</span>
                <span className="inline-block text-xs font-extrabold text-sky-700 bg-sky-100 px-3 py-1 rounded-xl">
                  {selectedEvent.category || 'Personal'}
                </span>
              </div>

              {/* Description */}
              {selectedEvent.notes || selectedEvent.description ? (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Description</span>
                  <p className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {selectedEvent.notes || selectedEvent.description}
                  </p>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenEditEvent(selectedEvent)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 transition-all text-xs"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Event
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmDeleteEvent(selectedEvent.id)}
                  className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Event
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Edit Event</h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditEventModal(false)
                  setSelectedEvent(null)
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Team Meeting"
                  value={editEventTitle}
                  onChange={(e) => setEditEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Discuss project updates..."
                  value={editEventNotes}
                  onChange={(e) => setEditEventNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Start Date & Time</label>
                  <input
                    type="date"
                    value={editEventStartDate}
                    onChange={(e) => setEditEventStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold mb-1"
                  />
                  <input
                    type="time"
                    value={editEventStartTime}
                    onChange={(e) => setEditEventStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">End Date & Time</label>
                  <input
                    type="date"
                    value={editEventEndDate}
                    onChange={(e) => setEditEventEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold mb-1"
                  />
                  <input
                    type="time"
                    value={editEventEndTime}
                    onChange={(e) => setEditEventEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Office, Room 302"
                  value={editEventLocation}
                  onChange={(e) => setEditEventLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Category</label>
                <select
                  value={editEventCategory}
                  onChange={(e) => setEditEventCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Family">Family</option>
                  <option value="Reminder">Reminder</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsAllDay"
                  checked={editEventIsAllDay}
                  onChange={(e) => setEditEventIsAllDay(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="editIsAllDay" className="font-extrabold text-slate-700 cursor-pointer">
                  All day event
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEditEventModal(false)
                    setSelectedEvent(null)
                  }}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Update Event
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* DELETE EVENT CONFIRM MODAL */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delete Event?</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="w-full rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteEvent}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Delete Event
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Card className="w-full max-w-md bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95 h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-y-auto pb-16 sm:pb-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Create Personal Event</h3>
              <button
                type="button"
                onClick={() => setShowAddEventModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Doctor Appointment, Family Lunch"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Health">Health</option>
                    <option value="Family">Family</option>
                    <option value="Reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={newEventEndTime}
                  onChange={(e) => setNewEventEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Office, Online"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional event details..."
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newIsAllDay"
                  checked={newEventIsAllDay}
                  onChange={(e) => setNewEventIsAllDay(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="newIsAllDay" className="font-extrabold text-slate-700 cursor-pointer">
                  All day event
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddEventModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Event
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CALENDAR SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Card className="w-full max-w-md bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95 h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-y-auto pb-16 sm:pb-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-600" />
                Calendar Preferences
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Calendar Language</label>
                <select
                  value={langPref}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="both">Tamil + English (இருமொழியும்)</option>
                  <option value="tamil">Tamil Only (தமிழ் மட்டுமே)</option>
                  <option value="english">English Only</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">City / Panchangam Location</label>
                <select
                  value={locationPref}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Bengaluru', 'Puducherry'].map((city) => (
                    <option key={city} value={city}>
                      {city}, Tamil Nadu
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Done
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
