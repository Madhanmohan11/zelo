import { useState, useEffect, useCallback } from 'react'
import morningImg from '../assets/HeroSection/Morning.png'
import afternoonImg from '../assets/HeroSection/Afternoon.png'
import eveningImg from '../assets/HeroSection/Evening.png'
import nightImg from '../assets/HeroSection/Night.png'

export const getTimePeriod = (overrideTimeMode = null) => {
  const currentHour = new Date().getHours()

  if (overrideTimeMode === 'morning') return 'morning'
  if (overrideTimeMode === 'afternoon') return 'afternoon'
  if (overrideTimeMode === 'evening') return 'evening'
  if (overrideTimeMode === 'night') return 'night'

  if (currentHour >= 5 && currentHour < 12) return 'morning'
  if (currentHour >= 12 && currentHour < 17) return 'afternoon'
  if (currentHour >= 17 && currentHour < 20) return 'evening'
  return 'night' // 20:00 - 04:59
}

export const TIME_PERIOD_CONFIGS = {
  morning: {
    id: 'morning',
    name: 'Morning',
    timeRange: '5:00 AM – 11:59 AM',
    bgImage: morningImg,
    greetingTemplate: (name) => `Good morning, ${name} ☀️`,
    supportingText: 'Start your day with purpose.',
    icon: '☀️',
    badgeLabel: 'Morning',
    badgeStyle: 'bg-amber-500/30 border-amber-300/40 text-amber-100',
    overlayClass: 'bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-slate-900/30',
    textClass: 'text-white',
    subtextClass: 'text-amber-100/90'
  },
  afternoon: {
    id: 'afternoon',
    name: 'Afternoon',
    timeRange: '12:00 PM – 4:59 PM',
    bgImage: afternoonImg,
    greetingTemplate: (name) => `Good afternoon, ${name} 🌤️`,
    supportingText: 'Keep moving toward your goals.',
    icon: '🌤️',
    badgeLabel: 'Afternoon',
    badgeStyle: 'bg-sky-500/30 border-sky-300/40 text-sky-100',
    overlayClass: 'bg-gradient-to-t from-slate-950/85 via-slate-900/45 to-slate-900/25',
    textClass: 'text-white',
    subtextClass: 'text-sky-100/90'
  },
  evening: {
    id: 'evening',
    name: 'Evening',
    timeRange: '5:00 PM – 7:59 PM',
    bgImage: eveningImg,
    greetingTemplate: (name) => `Good evening, ${name} 👋`,
    supportingText: 'Reflect on your progress today.',
    icon: '🌅',
    badgeLabel: 'Evening',
    badgeStyle: 'bg-orange-500/30 border-orange-300/40 text-orange-100',
    overlayClass: 'bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-slate-900/30',
    textClass: 'text-white',
    subtextClass: 'text-orange-100/90'
  },
  night: {
    id: 'night',
    name: 'Night',
    timeRange: '8:00 PM – 4:59 AM',
    bgImage: nightImg,
    greetingTemplate: (name) => `Good night, ${name} 🌙`,
    supportingText: 'Rest well. Brighter tomorrow.',
    icon: '🌙',
    badgeLabel: 'Night',
    badgeStyle: 'bg-indigo-900/60 border-indigo-500/50 text-indigo-100',
    overlayClass: 'bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-900/40',
    textClass: 'text-white',
    subtextClass: 'text-indigo-200/90'
  }
}

export const DEFAULT_TWO_LINE_SLOGAN = "Stay consistent.\nYour future self will thank you."

export const useTimePeriod = (autoTimeBgEnabled = true) => {
  const [periodKey, setPeriodKey] = useState(() => getTimePeriod())

  const updatePeriod = useCallback(() => {
    if (!autoTimeBgEnabled) return
    const newPeriod = getTimePeriod()
    setPeriodKey((prev) => (prev !== newPeriod ? newPeriod : prev))
  }, [autoTimeBgEnabled])

  useEffect(() => {
    updatePeriod()

    const interval = setInterval(updatePeriod, 60000)
    return () => clearInterval(interval)
  }, [updatePeriod])

  const periodConfig = TIME_PERIOD_CONFIGS[periodKey] || TIME_PERIOD_CONFIGS.morning

  return {
    periodKey,
    setPeriodKey,
    periodConfig,
    getTimePeriod
  }
}
