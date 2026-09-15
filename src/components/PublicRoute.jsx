import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from './ui/LoadingState'

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <LoadingState message="Checking session..." />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/today" replace />
  }

  return children
}
