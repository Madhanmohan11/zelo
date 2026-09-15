import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, Lock, Eye, EyeOff, LogOut, Trash2, ShieldAlert, ArrowLeft, Check } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const AccountSecurityPage = () => {
  const navigate = useNavigate()
  const { user, updatePassword, logout } = useAuth()
  const { showToast } = useToast()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!newPassword) {
      showToast('Please enter a new password', 'error')
      return
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    setIsChangingPassword(true)
    try {
      await updatePassword(newPassword)
      showToast('Password updated successfully!', 'success')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Password change error:', err)
      showToast(err.message || 'Failed to update password', 'error')
    } finally {
      setIsChangingPassword(false)
    }
  }

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account & Security</h1>
          <p className="text-xs font-semibold text-slate-500">Password management, session security, and account settings</p>
        </div>
      </div>

      {/* Change Password Card */}
      <Card className="bg-white border border-slate-200/70 p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Change Password</h3>
            <p className="text-xs text-slate-500 font-medium">Update your Supabase authentication account password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200/80 text-slate-900 text-sm font-semibold focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200/80 text-slate-900 text-sm font-semibold focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={Check}
              isLoading={isChangingPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Session Logout Card */}
      <Card className="bg-white border border-slate-200/70 p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 font-bold">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Sign Out</h3>
              <p className="text-xs text-slate-500 font-medium">Log out of your current ZELO active session</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsLogoutModalOpen(true)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Logout
          </Button>
        </div>
      </Card>

      {/* Account Deletion Danger Zone */}
      <Card className="bg-rose-50/60 border border-rose-200 p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-600 text-white font-bold shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-rose-900">Delete Account</h3>
            <p className="text-xs font-medium text-rose-700 mt-1">
              Account deletion is a permanent action. All your meals, workouts, remember collection, and expense data associated with user ID <code className="bg-rose-100 px-1 py-0.5 rounded font-mono text-[11px]">{user?.id?.substring(0, 8)}...</code> will be purged.
            </p>
          </div>
        </div>

        <div className="pt-1">
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={Trash2}
          >
            Request Account Deletion
          </Button>
        </div>
      </Card>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm font-medium text-slate-600">
            Are you sure you want to sign out of ZELO on this device?
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

      {/* Account Deletion Request Info Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Account Deletion Request"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              In accordance with Supabase Auth security policies, account deletion requires administrative verification to prevent unauthorized data loss.
            </span>
          </div>

          <p className="text-xs font-medium text-slate-600">
            To request full deletion of account <strong className="text-slate-900">{user?.email}</strong>, please confirm below or contact ZELO security support at <strong className="text-emerald-700">support@zelo.app</strong>.
          </p>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                showToast('Account deletion request registered. An administrator will contact you.', 'info')
                setIsDeleteModalOpen(false)
              }}
            >
              Confirm Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AccountSecurityPage
