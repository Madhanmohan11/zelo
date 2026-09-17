import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Palette, Sun, Moon, Laptop, ArrowLeft, Check, Image, Clock, Edit2, RotateCcw, ChevronRight } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { saveHeroSettings, resetHeroSettings } from '../../services/userSettingsService'
import { EditSloganModal } from '../../components/home/EditSloganModal'
import { ConfirmModal } from '../../components/ui/ConfirmModal'

export const AppearancePage = () => {
  const navigate = useNavigate()
  const { user, userSettings, updateThemePreference, refreshUserSettings } = useAuth()
  const { showToast } = useToast()

  const [selectedTheme, setSelectedTheme] = useState(
    userSettings?.theme || localStorage.getItem('zelo_theme') || 'light'
  )

  const [dynamicHeroEnabled, setDynamicHeroEnabled] = useState(
    userSettings?.dynamic_hero_enabled ?? true
  )
  const [autoTimeBgEnabled, setAutoTimeBgEnabled] = useState(
    userSettings?.auto_time_bg_enabled ?? true
  )
  const [customSlogan, setCustomSlogan] = useState(userSettings?.custom_slogan || '')
  const [isSloganModalOpen, setIsSloganModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

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

  const handleToggleDynamicHero = async () => {
    const nextVal = !dynamicHeroEnabled
    setDynamicHeroEnabled(nextVal)
    try {
      await saveHeroSettings(user.id, {
        dynamic_hero_enabled: nextVal,
        auto_time_bg_enabled: autoTimeBgEnabled
      })
      refreshUserSettings?.()
      showToast(`Dynamic Hero ${nextVal ? 'enabled' : 'disabled'}`, 'info')
    } catch (err) {
      showToast('Failed to update setting', 'error')
    }
  }

  const handleToggleAutoTimeBg = async () => {
    const nextVal = !autoTimeBgEnabled
    setAutoTimeBgEnabled(nextVal)
    try {
      await saveHeroSettings(user.id, {
        dynamic_hero_enabled: dynamicHeroEnabled,
        auto_time_bg_enabled: nextVal
      })
      refreshUserSettings?.()
      showToast(`Automatic background ${nextVal ? 'enabled' : 'disabled'}`, 'info')
    } catch (err) {
      showToast('Failed to update setting', 'error')
    }
  }

  const handleResetDefaults = () => {
    setIsResetModalOpen(true)
  }

  const handleExecuteReset = async () => {
    setIsResetting(true)
    try {
      await resetHeroSettings(user.id)
      setDynamicHeroEnabled(true)
      setAutoTimeBgEnabled(true)
      setCustomSlogan('')
      refreshUserSettings?.()
      showToast('Reset to default slogan and settings', 'success')
      setIsResetModalOpen(false)
    } catch (err) {
      showToast('Failed to reset settings', 'error')
    } finally {
      setIsResetting(false)
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
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Appearance & Personalization</h1>
          <p className="text-xs font-semibold text-slate-500">Customize visual theme and hero settings</p>
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
      </Card>

      {/* HERO PERSONALIZATION OPTIONS CARD MATCHING REFERENCE SCREENSHOT */}
      <Card className="bg-white border border-slate-200/70 p-6 rounded-3xl space-y-4 shadow-xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
          <Image className="w-3.5 h-3.5 text-emerald-600" /> Hero & Home Personalization
        </h3>

        <div className="divide-y divide-slate-100">
          {/* 1. DYNAMIC HERO BACKGROUND TOGGLE */}
          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                <Image className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Dynamic Hero Background</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Show beautiful backgrounds based on time of day.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleDynamicHero}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                dynamicHeroEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  dynamicHeroEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. AUTOMATIC TIME BACKGROUND TOGGLE */}
          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Use Automatic Background</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Change background automatically based on time.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAutoTimeBg}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                autoTimeBgEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  autoTimeBgEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. YOUR PERSONAL SLOGAN ROW */}
          <div
            onClick={() => setIsSloganModalOpen(true)}
            className="py-3 flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                <Edit2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Your Personal Slogan
                </h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
                  {customSlogan || 'A better you, every day.'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
          </div>

          {/* 4. RESET TO DEFAULT ROW */}
          <div
            onClick={handleResetDefaults}
            className="py-3 flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                <RotateCcw className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
                  Reset to Default
                </h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Use ZELO's default slogan and settings.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
          </div>
        </div>
      </Card>

      {/* EDIT SLOGAN MODAL */}
      <EditSloganModal
        isOpen={isSloganModalOpen}
        onClose={() => setIsSloganModalOpen(false)}
        currentSlogan={customSlogan}
        onSaveSuccess={(newVal) => {
          setCustomSlogan(newVal)
          refreshUserSettings?.()
        }}
      />
      {/* RESET CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleExecuteReset}
        title="Reset Appearance Settings?"
        message="Are you sure you want to reset your slogan and hero header settings to default? This action cannot be undone."
        confirmText="Reset Settings"
        isLoading={isResetting}
        variant="warning"
      />
    </div>
  )
}

export default AppearancePage
