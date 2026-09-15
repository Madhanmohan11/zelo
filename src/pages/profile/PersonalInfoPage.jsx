import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Calendar, ArrowLeft, Check, Shield } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { updateUserProfile } from '../../services/dataService'
import { ProfileAvatar } from '../../components/ui/ProfileAvatar'

export const PersonalInfoPage = () => {
  const navigate = useNavigate()
  const { user, profile, loadUserData } = useAuth()
  const { showToast } = useToast()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '')
  const [dob, setDob] = useState(profile?.dob || '')
  const [gender, setGender] = useState(profile?.gender || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhoneNumber(profile.phone_number || '')
      setDob(profile.dob || '')
      setGender(profile.gender || '')
    }
  }, [profile])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    const trimmedName = fullName.trim()
    if (!trimmedName) {
      showToast('Full name cannot be empty', 'error')
      return
    }

    setIsSaving(true)
    try {
      await updateUserProfile(user.id, {
        full_name: trimmedName,
        phone_number: phoneNumber.trim() || null,
        dob: dob || null,
        gender: gender || null
      })

      await loadUserData(user.id)
      showToast('Personal info saved successfully!', 'success')
      navigate('/profile')
    } catch (err) {
      console.error('Failed to save personal info:', err)
      showToast(err.message || 'Failed to update personal info', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Header with Back Navigation */}
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personal Info</h1>
          <p className="text-xs font-semibold text-slate-500">Update your account name and personal details</p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="bg-white border border-slate-200/70 p-6 rounded-3xl space-y-6 shadow-xs">
        {/* Avatar Display */}
        <div className="flex flex-col items-center pb-2 border-b border-slate-100">
          <ProfileAvatar size="xl" editable={true} showRemove={true} />
          <p className="text-xs text-slate-400 font-medium mt-2">Tap camera to upload or change profile photo</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Full Name Field */}
          <Input
            label="Full Name"
            icon={User}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
          />

          {/* Email Read-only Display */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Account Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 text-sm font-semibold select-none cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" /> Email is locked to your primary ZELO authentication identity.
            </p>
          </div>

          {/* Phone Number Field */}
          <Input
            label="Phone Number"
            type="tel"
            icon={Phone}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91 98765 43210"
          />

          {/* Date of Birth & Gender Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              icon={Calendar}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/80 text-slate-800 text-sm font-semibold focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Submit Actions */}
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
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default PersonalInfoPage
