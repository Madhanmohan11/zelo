import React, { useState } from 'react';
import { Settings, Sliders, Lock, Bell, Shield, Save, Check } from 'lucide-react';

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  // UI state variables
  const [appName, setAppName] = useState('ZELO Admin');
  const [timezone, setTimezone] = useState('UTC+05:30 (India Standard Time)');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityLogs, setSecurityLogs] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'platform', label: 'Platform', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Lock }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
          <Settings className="w-4 h-4" /> Administration Preferences
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Admin Settings</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure platform defaults, system security controls, and admin panel parameters.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto hide-scrollbar pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Settings Form Container */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-6">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Application Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  System Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="UTC+05:30 (India Standard Time)">UTC+05:30 (India Standard Time)</option>
                  <option value="UTC+00:00 (Coordinated Universal Time)">UTC+00:00 (UTC)</option>
                  <option value="UTC-05:00 (Eastern Time)">UTC-05:00 (Eastern Time)</option>
                  <option value="UTC-08:00 (Pacific Time)">UTC-08:00 (Pacific Time)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'platform' && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Allow New User Registrations</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Permit new public signups on ZELO.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={registrationOpen}
                  onChange={(e) => setRegistrationOpen(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Maintenance Mode</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Display maintenance splash screen to standard users.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Admin Email Digests</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Receive daily system health and user growth summaries via email.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {(activeTab === 'security' || activeTab === 'appearance') && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Strict Audit Logging</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Log all administrative actions for audit compliance.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={securityLogs}
                  onChange={(e) => setSecurityLogs(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              Settings UI state only. Backend sync pending Supabase connection.
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
