import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, Clock, SendHorizontal } from 'lucide-react';
import { mockAdminService } from '../../admin/services/mockAdminService';

export function AdminNotificationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Broadcast creation form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All Users');
  const [schedule, setSchedule] = useState('Immediately');

  useEffect(() => {
    mockAdminService.getNotifications().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill out both the title and message fields.');
      return;
    }
    alert(
      `Broadcast Notification Submitted:\nTitle: ${title}\nAudience: ${audience}\nSchedule: ${schedule}\n\n(Backend push notification engine is not connected yet. This action is a UI architecture placeholder.)`
    );
    setTitle('');
    setMessage('');
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Loading notifications dashboard...
        </div>
      </div>
    );
  }

  const { history, stats } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
          <Bell className="w-4 h-4" /> Notification Management
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Notifications</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Broadcast system notifications, segment target user audiences, and review dispatch status.
        </p>
      </div>

      {/* Notification Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sent Notifications</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalSent.toLocaleString()}</div>
            <span className="text-[11px] font-semibold text-emerald-700">Delivered successfully</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Scheduled</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.scheduled}</div>
            <span className="text-[11px] font-semibold text-amber-700">Pending delivery</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Failed</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.failed}</div>
            <span className="text-[11px] font-semibold text-slate-500">Push engine pending</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Create Broadcast Form & Dispatch History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Form */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-700" /> Create Broadcast Notification
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Welcome to ZELO v2.0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Message Body
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your push notification message..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
                >
                  <option value="All Users">All Users (1,248)</option>
                  <option value="Active Users">Active Users (386)</option>
                  <option value="Inactive Users">Inactive Users (112)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Schedule Delivery
                </label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
                >
                  <option value="Immediately">Send Immediately</option>
                  <option value="In 1 hour">Schedule: In 1 hour</option>
                  <option value="Tomorrow 9 AM">Schedule: Tomorrow 9 AM</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <SendHorizontal className="w-4 h-4" /> Send Broadcast
              </button>
            </div>
          </form>
        </div>

        {/* Dispatch History */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Broadcast History</h3>
          <div className="divide-y divide-slate-100">
            {history.map((item) => (
              <div key={item.id} className="py-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Sent'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'Scheduled'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{item.message}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-1">
                  <span>Audience: {item.audience}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
