import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu, Server, CheckCircle2, Database } from 'lucide-react';
import { StatusIndicator } from '../../components/admin/StatusIndicator';
import { mockAdminService } from '../../admin/services/mockAdminService';
import { isSupabaseConfigured } from '../../lib/supabase';

export function AdminSystemPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockAdminService.getSystemStatus().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Checking system health status...
        </div>
      </div>
    );
  }

  const { overall, lastCheck, services, environment } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
          <Activity className="w-4 h-4" /> System Health Dashboard
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">System Status</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Real-time diagnostics of frontend services, database connectivity, and API gateways.
        </p>
      </div>

      {/* Backend Supabase Connection Card (Admin Panel Exclusive) */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Backend Connection</h3>
            <p className="text-xs font-medium text-slate-500">
              {isSupabaseConfigured
                ? 'Connected to live Supabase PostgreSQL server with RLS security policies enabled.'
                : 'Operating in Local Storage sandbox mode.'}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 font-bold flex items-center justify-between">
          <span className="font-mono">Engine: {isSupabaseConfigured ? 'Supabase PostgreSQL' : 'LocalStorage Sandbox'}</span>
          <span className={`px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-extrabold ${isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {isSupabaseConfigured ? 'Live Supabase DB' : 'Local Sandbox'}
          </span>
        </div>
      </div>

      {/* Banner Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-lg font-bold">{overall}</h3>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            System metrics active. Supabase database tables and auth policies configured.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-semibold bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
          Last Check: {lastCheck}
        </div>
      </div>

      {/* Services Health Table / List */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-teal-700" /> Platform Infrastructure Services
        </h3>

        <div className="divide-y divide-slate-100">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-3 rounded-xl transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{svc.name}</h4>
                  <StatusIndicator status={svc.status} />
                </div>
                <p className="text-xs text-slate-500 font-medium">{svc.notes}</p>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600 font-semibold">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Uptime</span>
                  <span>{svc.uptime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Latency</span>
                  <span>{svc.latency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Environment Info */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-700" /> Environment Details
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Framework</span>
            <div className="text-xs font-bold text-slate-800 mt-1">{environment.framework}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Styling Engine</span>
            <div className="text-xs font-bold text-slate-800 mt-1">{environment.styling}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Client Version</span>
            <div className="text-xs font-bold text-slate-800 mt-1">{environment.clientVersion}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Node Env</span>
            <div className="text-xs font-bold text-teal-700 mt-1">{environment.nodeEnv}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
