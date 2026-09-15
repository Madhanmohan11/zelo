import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Sliders,
  Bell,
  Palette,
  Download,
  Lock,
  LogOut,
  Trash2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { ProfileAvatar } from '../components/ui/ProfileAvatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuth()
  const { showToast } = useToast()

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const fullName = profile?.full_name || user?.user_metadata?.full_name || 'ZELO Member'
  const userEmail = user?.email || 'authenticated@zelo.app'

  const handleExportData = () => {
    try {
      const exportObject = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('zelo_')) {
          exportObject[key] = localStorage.getItem(key)
        }
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `zelo_backup_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      showToast('ZELO JSON data exported successfully!', 'success')
    } catch (e) {
      showToast('Failed to export data', 'error')
    }
  }

  const settingsModules = [
    {
      title: 'Personal Info',
      subtitle: 'Name, contact & profile photo',
      icon: User,
      path: '/profile/personal',
      color: 'bg-emerald-100 text-emerald-800'
    },
    {
      title: 'Daily Settings',
      subtitle: 'Schedule, water target & expense budget',
      icon: Sliders,
      path: '/profile/daily-settings',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Notification Settings',
      subtitle: 'Reminders & alert preferences',
      icon: Bell,
      path: '/profile/notifications',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Appearance',
      subtitle: 'System, Light, and Dark themes',
      icon: Palette,
      path: '/profile/appearance',
      color: 'bg-amber-100 text-amber-800'
    },
    {
      title: 'Data Backup & Export',
      subtitle: 'Download full JSON backup of your ZELO records',
      icon: Download,
      onClick: handleExportData,
      color: 'bg-indigo-100 text-indigo-800'
    }
  ]

  const securityModules = [
    {
      title: 'Change Password',
      subtitle: 'Update account authentication password',
      icon: Lock,
      path: '/profile/security',
      color: 'bg-slate-100 text-slate-800'
    },
    {
      title: 'Logout',
      subtitle: 'Sign out of current active session',
      icon: LogOut,
      onClick: () => setIsLogoutModalOpen(true),
      color: 'bg-rose-50 text-rose-600',
      textColor: 'text-rose-600'
    },
    {
      title: 'Delete Account',
      subtitle: 'Permanent account deletion request',
      icon: Trash2,
      path: '/profile/security',
      color: 'bg-rose-100 text-rose-700',
      textColor: 'text-rose-700'
    }
  ]

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false)
    try {
      await logout()
      showToast('Logged out successfully', 'info')
      navigate('/login')
    } catch (err) {
      showToast('Error signing out', 'error')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile</h1>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">Manage your account preferences and daily settings</p>
      </div>

      {/* Primary User Profile Header Card */}
      <Card className="bg-white border border-slate-200/70 p-6 rounded-3xl flex flex-col items-center text-center shadow-xs relative overflow-hidden">
        <div className="mb-3">
          <ProfileAvatar
            size="lg"
            editable={true}
            showRemove={true}
          />
        </div>

        <h2 className="text-xl font-black text-slate-900 mt-1 tracking-tight">{fullName}</h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
          {userEmail}
        </p>
      </Card>

      {/* Main Profile Settings Navigation List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
          General Preferences
        </h3>

        <div className="space-y-2">
          {settingsModules.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.title}
                onClick={() => {
                  if (item.onClick) item.onClick()
                  else if (item.path) navigate(item.path)
                }}
                className="bg-white border border-slate-200/70 p-4 rounded-3xl flex items-center justify-between shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-2xl ${item.color} font-bold`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Card>
            )
          })}
        </div>
      </div>

      {/* Account & Security Section */}
      <div className="space-y-2.5 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
          Account & Security
        </h3>

        <div className="space-y-2">
          {securityModules.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.title}
                onClick={() => {
                  if (item.onClick) item.onClick()
                  else if (item.path) navigate(item.path)
                }}
                className="bg-white border border-slate-200/70 p-4 rounded-3xl flex items-center justify-between shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-2xl ${item.color} font-bold`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-extrabold ${item.textColor || 'text-slate-900'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Card>
            )
          })}
        </div>
      </div>

      {/* Logout Modal Confirmation */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm font-medium text-slate-600">
            Are you sure you want to sign out of ZELO?
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmLogout}
              className="flex-1"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProfilePage
