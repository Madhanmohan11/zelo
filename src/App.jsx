import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ModuleProvider } from './context/ModuleContext'
import { DashboardProvider } from './context/DashboardContext'
import { ToastProvider } from './context/ToastContext'
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
import { SettingsPage } from './pages/SettingsPage'
import { LoadingState } from './components/ui/LoadingState'

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
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <LoadingState message="Redirecting to your ZELO portal..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to="/today" replace />
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <DashboardProvider>
            <ModuleProvider>
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

                {/* Main Application Shell Protected Routes */}
                <Route
                  element={
                    <ProtectedRoute>
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


                {/* Standalone ZELO Admin Panel Routes (Frontend-only setup before Supabase auth connection) */}
                <Route path="/admin" element={<AdminLayout />}>
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
            </ModuleProvider>
          </DashboardProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App

