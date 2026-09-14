import React, { useState, useEffect } from 'react'
import { User, Mail, Sliders, Bell, Palette, HelpCircle, Shield, LogOut, Camera, ChevronRight, Save } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateUserProfile, updateUserSettings } from '../services/dataService'

export const ProfilePage = () => {
  const { user, profile, userSettings, loadUserData, logout } = useAuth()
  const { showToast } = useToast()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

  const [wakeTime, setWakeTime] = useState(userSettings?.wake_time || '07:00')
  const [sleepTime, setSleepTime] = useState(userSettings?.sleep_time || '23:00')
  const [waterTarget, setWaterTarget] = useState(userSettings?.water_target_ml || 2500)
  const [expenseBudget, setExpenseBudget] = useState(userSettings?.daily_expense_budget || 1000)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
    }
    if (userSettings) {
      setWakeTime(userSettings.wake_time || '07:00')
      setSleepTime(userSettings.sleep_time || '23:00')
      setWaterTarget(userSettings.water_target_ml || 2500)
      setExpenseBudget(userSettings.daily_expense_budget || 1000)
    }
  }, [profile, userSettings])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      await updateUserProfile(user.id, {
        full_name: fullName,
        avatar_url: avatarUrl
      })

      await updateUserSettings(user.id, {
        wake_time: wakeTime,
        sleep_time: sleepTime,
        water_target_ml: parseInt(waterTarget) || 2500,
        daily_expense_budget: parseFloat(expenseBudget) || 1000
      })

      await loadUserData(user.id)
      showToast('Profile updated successfully!', 'success')
      setIsModalOpen(false)
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const menuSections = [
    { title: 'Personal Info', icon: User, onClick: () => setIsModalOpen(true) },
    { title: 'Daily Settings', icon: Sliders, onClick: () => setIsModalOpen(true) },
    { title: 'Notification Settings', icon: Bell, onClick: () => showToast('Notifications configured in browser', 'info') },
    { title: 'Appearance', icon: Palette, onClick: () => showToast('Appearance set to Soft Light theme', 'info') },
    { title: 'Help & Support', icon: HelpCircle, onClick: () => showToast('LifeOS Support: support@lifeos.app', 'info') },
    { title: 'Privacy', icon: Shield, onClick: () => showToast('Privacy Policy & RLS Active', 'info') },
  ]

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile</h1>
      </div>

      {/* Avatar & User Header Card */}
      <Card className="bg-white border border-slate-200/70 p-6 rounded-3xl flex flex-col items-center text-center shadow-xs">
        <div className="relative mb-3">
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-[#0F172A] text-white shadow-md hover:scale-105 transition-all"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        <h2 className="text-xl font-black text-slate-900">{fullName || 'Madhan'}</h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{user?.email || 'madhan@example.com'}</p>
      </Card>

      {/* Settings Navigation List */}
      <div className="space-y-2">
        {menuSections.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.title}
              onClick={item.onClick}
              className="bg-white border border-slate-200/70 p-4 rounded-3xl flex items-center justify-between shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">{item.title}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Card>
          )
        })}

        {/* Logout Option */}
        <Card
          onClick={logout}
          className="bg-white border border-slate-200/70 p-4 rounded-3xl flex items-center justify-between shadow-xs hover:border-rose-200 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-extrabold text-rose-600">Logout</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-300" />
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Profile & Preferences"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            icon={User}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Avatar Image URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Wake Time"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
            <Input
              label="Sleep Time"
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
            />
          </div>

          <Input
            label="Daily Water Target (ml)"
            type="number"
            value={waterTarget}
            onChange={(e) => setWaterTarget(e.target.value)}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
