import React, { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from './ui/LoadingState'
import { Button } from './ui/Button'

export const PublicRoute = ({ children }) => {
  const { user, profile, profileLoading, profileError, loading, logout, loadUserData } = useAuth()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!user || isRetrying) return
    setIsRetrying(true)
    try {
      await loadUserData(user.id)
    } finally {
      setIsRetrying(false)
    }
  }

  // 1. Loading state during auth or profile resolution
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <LoadingState message="Checking session..." />
      </div>
    )
  }

  // 2. Authenticated user -> redirect based on explicit profile.role
  if (user) {
    if (profileError || !profile) {
      return (
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Profile Recovery Required
              </h2>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                {profileError || 'Could not load your user profile details.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="primary"
                onClick={handleRetry}
                isLoading={isRetrying}
                className="w-full rounded-2xl text-xs font-extrabold"
                icon={RefreshCw}
              >
                Retry Profile Load
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={logout}
                className="w-full rounded-2xl text-xs font-extrabold border-slate-200 text-slate-700 hover:bg-slate-100"
                icon={LogOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )
    }

    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />
    }

    if (profile.role === 'user') {
      return <Navigate to="/today" replace />
    }

    // Invalid / Unknown role
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 shadow-xs">
            <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Access Error
            </h2>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Invalid account role assigned ({String(profile.role)}). Please contact support at <span className="font-bold text-slate-700">support@zelo.app</span>.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={logout}
              className="w-full rounded-2xl text-xs font-extrabold border-slate-200"
              icon={LogOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 3. Unauthenticated user -> render public auth page
  return children || <Outlet />
}

