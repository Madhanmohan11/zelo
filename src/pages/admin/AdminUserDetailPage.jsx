import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldCheck,
  Clock,
  Utensils,
  Dumbbell,
  Bell,
  IndianRupee,
  UserX,
  UserCheck,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { UserStatusBadge } from '../../components/admin/UserStatusBadge';
import { ActivityTimeline } from '../../components/admin/ActivityTimeline';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { mockAdminService } from '../../admin/services/mockAdminService';

export function AdminUserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal dialog state
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionLabel: 'Confirm',
    isDanger: false
  });

  useEffect(() => {
    mockAdminService.getUserById(id).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [id]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Loading user profile details...
        </div>
      </div>
    );
  }

  const { user, activities } = data;

  const triggerAction = (title, message, actionLabel, isDanger = false) => {
    setModal({
      isOpen: true,
      title,
      message,
      actionLabel,
      isDanger
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb & Navigation Back */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Users Directory
      </Link>

      {/* Main Profile Header Card */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-teal-500/20 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{user.name}</h2>
              <UserStatusBadge status={user.status} />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">{user.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Joined {user.joinedFormatted}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {user.verified ? 'Email Verified' : 'Unverified Email'}
              </span>
              <span>&bull;</span>
              <span className="text-slate-600">
                Onboarding: {user.onboardingCompleted ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
          <button
            onClick={() =>
              triggerAction(
                `Suspend ${user.name}`,
                `Are you sure you want to temporarily suspend access for ${user.email}?`,
                'Suspend User',
                true
              )
            }
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition-all border border-amber-200/80 cursor-pointer"
          >
            <UserX className="w-3.5 h-3.5" /> Suspend
          </button>

          <button
            onClick={() =>
              triggerAction(
                `Activate ${user.name}`,
                `Re-activate full platform privileges for ${user.email}?`,
                'Activate User',
                false
              )
            }
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all border border-emerald-200/80 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" /> Activate
          </button>

          <button
            onClick={() =>
              triggerAction(
                `Reset Account for ${user.name}`,
                `Send a password reset email and clear session credentials for ${user.email}?`,
                'Reset Account',
                false
              )
            }
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all border border-slate-200/80 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Account
          </button>

          <button
            onClick={() =>
              triggerAction(
                `Delete ${user.name}`,
                `Permanently delete account ${user.email} and clear all stored data? This action cannot be undone.`,
                'Delete User',
                true
              )
            }
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all border border-rose-200/80 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* User Activity Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Meals</span>
            <Utensils className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{user.stats.meals}</div>
          <span className="text-[10px] text-slate-400 font-semibold">Total logged meals</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Workouts</span>
            <Dumbbell className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{user.stats.workouts}</div>
          <span className="text-[10px] text-slate-400 font-semibold">Completed workouts</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Remember</span>
            <Bell className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{user.stats.remember}</div>
          <span className="text-[10px] text-slate-400 font-semibold">Active reminders</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Expenses</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{user.stats.expenses}</div>
          <span className="text-[10px] text-slate-400 font-semibold">Expense entries</span>
        </div>
      </div>

      {/* Recent User Activity Timeline */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Recent User Timeline</h3>
        <p className="text-xs text-slate-500 font-medium">Activity logs for {user.name}</p>
        <div className="pt-2">
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        actionLabel={modal.actionLabel}
        isDanger={modal.isDanger}
        onConfirm={() => {
          alert('Action executed on frontend UI. Real database operations pending Supabase backend connection.');
        }}
      />
    </div>
  );
}
