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

  const secondaryNavItems = [
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const openQuickAdd = (tab = 'expense') => {
    setQuickAddTab(tab)
    setIsQuickAddOpen(true)
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'ZELO User'
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'

  return (
    <div className="min-h-screen ambient-bg text-slate-900 flex flex-col md:flex-row font-sans selection:bg-emerald-200">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white/90 backdrop-blur-md border-r border-slate-200/80 p-6 sticky top-0 h-screen z-30 shrink-0 shadow-sm">
        {/* Brand Logo */}
        <div className="px-2 py-2 mb-8 flex items-center">
          <img src={zeloLogo} alt="ZELO — Your day. Your way." className="h-10 w-auto object-contain max-w-full" />
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => openQuickAdd('expense')}
          className="w-full py-3 px-4 mb-6 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5 text-emerald-400" />
          <span>+ Quick Add</span>
        </button>

        {/* Main Navigation Links */}
        <nav className="space-y-1.5 flex-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2">Main Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#D1FAE5]/80 text-emerald-950 shadow-sm border border-emerald-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}

          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mt-8 mb-2">Account</div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#D1FAE5]/80 text-emerald-950 shadow-sm border border-emerald-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
          <NavLink to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
            <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm" />
            <div className="truncate">
              <div className="text-sm font-bold text-slate-900 truncate">{displayName}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-5 py-5 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 pt-safe shadow-xs min-h-[68px]">
        <NavLink to="/today" className="flex items-center">
          <img src={zeloLogo} alt="ZELO — Your day. Your way." className="h-9.5 w-auto object-contain max-w-[160px]" />
        </NavLink>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openQuickAdd('expense')}
            className="px-4 py-2 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add</span>
          </button>
          <NavLink to="/profile">
            <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs" />
          </NavLink>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 pb-28 md:pb-8 max-w-6xl mx-auto w-full">
        <Outlet context={{ openQuickAdd }} />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/70 px-3 py-2 z-40 pb-safe flex items-center justify-between shadow-lg">
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
