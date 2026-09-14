import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getUserProfile, getUserSettings, updateUserProfile, updateUserSettings } from '../services/dataService'

const AuthContext = createContext(null)

// Storage key for mock session when Supabase env vars aren't configured yet
const MOCK_AUTH_KEY = 'zelo_mock_session'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
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
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              setUser(session.user)
              await loadUserData(session.user.id)
            } else {
              setUser(null)
              setProfile(null)
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
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  const loadUserData = async (userId) => {
    try {
      const p = await getUserProfile(userId)
      const s = await getUserSettings(userId)
      setProfile(
        p || {
          id: userId,
          full_name: 'Madhan',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          onboarding_completed: true
        }
      )
      setUserSettings(
        s || {
          user_id: userId,
          wake_time: '07:00',
          sleep_time: '23:00',
          water_target_ml: 2500,
          daily_expense_budget: 1000.00
        }
      )
    } catch (e) {
      console.warn('Failed to load user profile & settings:', e)
      setProfile({
        id: userId,
        full_name: 'Madhan',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        onboarding_completed: true
      })
      setUserSettings({
        user_id: userId,
        wake_time: '07:00',
        sleep_time: '23:00',
        water_target_ml: 2500,
        daily_expense_budget: 1000.00
      })
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
      if (data.user) {
        await loadUserData(data.user.id)
      }
      setPendingVerificationEmail(null)
      return data
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
        onboarding_completed: false
      })

      localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(mockUser))
      localStorage.removeItem('zelo_pending_user')
      setUser(mockUser)
      await loadUserData(mockUser.id)
      setPendingVerificationEmail(null)
      return { user: mockUser }
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
        await loadUserData(data.user.id)
      }
      return data
    } else {
      // Mock Login Mode
      const rawSession = localStorage.getItem(MOCK_AUTH_KEY)
      if (rawSession) {
        const existing = JSON.parse(rawSession)
        if (existing.email === email) {
          setUser(existing)
          await loadUserData(existing.id)
          return { user: existing }
        }
      }
      // Demo fallback user
      const mockUser = {
        id: 'user_demo_123',
        email,
        user_metadata: { full_name: 'Madhan' }
      }
      localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
      await loadUserData(mockUser.id)
      return { user: mockUser }
    }
  }

  // Logout User
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem(MOCK_AUTH_KEY)
    }
    setUser(null)
    setProfile(null)
    setUserSettings(null)
  }

  // Save Onboarding Data
  const saveOnboarding = async (onboardingData) => {
    if (!user) return
    const { wake_time, sleep_time, water_target_ml, daily_expense_budget } = onboardingData

    await updateUserSettings(user.id, {
      wake_time: wake_time || '07:00',
      sleep_time: sleep_time || '23:00',
      water_target_ml: water_target_ml ? parseInt(water_target_ml) : 2500,
      daily_expense_budget: daily_expense_budget ? parseFloat(daily_expense_budget) : 1000.00
    })

    const updatedProfile = await updateUserProfile(user.id, {
      onboarding_completed: true
    })

    setProfile(updatedProfile)
    return updatedProfile
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
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
        saveOnboarding,
        loadUserData
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
