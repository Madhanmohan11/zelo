import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, RefreshCw, Mail } from 'lucide-react'
import zeloLogo from '../assets/Logo.png'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const { verifyOtp, resendOtp, pendingVerificationEmail } = useAuth()
  const { showToast } = useToast()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [emailInput, setEmailInput] = useState(pendingVerificationEmail || '')
  const [isLoading, setIsLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef([])

  useEffect(() => {
    let timer
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1)
      }, 1000)
    } else {
      setCanResend(true)
    }
    return () => clearInterval(timer)
  }, [resendCountdown])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.trim().slice(0, 6).split('')
      const newOtp = [...otp]
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setOtp(newOtp)
      inputRefs.current[Math.min(pasted.length, 5)]?.focus()
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const token = otp.join('')
    if (token.length !== 6) {
      showToast('Please enter the full 6-digit OTP code', 'error')
      return
    }

    if (!emailInput) {
      showToast('Email address is missing', 'error')
      return
    }

    setIsLoading(true)
    try {
      await verifyOtp({ email: emailInput, token })
      showToast('Email verified successfully! Welcome to ZELO.', 'success')
      navigate('/today')
    } catch (err) {
      showToast(err.message || 'Invalid or expired OTP code', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    if (!emailInput) {
      showToast('Please specify your email address', 'error')
      return
    }

    try {
      await resendOtp(emailInput)
      showToast('A new OTP verification code has been sent!', 'success')
      setResendCountdown(60)
      setCanResend(false)
    } catch (err) {
      showToast(err.message || 'Failed to resend OTP', 'error')
    }
  }

  return (
    <div className="min-h-screen ambient-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={zeloLogo} alt="ZELO — Your day. Your way." className="h-14 w-auto object-contain mb-4" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Verify your email</h1>
          <p className="text-xs font-semibold text-slate-500 mt-2">
            Enter the 6-digit verification code sent to{' '}
            <span className="font-bold text-slate-800">{emailInput || 'your email'}</span>.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <form onSubmit={handleVerify} className="space-y-6">
            {!pendingVerificationEmail && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Target Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
            )}

            {/* 6 OTP Input Boxes */}
            <div className="flex items-center justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-black bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading}>
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-xs font-semibold text-slate-500">Didn't get the code?</span>
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`flex items-center gap-1.5 font-bold text-xs transition-colors ${
                canResend
                  ? 'text-emerald-700 hover:text-emerald-800 cursor-pointer'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${!canResend ? 'animate-spin' : ''}`} />
              <span>{canResend ? 'Resend OTP' : `Resend in ${resendCountdown}s`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
