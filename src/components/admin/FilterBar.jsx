import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ value, onChange, placeholder = 'Search users by name or email...' }) {
  return (
    <div className="relative flex-1 min-w-[240px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
      />
    </div>
  );
}

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  joinedFilter,
  onJoinedChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200/80 rounded-2xl mb-6">
      <SearchBar value={search} onChange={onSearchChange} />

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by Status"
          className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-500 cursor-pointer"
        >
          <option value="All">Status: All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Email Unverified">Email Unverified</option>
        </select>

        {/* Joined Time Range Dropdown */}
        <select
          value={joinedFilter}
          onChange={(e) => onJoinedChange(e.target.value)}
          aria-label="Filter by Joined Date"
          className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-500 cursor-pointer"
        >
          <option value="All">Joined: All Time</option>
          <option value="Today">Joined: Today</option>
          <option value="This Week">Joined: This Week</option>
          <option value="This Month">Joined: This Month</option>
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort users"
          className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-500 cursor-pointer"
        >
          <option value="Newest">Sort: Newest First</option>
          <option value="Oldest">Sort: Oldest First</option>
          <option value="Name">Sort: Name (A-Z)</option>
          <option value="Last Active">Sort: Last Active</option>
        </select>
      </div>
    </div>
  );
}
