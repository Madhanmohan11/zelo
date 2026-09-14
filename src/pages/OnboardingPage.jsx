import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Droplets, DollarSign, ArrowRight, SkipForward } from 'lucide-react'
import zeloLogo from '../assets/Logo.png'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const OnboardingPage = () => {
  const navigate = useNavigate()
  const { saveOnboarding, userSettings } = useAuth()
  const { showToast } = useToast()

  const [wakeTime, setWakeTime] = useState(userSettings?.wake_time || '07:00')
  const [sleepTime, setSleepTime] = useState(userSettings?.sleep_time || '23:00')
  const [waterTarget, setWaterTarget] = useState(userSettings?.water_target_ml || 2500)
  const [expenseBudget, setExpenseBudget] = useState(userSettings?.daily_expense_budget || 1000)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await saveOnboarding({
        wake_time: wakeTime,
        sleep_time: sleepTime,
        water_target_ml: waterTarget,
        daily_expense_budget: expenseBudget
      })
      showToast('Preferences saved! Welcome to your dashboard.', 'success')
      navigate('/today', { replace: true })
    } catch (err) {
      showToast(err.message || 'Failed to save preferences', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    try {
      await saveOnboarding({
        wake_time: '07:00',
        sleep_time: '23:00',
        water_target_ml: 2500,
        daily_expense_budget: 1000
      })
      navigate('/today', { replace: true })
    } catch (err) {
      navigate('/today', { replace: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen ambient-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={zeloLogo} alt="ZELO — Your day. Your way." className="h-14 w-auto object-contain mb-4" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome to ZELO 👋</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Let's set up your day.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Wake-up Time"
                type="time"
                icon={Clock}
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />

              <Input
                label="Sleep Time"
                type="time"
                icon={Clock}
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
              />
            </div>

            <Input
              label="Daily Water Target (ml)"
              type="number"
              icon={Droplets}
              placeholder="e.g. 2500"
              value={waterTarget}
              onChange={(e) => setWaterTarget(e.target.value)}
              helperText="Recommended: 2500 ml / day"
            />

            <Input
              label="Daily Expense Budget (₹) (Optional)"
              type="number"
              icon={DollarSign}
              placeholder="e.g. 1000"
              value={expenseBudget}
              onChange={(e) => setExpenseBudget(e.target.value)}
              helperText="Optional budget limit for daily spending alerts"
            />

            <div className="pt-4 flex flex-col gap-2">
              <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading}>
                <span>Save & Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                className="py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-1 mt-1"
              >
                <span>Skip for now</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
