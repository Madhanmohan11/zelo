import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const SavingsCalendar = ({
  year,
  month, // 0-indexed (0 = Jan, 8 = Sep)
  onMonthYearChange,
  selectedDate,
  onSelectDate,
  activityDates = {}
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Handle month navigation
  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthYearChange(11, year - 1)
    } else {
      onMonthYearChange(month - 1, year)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      onMonthYearChange(0, year + 1)
    } else {
      onMonthYearChange(month + 1, year)
    }
  }

  // Calculate calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const gridCells = []

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    gridCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateStr: null
    })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const monthStr = String(month + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${year}-${monthStr}-${dayStr}`
    gridCells.push({
      day,
      isCurrentMonth: true,
      dateStr
    })
  }

  // Next month leading days to complete week rows
  const remainingCells = (7 - (gridCells.length % 7)) % 7
  for (let day = 1; day <= remainingCells; day++) {
    gridCells.push({
      day,
      isCurrentMonth: false,
      dateStr: null
    })
  }

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-100/90 shadow-2xs space-y-3">
      {/* CALENDAR HEADER */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
          Calendar
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            {monthNames[month]} {year}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DAYS OF WEEK HEADER */}
      <div className="grid grid-cols-7 text-center">
        {daysOfWeek.map((d) => (
          <span key={d} className="text-[11px] font-bold text-slate-400 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* CALENDAR DAYS GRID */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {gridCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div key={idx} className="py-2 text-xs font-medium text-slate-300 pointer-events-none">
                {cell.day}
              </div>
            )
          }

          const isSelected = selectedDate === cell.dateStr
          const activity = activityDates[cell.dateStr] || {}

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : cell.dateStr)}
              className="flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer group focus:outline-none"
            >
              <span
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                {cell.day}
              </span>

              {/* TRANSACTION DOT INDICATORS */}
              <div className="flex items-center justify-center gap-0.5 mt-0.5 h-1.5">
                {activity.hasIncome && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
                {activity.hasExpense && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                )}
                {activity.hasSavings && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* CALENDAR LEGEND */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Expense
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Savings / Transfer
        </span>
      </div>
    </div>
  )
}
