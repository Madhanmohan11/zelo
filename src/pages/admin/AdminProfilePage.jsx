import React, { useState, useEffect } from 'react';
import { User, Key, Shield, Save, Check } from 'lucide-react';
import { mockAdminService } from '../../admin/services/mockAdminService';

export function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockAdminService.getAdminProfile().then((res) => {
      setProfile(res);
      setName(res.name);
      setEmail(res.email);
      setLoading(false);
    });
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Loading admin profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
          <User className="w-4 h-4" /> Administrative Identity
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Admin Profile</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage your administrative profile information, role credentials, and security credentials.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-20 h-20 rounded-full object-cover border-4 border-teal-500/20 shadow-xs"
        />
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <h3 className="text-xl font-extrabold text-slate-900">{profile.name}</h3>
            <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200/60">
              {profile.role}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">{profile.email}</p>
          <div className="text-[11px] font-semibold text-slate-400 pt-1">
            Last Login: {profile.lastLogin}
          </div>
        </div>
      </div>

      {/* Profile & Security Form */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-6 max-w-xl">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-700" /> Account Security Credentials
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password (Optional)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password to change..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              Authentication will be connected to Supabase in Phase 2.
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Updated!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
