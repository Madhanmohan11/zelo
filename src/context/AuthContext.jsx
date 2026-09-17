import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  getUserProfile,
  getUserSettings,
  createUserProfile,
  createUserSettings,
  updateUserProfile,
  updateUserSettings
} from '../services/dataService'

const AuthContext = createContext(null)

// Storage key for mock session when Supabase env vars aren't configured yet
const MOCK_AUTH_KEY = 'zelo_mock_session'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)
  const [userSettings, setUserSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null)

  // Initialize Auth session
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          // Real Supabase Auth session listener
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            setUser(session.user)
            await loadUserData(session.user.id)
          } else {
            setProfileLoading(false)
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              setUser(session.user)
              await loadUserData(session.user.id)
            } else {
              setUser(null)
              setProfile(null)
              setProfileError(null)
              setProfileLoading(false)
              setUserSettings(null)
            }
          })

          return () => {
            subscription?.unsubscribe()
          }
        } else {
          // Fallback Local Auth Session Mode
          const rawSession = localStorage.getItem(MOCK_AUTH_KEY)
          if (rawSession) {
            const mockUser = JSON.parse(rawSession)
            setUser(mockUser)
            await loadUserData(mockUser.id)
          } else {
            setProfileLoading(false)
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        setProfileLoading(false)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Theme applying utility
  const applyTheme = (themeMode) => {
    const root = document.documentElement
    if (themeMode === 'dark') {
      root.classList.add('dark')
    } else if (themeMode === 'light') {
      root.classList.remove('dark')
    } else if (themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const loadUserData = async (userId) => {
    if (!userId) {
      setProfile(null)
      setProfileError(null)
      setProfileLoading(false)
      return { profile: null, role: null, error: null }
    }

    setProfileLoading(true)
    setProfileError(null)

    let loadedProfile = null
    let roleResult = null
    let errorResult = null

    try {
      let p = await getUserProfile(userId)
      let s = await getUserSettings(userId)

      // Auto-create missing profiles table record if genuinely null
      if (!p && isSupabaseConfigured && supabase) {
        try {
          const { data: authUserData } = await supabase.auth.getUser()
          const authUser = authUserData?.user
          const defaultName =
            authUser?.user_metadata?.full_name ||
            authUser?.user_metadata?.name ||
            authUser?.email?.split('@')[0] ||
            'ZELO User'

          p = await createUserProfile(userId, {
            full_name: defaultName,
            role: 'user'
          })
        } catch (repairErr) {
          console.warn('Profile auto-creation error:', repairErr)
        }
      }

      // Auto-create missing user_settings table record if genuinely null
      if (!s && isSupabaseConfigured && supabase) {
        try {
          s = await createUserSettings(userId, {
            theme: 'light',
            onboarding_completed: false
          })
        } catch (repairErr) {
          console.warn('Settings auto-creation error:', repairErr)
        }
      }

      if (!p) {
        errorResult = 'Profile missing. Could not load account profile.'
      } else if (p.role !== 'admin' && p.role !== 'user') {
        errorResult = `Invalid account role '${p.role || 'unknown'}' assigned. Please contact support.`
      }

      loadedProfile = p
      roleResult = p?.role || null

      setProfile(p || null)
      setProfileError(errorResult)

      const activeSettings = s || {
        user_id: userId,
        wake_time: '07:00',
        sleep_time: '23:00',
        water_target_ml: 2500,
        daily_expense_budget: 1000.00,
        notifications_enabled: false,
        theme: 'light'
      }
      setUserSettings(activeSettings)

      // Apply theme preference
      const activeTheme = activeSettings.theme || localStorage.getItem('zelo_theme') || 'light'
      applyTheme(activeTheme)

      return { profile: loadedProfile, role: roleResult, error: errorResult }
    } catch (e) {
      console.warn('Failed to load user profile & settings:', e)
      errorResult = e?.message || 'Failed to load user profile.'
      setProfileError(errorResult)
      return { profile: null, role: null, error: errorResult }
    } finally {
      setProfileLoading(false)
    }
  }

  // Update theme setting
  const updateThemePreference = async (newTheme) => {
    if (!user) return
    try {
      localStorage.setItem('zelo_theme', newTheme)
      applyTheme(newTheme)
      await updateUserSettings(user.id, { theme: newTheme })
      setUserSettings((prev) => (prev ? { ...prev, theme: newTheme } : { user_id: user.id, theme: newTheme }))
    } catch (err) {
      console.error('Failed to save theme preference:', err)
      throw err
    }
  }

  // Update password mechanism using Supabase Auth
  const updatePassword = async (newPassword) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      return data
    } else {
      // Mock session mode
      return { user }
    }
  }

  // Register User
  const register = async ({ fullName, email, password }) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      setPendingVerificationEmail(email)
      return data
    } else {
      // Mock Auth SignUp
      const mockUser = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        user_metadata: { full_name: fullName },
        email_confirmed_at: null
      }
      localStorage.setItem('zelo_pending_user', JSON.stringify({ mockUser, password }))
      setPendingVerificationEmail(email)
      return { user: mockUser }
    }
  }

  // Verify Email OTP
  const verifyOtp = async ({ email, token }) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      })
      if (error) throw error
      setUser(data.user)
      let loadRes = { profile: null, role: null, error: null }
      if (data.user) {
        loadRes = await loadUserData(data.user.id)
      }
      setPendingVerificationEmail(null)
      return { user: data.user, profile: loadRes.profile, role: loadRes.role, error: loadRes.error }
    } else {
      // Mock OTP Verification (Accepts valid 6-digit format or 123456)
      if (!token || token.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP code')
      }
      const rawPending = localStorage.getItem('zelo_pending_user')
      if (!rawPending) {
        throw new Error('No pending registration found for email ' + email)
      }
      const { mockUser } = JSON.parse(rawPending)
      mockUser.email_confirmed_at = new Date().toISOString()
      
      // Save profile
      await updateUserProfile(mockUser.id, {
        full_name: mockUser.user_metadata.full_name || 'ZELO User',
        role: 'user',
        onboarding_completed: false
      })

      localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(mockUser))
      localStorage.removeItem('zelo_pending_user')
      setUser(mockUser)
      const loadRes = await loadUserData(mockUser.id)
      setPendingVerificationEmail(null)
      return { user: mockUser, profile: loadRes.profile, role: loadRes.role, error: loadRes.error }
    }
  }

  // Resend OTP
  const resendOtp = async (email) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) throw error
      return true
    } else {
      return true
    }
  }

  // Login User
  const login = async ({ email, password }) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      setUser(data.user)
      if (data.user) {
        const loadResult = await loadUserData(data.user.id)
        return {
          user: data.user,
          profile: loadResult.profile,
          role: loadResult.role,
          error: loadResult.error
        }
      }
      return { user: null, profile: null, role: null, error: 'User login failed' }
    } else {
      // Mock Login Mode
      let mockUser = null
      const rawSession = localStorage.getItem(MOCK_AUTH_KEY)
      if (rawSession) {
        const existing = JSON.parse(rawSession)
        if (existing.email === email) {
          mockUser = existing
        }
      }
      if (!mockUser) {
        // Demo fallback user
        mockUser = {
          id: 'user_demo_123',
          email,
          user_metadata: { full_name: 'ZELO User' }
        }
      }
      localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
      const loadResult = await loadUserData(mockUser.id)
      return {
        user: mockUser,
        profile: loadResult.profile,
        role: loadResult.role,
        error: loadResult.error
      }
    }
  }

  // Logout User
  const logout = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut()
      } else {
        localStorage.removeItem(MOCK_AUTH_KEY)
      }
    } catch (e) {
      console.warn('Logout error:', e)
    } finally {
      setUser(null)
      setProfile(null)
      setProfileError(null)
      setProfileLoading(false)
      setUserSettings(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileLoading,
        profileError,
        userRole: profile?.role || null,
        userSettings,
        loading,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        isSupabaseConfigured,
        register,
        verifyOtp,
        resendOtp,
        login,
        logout,
        loadUserData,
        updateThemePreference,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

