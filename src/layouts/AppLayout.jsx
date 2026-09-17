import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Wallet,
  ClipboardCheck,
  LayoutGrid,
  Plus,
  ArrowLeft,
  MoreVertical
} from 'lucide-react'
import zeloLogo from '../assets/Logo.png'
import { useAuth } from '../context/AuthContext'
import { QuickAddModal } from '../components/QuickAddModal'
import { ProfileAvatar } from '../components/ui/ProfileAvatar'
import { notifyDataUpdated } from '../utils/events'
import { DesktopMobileNotice } from '../components/pwa/DesktopMobileNotice'

export const AppLayout = () => {
  const { profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [quickAddTab, setQuickAddTab] = useState(null)

  const navItemsLeft = [
    { path: '/today', ariaLabel: 'Home', title: 'Home', label: 'Home', icon: Home },
    { path: '/expenses', ariaLabel: 'Money', title: 'Money', label: 'Money', icon: Wallet }
  ]

  const navItemsRight = [
    { path: '/tasks', ariaLabel: 'Tasks', title: 'Tasks', label: 'Tasks', icon: ClipboardCheck },
    { path: '/more', ariaLabel: 'More', title: 'More', label: 'More', icon: LayoutGrid }
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

  const isHomePage = location.pathname === '/today' || location.pathname === '/'
  const isExpensesPage = location.pathname.startsWith('/expenses')

  return (
    <div className="min-h-screen ambient-bg text-slate-900 font-sans selection:bg-emerald-200 flex flex-col items-center w-full">
      {/* DESKTOP MOBILE-FIRST EXPERIENCE NOTICE */}
      <DesktopMobileNotice />

      {/* CLEAN TOP HEADER — INCREASED HEIGHT & CENTER ALIGNED */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 pt-safe shadow-xs">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between min-h-[80px] sm:min-h-[88px]">
          {/* Left: Back Arrow (Non-home pages) + ZELO Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 my-auto">
            {!isHomePage && (
              <button
                type="button"
                onClick={() => navigate('/today')}
                aria-label="Back to Home"
                title="Back to Today"
                className="p-2 -ml-1 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-slate-200/60 shadow-2xs bg-white"
              >
                <ArrowLeft className="w-5 h-5 text-slate-800" />
              </button>
            )}

            <NavLink to="/today" className="flex items-center" aria-label="ZELO Home">
              <img src={zeloLogo} alt="ZELO — Your day. Your way." className="h-9 sm:h-10 w-auto object-contain max-w-[150px]" />
            </NavLink>
          </div>

          {/* Right Action: Three dots on Expense page, Profile Avatar on other pages */}
          <div className="flex items-center shrink-0 my-auto">
            {isExpensesPage ? (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                title="Options"
                aria-label="Options"
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors border border-slate-200/60 bg-white"
              >
                <MoreVertical className="w-5 h-5 text-slate-700" />
              </button>
            ) : (
              <NavLink to="/profile" title="Profile" aria-label="Profile" className="flex items-center justify-center">
                <ProfileAvatar size="md" />
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* CENTERED MAIN CONTENT CONTAINER */}
      <main className="w-full max-w-2xl mx-auto p-4 sm:p-6 pb-28 sm:pb-32 flex-1">
        <Outlet context={{ openQuickAdd }} />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR — HIDE ON EXPENSE MANAGER PAGE */}
      {!isExpensesPage && (
        <nav
          aria-label="Main Navigation"
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 z-40 pb-safe shadow-lg"
        >
          <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between relative">
            {/* Left Navigation Items (Home, Money) */}
            <div className="flex items-center justify-around flex-1">
              {navItemsLeft.map((item) => {
                const Icon = item.icon
                const isActive = item.path === '/today'
                  ? (location.pathname === '/today' || location.pathname === '/')
                  : location.pathname.startsWith(item.path)
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    aria-label={item.ariaLabel}
                    title={item.title}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
                      isActive
                        ? 'text-emerald-600 font-extrabold'
                        : 'text-slate-400 hover:text-slate-600 font-medium'
                    }`}
                  >
                    <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-105 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                    <span className="text-[11px] tracking-tight mt-1 font-semibold">{item.label}</span>
                  </NavLink>
                )
              })}
            </div>

            {/* CENTER PROMINENT + QUICK ADD BUTTON */}
            <div className="px-3 shrink-0 flex flex-col items-center">
              <button
                onClick={toggleQuickAdd}
                aria-label="Add Entry"
                title="Add Entry"
                className={`w-13 h-13 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/35 flex items-center justify-center transition-all transform active:scale-95 -translate-y-4 border-2 border-white cursor-pointer ${
                  isQuickAddOpen ? 'rotate-45 bg-slate-800 shadow-slate-900/20' : ''
                }`}
              >
                <Plus className="w-7 h-7 stroke-[2.5] transition-transform" />
              </button>
            </div>

            {/* Right Navigation Items (Tasks, More) */}
            <div className="flex items-center justify-around flex-1">
              {navItemsRight.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    aria-label={item.ariaLabel}
                    title={item.title}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
                      isActive
                        ? 'text-emerald-600 font-extrabold'
                        : 'text-slate-400 hover:text-slate-600 font-medium'
                    }`}
                  >
                    <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-105 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                    <span className="text-[11px] tracking-tight mt-1 font-semibold">{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        </nav>
      )}

      {/* GLOBAL QUICK ADD MODAL / BOTTOM SHEET */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultTab={quickAddTab}
        onSuccess={(mod) => {
          notifyDataUpdated(mod || 'all', 'created')
        }}
      />
    </div>
  )
}
