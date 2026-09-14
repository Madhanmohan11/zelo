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
  const { profile } = useAuth()
  const location = useLocation()
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [quickAddTab, setQuickAddTab] = useState(null)

  const navItemsLeft = [
    { path: '/today', ariaLabel: 'Home', title: 'Home', icon: Sun },
    { path: '/food', ariaLabel: 'Food', title: 'Food', icon: Utensils },
  ]

  const navItemsRight = [
    { path: '/remember', ariaLabel: 'Remember', title: 'Remember', icon: Bookmark },
    { path: '/expenses', ariaLabel: 'Expenses', title: 'Expenses', icon: DollarSign },
  ]

  const openQuickAdd = (tab = 'expense') => {
    setQuickAddTab(tab)
    setIsQuickAddOpen(true)
  }

  const toggleQuickAdd = () => {
    if (isQuickAddOpen) {
      setIsQuickAddOpen(false)
    } else {
      openQuickAdd('expense')
    }
  }

  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'

  return (
    <div className="min-h-screen ambient-bg text-slate-900 font-sans selection:bg-emerald-200 flex flex-col items-center">
      {/* CLEAN TOP HEADER — NO ADD BUTTON */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 pt-safe shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between min-h-[60px]">
          {/* Left: ZELO Brand Logo */}
          <NavLink to="/today" className="flex items-center" aria-label="ZELO Home">
            <img src={zeloLogo} alt="ZELO — Your day. Your way." className="h-8 w-auto object-contain max-w-[130px]" />
          </NavLink>

          {/* Right Actions: Settings Icon & Profile Avatar */}
          <div className="flex items-center gap-1.5 shrink-0">
            <NavLink
              to="/settings"
              title="Settings"
              aria-label="Settings"
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </NavLink>
            <NavLink to="/profile" title="Profile" aria-label="Profile">
              <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* CENTERED MAIN CONTENT CONTAINER */}
      <main className="w-full max-w-2xl mx-auto p-4 sm:p-6 pb-28 flex-1">
        <Outlet context={{ openQuickAdd }} />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR — ICON ONLY WITH CENTER + BUTTON */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/70 z-40 pb-safe shadow-lg"
      >
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between relative">
          {/* Left Navigation Icons (Home, Food) */}
          <div className="flex items-center gap-2 flex-1 justify-around">
            {navItemsLeft.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  aria-label={item.ariaLabel}
                  title={item.title}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100/80 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 font-semibold'
                  }`}
                >
                  <Icon className={`w-5.5 h-5.5 transition-transform ${isActive ? 'scale-110 text-emerald-700' : ''}`} />
                </NavLink>
              )
            })}
          </div>

          {/* CENTER PROMINENT + QUICK ADD BUTTON */}
          <div className="px-2 shrink-0">
            <button
              onClick={toggleQuickAdd}
              aria-label="Add Entry"
              title="Add Entry"
              className={`w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center transition-all transform active:scale-95 -translate-y-3.5 border-2 border-white ${
                isQuickAddOpen ? 'rotate-45 bg-slate-800 shadow-slate-900/20' : ''
              }`}
            >
              <Plus className="w-6 h-6 transition-transform" />
            </button>
          </div>

          {/* Right Navigation Icons (Remember, Expenses) */}
          <div className="flex items-center gap-2 flex-1 justify-around">
            {navItemsRight.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  aria-label={item.ariaLabel}
                  title={item.title}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100/80 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 font-semibold'
                  }`}
                >
                  <Icon className={`w-5.5 h-5.5 transition-transform ${isActive ? 'scale-110 text-emerald-700' : ''}`} />
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>

      {/* GLOBAL QUICK ADD MODAL / BOTTOM SHEET */}
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
