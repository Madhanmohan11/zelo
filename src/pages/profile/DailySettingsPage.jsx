import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sliders, Sun, Moon, Droplets, IndianRupee, ArrowLeft, Check } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { updateUserSettings } from '../../services/dataService'

export const DailySettingsPage = () => {
  const navigate = useNavigate()
  const { user, userSettings, loadUserData } = useAuth()
  const { showToast } = useToast()

  const [wakeTime, setWakeTime] = useState(userSettings?.wake_time || '07:00')
  const [sleepTime, setSleepTime] = useState(userSettings?.sleep_time || '23:00')
  const [waterTarget, setWaterTarget] = useState(userSettings?.water_target_ml || 2500)
  const [expenseBudget, setExpenseBudget] = useState(userSettings?.daily_expense_budget || 1000)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (userSettings) {
      setWakeTime(userSettings.wake_time || '07:00')
      setSleepTime(userSettings.sleep_time || '23:00')
      setWaterTarget(userSettings.water_target_ml || 2500)
      setExpenseBudget(userSettings.daily_expense_budget || 1000)
    }
  }, [userSettings])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    const parsedWater = parseInt(waterTarget)
    if (isNaN(parsedWater) || parsedWater < 500 || parsedWater > 10000) {
      showToast('Please enter a valid daily water target between 500 ml and 10,000 ml.', 'error')
      return
    }

    const parsedBudget = parseFloat(expenseBudget)
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      showToast('Please enter a valid expense budget.', 'error')
      return
    }

    setIsSaving(true)
    try {
      await updateUserSettings(user.id, {
        wake_time: wakeTime,
        sleep_time: sleepTime,
        water_target_ml: parsedWater,
        daily_expense_budget: parsedBudget
      })

      await loadUserData(user.id)
      window.dispatchEvent(new Event('zelo_data_updated'))
      showToast('Daily preferences updated across ZELO!', 'success')
      navigate('/profile')
    } catch (err) {
      console.error('Failed to save daily settings:', err)
      showToast(err.message || 'Failed to update daily settings', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Header */}
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Settings</h1>
          <p className="text-xs font-semibold text-slate-500">Configure your daily targets, schedule, and budgets</p>
        </div>
      </div>

      {/* Main Settings Form Card */}
      <Card className="bg-white border border-slate-200/70 p-6 rounded-3xl space-y-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Wake & Sleep Times */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" /> Daily Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Wake-up Time"
                type="time"
                icon={Sun}
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                required
              />
              <Input
                label="Sleep Time"
                type="time"
                icon={Moon}
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                required
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Water Target */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-600" /> Hydration Goal
            </h3>
            <Input
              label="Daily Water Target (ml)"
              type="number"
              icon={Droplets}
              value={waterTarget}
              onChange={(e) => setWaterTarget(e.target.value)}
              placeholder="2500"
              required
            />
            <p className="text-[11px] font-medium text-slate-400">
              Current target: {(waterTarget / 1000).toFixed(1)} Liters / day
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Expense Budget */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Financial Budget
            </h3>
            <Input
              label="Daily Expense Budget (₹)"
              type="number"
              icon={IndianRupee}
              value={expenseBudget}
              onChange={(e) => setExpenseBudget(e.target.value)}
              placeholder="1000"
              required
            />
            <p className="text-[11px] font-medium text-slate-400">
              Used in Expenses dashboard and Today snapshot budget progress bar.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center gap-3">
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
              Save Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default DailySettingsPage
