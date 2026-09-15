import React from 'react';
import { UserStatusBadge } from './UserStatusBadge';
import { Eye, MoreHorizontal, ShieldCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UserTable({ users = [], onUserAction }) {
  if (!users || users.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No users found</h4>
        <p className="text-xs text-slate-500 font-medium mt-1">Try adjusting your search or filter parameters.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Joined</th>
              <th className="py-3.5 px-4">Last Active</th>
              <th className="py-3.5 px-4">Verification</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                {/* Avatar & Name & Email */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200/80"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{user.email}</div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <UserStatusBadge status={user.status} />
                </td>

                {/* Joined */}
                <td className="py-3.5 px-4 font-medium text-slate-600">{user.joinedFormatted}</td>

                {/* Last Active */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {user.lastActive}
                  </span>
                </td>

                {/* Verification */}
                <td className="py-3.5 px-4">
                  {user.verified ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700 text-[11px]">
                      Pending Email
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                    <button
                      onClick={() => onUserAction('action_menu', user)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards View (Shown on mobile) */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200/80"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                  <div className="text-xs text-slate-400 font-medium">{user.email}</div>
                </div>
              </div>
              <UserStatusBadge status={user.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Joined</span>
                <span className="font-semibold text-slate-700">{user.joinedFormatted}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Active</span>
                <span className="font-semibold text-slate-700">{user.lastActive}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                {user.verified ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold text-[11px]">Unverified Email</span>
                )}
              </div>
              <Link
                to={`/admin/users/${user.id}`}
                className="px-3 py-1.5 rounded-lg bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
