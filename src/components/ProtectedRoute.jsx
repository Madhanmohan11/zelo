import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from './ui/LoadingState'

export const ProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <LoadingState message="Loading your ZELO session..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect to onboarding if profile exists and onboarding is not completed
  const onboardingCompleted = profile?.onboarding_completed
  if (profile && !onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
