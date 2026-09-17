import React, { useState, useEffect } from 'react';
import { Download, UserPlus, Shield } from 'lucide-react';
import { FilterBar } from '../../components/admin/FilterBar';
import { UserTable } from '../../components/admin/UserTable';
import { Pagination } from '../../components/admin/Pagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { adminService } from '../../services/adminService';
import { useSearchParams } from 'react-router-dom';

export function AdminUsersPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [joinedFilter, setJoinedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [page, setPage] = useState(1);

  const [userData, setUserData] = useState({
    users: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 6
  });
  const [loading, setLoading] = useState(true);

  // Modal dialog state for user actions
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionLabel: 'Confirm',
    isDanger: false,
    user: null
  });

  const fetchUsers = () => {
    setLoading(true);
    adminService
      .getUsers({
        search,
        filterStatus: statusFilter,
        filterJoined: joinedFilter,
        sortBy,
        page,
        limit: 6
      })
      .then((res) => {
        setUserData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, joinedFilter, sortBy, page]);

  const handleUserAction = (type, user) => {
    if (type === 'action_menu') {
      setDialogState({
        isOpen: true,
        title: `Manage ${user.name}`,
        message: `Select an administrative action for ${user.name} (${user.email}).`,
        actionLabel: 'Suspend User',
        isDanger: true,
        user
      });
    }
  };

  const handleExportCSV = () => {
    alert('User Data CSV Exported (UI-only development feature).');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
            <Shield className="w-4 h-4" /> User Management
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Users</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage ZELO accounts, search users, inspect activity status and verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() =>
              setDialogState({
                isOpen: true,
                title: 'Add New User',
                message: 'Admin user creation interface.',
                actionLabel: 'Create User',
                isDanger: false
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        joinedFilter={joinedFilter}
        onJoinedChange={(val) => {
          setJoinedFilter(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
      />

      {/* Table Content */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white border border-slate-200/80 rounded-2xl">
          <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs">
            <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            Loading users directory...
          </div>
        </div>
      ) : (
        <>
          <UserTable users={userData.users} onUserAction={handleUserAction} />
          <Pagination
            currentPage={userData.currentPage}
            totalPages={userData.totalPages}
            totalCount={userData.totalCount}
            limit={userData.limit}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}

      {/* Action Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ ...dialogState, isOpen: false })}
        title={dialogState.title}
        message={dialogState.message}
        actionLabel={dialogState.actionLabel}
        isDanger={dialogState.isDanger}
        onConfirm={() => {
          alert('Action submitted (UI only). Backend Supabase connection will handle real execution.');
        }}
      />
    </div>
  );
}
