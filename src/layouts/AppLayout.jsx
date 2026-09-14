import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Sun,
  Utensils,
  Dumbbell,
  Bookmark,
  DollarSign,
  User,
  Settings,
  Plus,
  LogOut,
  Sparkles,
  CheckSquare
} from 'lucide-react'
import zeloLogo from '../assets/Logo.png'
import { useAuth } from '../context/AuthContext'
import { QuickAddModal } from '../components/QuickAddModal'

export const AppLayout = () => {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [quickAddTab, setQuickAddTab] = useState(null)

  const navItems = [
    { path: '/today', label: 'Home', icon: Sun },
    { path: '/food', label: 'Food', icon: Utensils },
    { path: '/workout', label: 'Workout', icon: Dumbbell },
    { path: '/remember', label: 'Remember', icon: Bookmark },
    { path: '/expenses', label: 'Expenses', icon: DollarSign },
  ]

  const openQuickAdd = (tab = 'expense') => {
    setQuickAddTab(tab)
    setIsQuickAddOpen(true)
  }

  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'

  return (
    <div className="min-h-screen ambient-bg text-slate-900 font-sans selection:bg-emerald-200 flex flex-col items-center">
      {/* CENTERED TOP NAVBAR */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 pt-safe shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between min-h-[64px] relative">
          {/* Left Action: Quick Add */}
          <button
            onClick={() => openQuickAdd('expense')}
            className="px-3.5 py-1.5 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* Centered ZELO Brand Logo */}
          <NavLink to="/today" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <img src={zeloLogo} alt="ZELO — Your day. Your way." className="h-8.5 w-auto object-contain max-w-[140px]" />
          </NavLink>

          {/* Right Actions: Settings & Profile */}
          <div className="flex items-center gap-1.5 shrink-0">
            <NavLink
              to="/settings"
              title="Settings"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-4.5 h-4.5" />
            </NavLink>
            <NavLink to="/profile" title="Profile">
              <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* CENTERED MAIN CONTENT CONTAINER */}
      <main className="w-full max-w-2xl mx-auto p-4 sm:p-6 pb-28 flex-1">
        <Outlet context={{ openQuickAdd }} />
      </main>

      {/* CENTERED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/70 z-40 pb-safe shadow-lg">
        <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl flex-1 transition-all active:scale-95 ${
                  isActive
                    ? 'text-emerald-800 font-black bg-emerald-50/90 border border-emerald-100/80 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 font-semibold'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110 text-emerald-700' : ''}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* GLOBAL QUICK ADD MODAL */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultTab={quickAddTab}
        onSuccess={() => {
          window.dispatchEvent(new Event('zelo_data_updated'))
        }}
      />
    </div>
  )
}
