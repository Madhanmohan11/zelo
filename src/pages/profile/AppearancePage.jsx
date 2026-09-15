import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Palette, Sun, Moon, Laptop, ArrowLeft, Check } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const AppearancePage = () => {
  const navigate = useNavigate()
  const { userSettings, updateThemePreference } = useAuth()
  const { showToast } = useToast()

  const [selectedTheme, setSelectedTheme] = useState(
    userSettings?.theme || localStorage.getItem('zelo_theme') || 'light'
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSelectTheme = async (mode) => {
    setSelectedTheme(mode)
    try {
      await updateThemePreference(mode)
      showToast(`Appearance updated to ${mode.toUpperCase()} mode!`, 'success')
    } catch (err) {
      console.error('Failed to change theme:', err)
      showToast('Could not save theme preference', 'error')
    }
  }

  const themeOptions = [
    {
      id: 'system',
      title: 'System',
      description: 'Automatically match your device operating system theme setting',
      icon: Laptop,
      badge: 'Auto'
    },
    {
      id: 'light',
      title: 'Light (Default)',
      description: 'ZELO classic soft ambient light UI theme',
      icon: Sun,
      badge: 'Classic'
    },
    {
      id: 'dark',
      title: 'Dark',
      description: 'Sleek dark mode tailored for low light conditions and battery savings',
      icon: Moon,
      badge: 'Night'
    }
  ]

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Appearance</h1>
          <p className="text-xs font-semibold text-slate-500">Customize visual theme and interface mode</p>
        </div>
      </div>

      {/* Theme Cards List */}
      <Card className="bg-white border border-slate-200/70 p-6 rounded-3xl space-y-4 shadow-xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
          <Palette className="w-3.5 h-3.5 text-emerald-600" /> Select Application Theme
        </h3>

        <div className="space-y-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon
            const isSelected = selectedTheme === opt.id
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectTheme(opt.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-50/50 border-emerald-500 shadow-2xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{opt.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{opt.description}</p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate('/profile')}
            icon={Check}
          >
            Done
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default AppearancePage
