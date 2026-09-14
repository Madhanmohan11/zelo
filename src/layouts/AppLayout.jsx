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

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'LifeOS User'
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'

  return (
    <div className="min-h-screen ambient-bg text-slate-900 flex flex-col md:flex-row font-sans selection:bg-emerald-200">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white/90 backdrop-blur-md border-r border-slate-200/80 p-6 sticky top-0 h-screen z-30 shrink-0 shadow-sm">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              LifeOS
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 tracking-tight">Your Life. Organized.</p>
          </div>
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
      <header className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 pt-safe shadow-xs">
        <NavLink to="/today" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 leading-none block">
              LifeOS
            </span>
            <span className="text-[9px] font-semibold text-slate-400 tracking-tight leading-none">Your Life. Organized.</span>
          </div>
        </NavLink>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickAdd('expense')}
            className="px-3.5 py-1.5 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add</span>
          </button>
          <NavLink to="/profile">
            <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
          </NavLink>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        <Outlet context={{ openQuickAdd }} />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 z-40 pb-safe flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive ? 'text-emerald-700 font-extrabold bg-[#D1FAE5]/60' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110 text-emerald-700' : ''}`} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </NavLink>
          )
        })}

        {/* Quick Add Floating Button on Mobile Bottom Bar */}
        <button
          onClick={() => openQuickAdd('expense')}
          className="flex flex-col items-center justify-center p-3 rounded-full bg-[#0F172A] text-white shadow-xl transform -translate-y-3 border-2 border-white active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 text-emerald-400" />
        </button>
      </nav>

      {/* GLOBAL QUICK ADD MODAL */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultTab={quickAddTab}
        onSuccess={() => {
          window.dispatchEvent(new Event('lifeos_data_updated'))
        }}
      />
    </div>
  )
}
