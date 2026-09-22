import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ModuleProvider } from './context/ModuleContext'
import { DashboardProvider } from './context/DashboardContext'
import { ToastProvider } from './context/ToastContext'
import { AIProvider } from './context/AIContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import { AppLayout } from './layouts/AppLayout'

import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'

import { TodayPage } from './pages/TodayPage'
import { TasksPage } from './pages/TasksPage'
import { FoodPage } from './pages/FoodPage'
import { WorkoutPage } from './pages/WorkoutPage'
import { RememberPage } from './pages/RememberPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { CalendarPage } from './pages/CalendarPage'
import { WaterPage } from './pages/WaterPage'
import { SleepPage } from './pages/SleepPage'
import { GoalsPage } from './pages/GoalsPage'
import { MorePage } from './pages/MorePage'
import { CustomizeModulesPage } from './pages/CustomizeModulesPage'
import { ProfilePage } from './pages/ProfilePage'
import { PersonalInfoPage } from './pages/profile/PersonalInfoPage'
import { DailySettingsPage } from './pages/profile/DailySettingsPage'
import { NotificationSettingsPage } from './pages/profile/NotificationSettingsPage'
import { AppearancePage } from './pages/profile/AppearancePage'
import { AccountSecurityPage } from './pages/profile/AccountSecurityPage'
import { LoadingState } from './components/ui/LoadingState'
import { Button } from './components/ui/Button'

// Admin Panel Components & Pages
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage'
import { AdminSystemPage } from './pages/admin/AdminSystemPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AdminProfilePage } from './pages/admin/AdminProfilePage'

const HomeRedirect = () => {
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

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <LoadingState message="Redirecting to your ZELO portal..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

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
            Invalid account role assigned ({String(profile.role)}). Please contact support.
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

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <DashboardProvider>
            <ModuleProvider>
              <AIProvider>
                <Routes>
                  {/* Home Redirect Logic */}
                  <Route path="/" element={<HomeRedirect />} />

                  {/* Public Auth Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/verify-email"
                    element={
                      <PublicRoute>
                        <VerifyEmailPage />
                      </PublicRoute>
                    }
                  />

                  {/* Main Application Shell Protected User Routes */}
                  <Route
                    element={
                      <ProtectedRoute requireRole="user">
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/today" element={<TodayPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/food" element={<FoodPage />} />
                    <Route path="/workout" element={<WorkoutPage />} />
                    <Route path="/remember" element={<RememberPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/expenses/savings" element={<ExpensesPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/water" element={<WaterPage />} />
                    <Route path="/sleep" element={<SleepPage />} />
                    <Route path="/goals" element={<GoalsPage />} />
                    <Route path="/more" element={<MorePage />} />
                    <Route path="/customize-modules" element={<CustomizeModulesPage />} />
                    <Route path="/settings/modules" element={<CustomizeModulesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/personal" element={<PersonalInfoPage />} />
                    <Route path="/profile/daily-settings" element={<DailySettingsPage />} />
                    <Route path="/profile/notifications" element={<NotificationSettingsPage />} />
                    <Route path="/profile/appearance" element={<AppearancePage />} />
                    <Route path="/profile/security" element={<AccountSecurityPage />} />
                    <Route path="/settings" element={<Navigate to="/profile" replace />} />
                  </Route>

                  {/* ZELO Admin Panel Protected Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireRole="admin">
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="users/:id" element={<AdminUserDetailPage />} />
                    <Route path="analytics" element={<AdminAnalyticsPage />} />
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="notifications" element={<AdminNotificationsPage />} />
                    <Route path="system" element={<AdminSystemPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="profile" element={<AdminProfilePage />} />
                  </Route>

                  {/* Fallback Catch-all Route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AIProvider>
            </ModuleProvider>
          </DashboardProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}


export default App

