import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Determine current page title based on path
  const getPageTitle = (path) => {
    if (path === '/admin') return 'Dashboard';
    if (path.startsWith('/admin/users/')) return 'User Details';
    if (path === '/admin/users') return 'Users Management';
    if (path === '/admin/analytics') return 'Analytics';
    if (path === '/admin/reports') return 'Reports';
    if (path === '/admin/notifications') return 'Notifications';
    if (path === '/admin/system') return 'System Health';
    if (path === '/admin/settings') return 'Admin Settings';
    if (path === '/admin/profile') return 'Admin Profile';
    return 'Admin';
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-slate-900 flex flex-col font-sans antialiased">
      {/* Admin Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content Wrap (Padded left on desktop for 64 width sidebar) */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} title={getPageTitle(location.pathname)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        {/* Admin Footer */}
        <footer className="py-4 px-8 border-t border-slate-200/60 bg-white/50 text-center text-xs font-semibold text-slate-400">
          ZELO SaaS Administration System &bull; Frontend Development UI &bull; Supabase connection pending
        </footer>
      </div>
    </div>
  );
}
