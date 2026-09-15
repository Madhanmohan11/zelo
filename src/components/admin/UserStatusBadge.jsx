import React from 'react';

export function UserStatusBadge({ status }) {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (status === 'Active' || status === 'Verified' || status === 'Operational') {
    badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (status === 'Inactive') {
    badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200/80';
  } else if (status === 'Unverified' || status === 'Not Connected Yet') {
    badgeStyles = 'bg-gray-100 text-gray-600 border-gray-200';
  } else if (status === 'Failed' || status === 'Suspended') {
    badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200/80';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeStyles}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Active' || status === 'Verified' || status === 'Operational'
            ? 'bg-emerald-500'
            : status === 'Inactive'
            ? 'bg-amber-500'
            : status === 'Failed' || status === 'Suspended'
            ? 'bg-rose-500'
            : 'bg-gray-400'
        }`}
      />
      {status}
    </span>
  );
}
