import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileSpreadsheet,
  Bell,
  Activity,
  Settings,
  User,
  LogOut,
  X
} from 'lucide-react';
import logoImg from '../../assets/Logo.png';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../ui/ConfirmModal';

export function AdminSidebar({ mobileOpen, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'System', path: '/admin/system', icon: Activity },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleExecuteLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLogoutModalOpen(false);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const adminName = profile?.full_name || user?.user_metadata?.full_name || 'ZELO Admin';
  const adminEmail = user?.email || 'admin@zelo.app';
  const initials = adminName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ZA';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="ZELO Logo" className="h-8 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">ZELO</span>
            <span className="text-[10px] font-black tracking-widest text-teal-700 uppercase mt-0.5 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200/60 inline-block w-fit">
              ADMIN
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Management Overview
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (onMobileClose) onMobileClose();
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Admin Profile & Logout Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        <NavLink
          to="/admin/profile"
          onClick={() => {
            if (onMobileClose) onMobileClose();
          }}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-200/60 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs border border-teal-200">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-bold text-slate-900 truncate">{adminName}</div>
            <div className="text-[10px] font-medium text-slate-500 truncate">{adminEmail}</div>
          </div>
          <User className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        </NavLink>

        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200/60 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-30">{sidebarContent}</aside>

      {/* Mobile Backdrop Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative z-10 w-64 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleExecuteLogout}
        title="Sign Out of Admin Panel?"
        message="Are you sure you want to sign out of your ZELO admin account?"
        confirmText="Sign Out"
        isLoading={isLoggingOut}
        variant="danger"
      />
    </>
  );
}

