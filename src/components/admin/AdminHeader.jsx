import React, { useState } from 'react';
import { Menu, Search, Bell, ShieldCheck, ChevronRight } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

export function AdminHeader({ onMenuClick, title = 'Dashboard' }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const handleGlobalSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      window.location.href = `/admin/users?search=${encodeURIComponent(globalSearch)}`;
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="hidden sm:inline">ZELO Admin</span>
          <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right: Global Search & Notifications */}
      <div className="flex items-center gap-3">
        {/* Global Search Input */}
        <form onSubmit={handleGlobalSearchSubmit} className="relative hidden sm:block w-48 md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Global search users, reports..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 border border-transparent rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-hidden transition-all"
          />
        </form>

        {/* Development Mode Pill */}
        <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-200/80">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          Frontend Development Mode
        </span>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white animate-pulse" />
          </button>

          <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>
      </div>
    </header>
  );
}
