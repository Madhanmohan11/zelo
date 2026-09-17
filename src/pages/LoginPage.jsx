import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import zeloLogo from '../assets/Logo.png'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoginPWABanner } from '../components/pwa/LoginPWABanner'

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { showToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname || '/today'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      showToast('Please provide both email and password', 'error')
      return
    }

    setIsLoading(true)
    try {
      const result = await login({ email, password })
      if (result?.error) {
        showToast(result.error, 'error')
        return
      }
      showToast('Welcome back to ZELO!', 'success')
      if (result?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (result?.role === 'user') {
        const targetRoute = location.state?.from?.pathname && location.state.from.pathname !== '/login' && !location.state.from.pathname.startsWith('/admin')
          ? location.state.from.pathname
          : '/today'
        navigate(targetRoute, { replace: true })
      } else {
        showToast('Invalid account role assigned. Please contact support.', 'error')
      }
    } catch (err) {
      showToast(err?.message || 'Invalid email or password', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    showToast('A password reset link can be requested from your Supabase auth dashboard.', 'info')
  }

  return (
    <div className="min-h-screen ambient-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={zeloLogo} alt="ZELO — Your day. Your way." className="h-14 w-auto object-contain mb-4" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome back</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Your day. Your way.</p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading}>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm font-semibold text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-700 font-bold hover:underline">
              Create one now
            </Link>
          </div>
        </div>

        {/* PWA Mobile-First Installation Banner */}
        <LoginPWABanner />
      </div>
    </div>
  )
}

export default LoginPage
