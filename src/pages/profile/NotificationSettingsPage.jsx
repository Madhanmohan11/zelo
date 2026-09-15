import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Clock, ShieldCheck, ArrowLeft, Check, Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { updateUserSettings } from '../../services/dataService'

export const NotificationSettingsPage = () => {
  const navigate = useNavigate()
  const { user, userSettings, loadUserData } = useAuth()
  const { showToast } = useToast()

  const defaultNotifications = {
    daily_reminder: true,
    daily_reminder_time: '08:00',
    meal_reminders: true,
    workout_reminder: true,
    workout_reminder_time: '18:00',
    water_reminder: true,
    expense_reminder: true,
    expense_reminder_time: '21:00',
    goal_reminders: true
  }

  const [settings, setSettings] = useState(
    userSettings?.notification_settings || defaultNotifications
  )
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    userSettings?.notifications_enabled ?? true
  )
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (userSettings) {
      if (userSettings.notification_settings) {
        setSettings({ ...defaultNotifications, ...userSettings.notification_settings })
      }
      setNotificationsEnabled(userSettings.notifications_enabled ?? true)
    }
  }, [userSettings])

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const updateTime = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    try {
      await updateUserSettings(user.id, {
        notifications_enabled: notificationsEnabled,
        notification_settings: settings
      })

      await loadUserData(user.id)
      showToast('Notification preferences saved!', 'success')
      navigate('/profile')
    } catch (err) {
      console.error('Failed to save notification settings:', err)
      showToast('Failed to update notification settings', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const reminderOptions = [
    {
      id: 'daily_reminder',
      timeKey: 'daily_reminder_time',
      title: 'Daily Summary Reminder',
      description: 'Receive a morning briefing for scheduled meals and workouts',
      hasTime: true
    },
    {
      id: 'meal_reminders',
      title: 'Meal Reminders',
      description: 'Alerts at scheduled meal times',
      hasTime: false
    },
    {
      id: 'workout_reminder',
      timeKey: 'workout_reminder_time',
      title: 'Workout Reminder',
      description: 'Alert prior to planned training sessions',
      hasTime: true
    },
    {
      id: 'water_reminder',
      title: 'Water Hydration Reminders',
      description: 'Periodic hydration prompts during awake hours',
      hasTime: false
    },
    {
      id: 'expense_reminder',
      timeKey: 'expense_reminder_time',
      title: 'Evening Expense Log Reminder',
      description: 'End of day prompt to log expenses and check budget status',
      hasTime: true
    },
    {
      id: 'goal_reminders',
      title: 'Goal & Task Reminders',
      description: 'Notifications for items in your Remember collection',
      hasTime: false
    }
  ]

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs"
          title="Back to Profile"
          aria-label="Back to Profile"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Settings</h1>
          <p className="text-xs font-semibold text-slate-500">Configure reminder triggers and schedule times</p>
        </div>
      </div>

      {/* Main Settings Card */}
      <Card className="bg-white border border-slate-200/70 p-6 rounded-3xl space-y-6 shadow-xs">
        {/* Global Master Toggle */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Enable ZELO Reminders</h3>
              <p className="text-xs font-semibold text-slate-600">Master switch for all app reminder preferences</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Detailed Options List */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-3">
            {reminderOptions.map((opt) => {
              const isChecked = Boolean(settings[opt.id])
              return (
                <div
                  key={opt.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isChecked
                      ? 'bg-white border-slate-200/80 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200/50 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-extrabold text-slate-900">{opt.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{opt.description}</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSetting(opt.id)}
                        disabled={!notificationsEnabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Optional Time Picker when enabled */}
                  {opt.hasTime && isChecked && notificationsEnabled && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Reminder Time
                      </span>
                      <input
                        type="time"
                        value={settings[opt.timeKey] || '08:00'}
                        onChange={(e) => updateTime(opt.timeKey, e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Info Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Preferences are saved securely to your Supabase profile. Push notifications can be activated when browser permission is granted.
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/profile')}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Check}
              isLoading={isSaving}
              className="flex-1"
            >
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default NotificationSettingsPage
