import React, { useState, useEffect, useRef } from 'react'
import { User, Mail, Sliders, Bell, Palette, HelpCircle, Shield, LogOut, Camera, Trash2, ChevronRight, Save } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { UserAvatar } from '../components/ui/UserAvatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateUserProfile, updateUserSettings } from '../services/dataService'
import { uploadAvatar, removeAvatar } from '../services/avatarService'

export const ProfilePage = () => {
  const { user, profile, userSettings, loadUserData, logout } = useAuth()
  const { showToast } = useToast()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [wakeTime, setWakeTime] = useState(userSettings?.wake_time || '07:00')
  const [sleepTime, setSleepTime] = useState(userSettings?.sleep_time || '23:00')
  const [waterTarget, setWaterTarget] = useState(userSettings?.water_target_ml || 2500)
  const [expenseBudget, setExpenseBudget] = useState(userSettings?.daily_expense_budget || 1000)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  // Native device file picker ref
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
    }
    if (userSettings) {
      setWakeTime(userSettings.wake_time || '07:00')
      setSleepTime(userSettings.sleep_time || '23:00')
      setWaterTarget(userSettings.water_target_ml || 2500)
      setExpenseBudget(userSettings.daily_expense_budget || 1000)
    }
  }, [profile, userSettings])

  // Native device file picker change handler
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    try {
      await uploadAvatar(file, user.id)
      await loadUserData(user.id)
      showToast('Profile photo updated successfully!', 'success')
    } catch (err) {
      console.error('Avatar upload error:', err)
      showToast(err.message || 'Unable to upload photo. Please try again.', 'error')
    } finally {
      setIsUploading(false)
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle avatar removal
  const handleRemovePhoto = async () => {
    if (!user || !profile?.avatar_url) return

    if (!window.confirm('Remove your profile photo?')) return

    setIsRemoving(true)
    try {
      await removeAvatar(user.id, profile.avatar_url)
      await loadUserData(user.id)
      showToast('Profile photo removed.', 'info')
    } catch (err) {
      console.error('Avatar remove error:', err)
      showToast('Unable to remove photo. Please try again.', 'error')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      await updateUserProfile(user.id, {
        full_name: fullName
      })

      await updateUserSettings(user.id, {
        wake_time: wakeTime,
        sleep_time: sleepTime,
        water_target_ml: parseInt(waterTarget) || 2500,
        daily_expense_budget: parseFloat(expenseBudget) || 1000
      })

      await loadUserData(user.id)
      showToast('Profile preferences updated!', 'success')
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
    { title: 'Help & Support', icon: HelpCircle, onClick: () => showToast('ZELO Support: support@zelo.app', 'info') },
    { title: 'Privacy', icon: Shield, onClick: () => showToast('Privacy Policy & RLS Active', 'info') },
  ]

  const hasPhoto = Boolean(profile?.avatar_url)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile</h1>
      </div>

      {/* Avatar & User Header Card */}
      <Card className="bg-white border border-slate-200/70 p-6 rounded-3xl flex flex-col items-center text-center shadow-xs">
        <div className="relative mb-3">
          <UserAvatar
            avatarPath={profile?.avatar_url}
            name={profile?.full_name || user?.email}
            size="xl"
            editable
            onEditClick={() => fileInputRef.current?.click()}
            isLoading={isUploading || isRemoving}
          />
        </div>

        <h2 className="text-xl font-black text-slate-900">{profile?.full_name || 'User'}</h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{user?.email || ''}</p>

        {/* PHOTO ACTION BUTTONS */}
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRemoving}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>{hasPhoto ? 'Change Photo' : 'Upload Photo'}</span>
          </button>

          {hasPhoto && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isUploading || isRemoving}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Remove Photo</span>
            </button>
          )}
        </div>
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
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            icon={User}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
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

          <Input
            label="Daily Expense Budget (₹)"
            type="number"
            value={expenseBudget}
            onChange={(e) => setExpenseBudget(e.target.value)}
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
