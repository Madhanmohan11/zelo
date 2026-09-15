import React from 'react';
import { Bell, Check, Info, FileText, CheckCircle2 } from 'lucide-react';
import { MOCK_ADMIN_NOTIFICATIONS } from '../../admin/mock/notifications';

export function NotificationPanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/80 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-700" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Admin Notifications</h4>
        </div>
        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
          2 New
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {MOCK_ADMIN_NOTIFICATIONS.map((item) => (
          <div
            key={item.id}
            className={`p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-3 ${
              !item.read ? 'bg-teal-50/20' : ''
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 mt-0.5">
              {item.type === 'report' ? (
                <FileText className="w-4 h-4 text-indigo-600" />
              ) : item.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Info className="w-4 h-4 text-teal-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-800">{item.title}</h5>
                <span className="text-[10px] font-semibold text-slate-400">{item.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <a
          href="/admin/notifications"
          onClick={onClose}
          className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
        >
          View Notification Center &rarr;
        </a>
      </div>
    </div>
  );
}
