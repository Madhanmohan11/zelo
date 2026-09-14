// Service layer for ZELO Admin Panel
// Currently uses local mock data.
// Replace with Supabase queries once backend integration starts.

import { MOCK_USERS } from '../mock/users';
import { MOCK_ANALYTICS } from '../mock/analytics';
import { MOCK_ACTIVITIES } from '../mock/activity';
import { MOCK_ADMIN_NOTIFICATIONS, MOCK_BROADCAST_HISTORY } from '../mock/notifications';
import { MOCK_SYSTEM_STATUS } from '../mock/system';

export const mockAdminService = {
  /**
   * Get main dashboard overview stats & metrics
   */
  async getDashboardOverview() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      overview: MOCK_ANALYTICS.overview,
      userGrowth: MOCK_ANALYTICS.userGrowth,
      dailyActiveUsers: MOCK_ANALYTICS.dailyActiveUsers,
      featureUsage: MOCK_ANALYTICS.featureUsage,
      recentActivities: MOCK_ACTIVITIES
    };
  },

  /**
   * Get users with filtering, searching, sorting, and pagination
   */
  async getUsers({ search = '', filterStatus = 'All', filterJoined = 'All', sortBy = 'Newest', page = 1, limit = 6 } = {}) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filtered = [...MOCK_USERS];

    // Search filter (name or email)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.rawEmail.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filterStatus !== 'All') {
      if (filterStatus === 'Email Unverified') {
        filtered = filtered.filter((u) => !u.verified);
      } else {
        filtered = filtered.filter((u) => u.status === filterStatus);
      }
    }

    // Joined date filter
    if (filterJoined !== 'All') {
      if (filterJoined === 'Today') {
        filtered = filtered.filter((u) => u.joinedDate === '2026-09-14');
      } else if (filterJoined === 'This Week') {
        filtered = filtered.filter((u) => new Date(u.joinedDate) >= new Date('2026-09-07'));
      } else if (filterJoined === 'This Month') {
        filtered = filtered.filter((u) => new Date(u.joinedDate) >= new Date('2026-09-01'));
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'Name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'Oldest') {
        return new Date(a.joinedDate) - new Date(b.joinedDate);
      } else if (sortBy === 'Last Active') {
        return new Date(b.lastActiveTimestamp) - new Date(a.lastActiveTimestamp);
      } else {
        // 'Newest' default
        return new Date(b.joinedDate) - new Date(a.joinedDate);
      }
    });

    // Pagination
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * limit;
    const paginatedUsers = filtered.slice(startIndex, startIndex + limit);

    return {
      users: paginatedUsers,
      totalCount,
      totalPages,
      currentPage,
      limit
    };
  },

  /**
   * Get single user by ID with stats & activity
   */
  async getUserById(id) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const user = MOCK_USERS.find((u) => u.id === id) || MOCK_USERS[0];
    const userActivities = MOCK_ACTIVITIES.filter((a) => a.userId === user.id);

    return {
      user,
      activities: userActivities.length > 0 ? userActivities : MOCK_ACTIVITIES.slice(0, 3)
    };
  },

  /**
   * Get analytics dashboard dataset
   */
  async getAnalytics() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_ANALYTICS;
  },

  /**
   * Get notification history & Overview
   */
  async getNotifications() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      notifications: MOCK_ADMIN_NOTIFICATIONS,
      history: MOCK_BROADCAST_HISTORY,
      stats: {
        totalSent: 1626,
        scheduled: 1,
        failed: 1
      }
    };
  },

  /**
   * Get system status
   */
  async getSystemStatus() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_SYSTEM_STATUS;
  },

  /**
   * Mock Admin Settings
   */
  async getSettings() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      appName: 'ZELO Admin',
      timezone: 'UTC+05:30 (India Standard Time)',
      maintenanceMode: false,
      registrationOpen: true,
      emailNotifications: true,
      securityAlerts: true,
      defaultLanguage: 'English (US)'
    };
  },

  /**
   * Admin profile mock
   */
  async getAdminProfile() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      id: 'adm_001',
      name: 'ZELO Super Admin',
      email: 'admin@zelo.app',
      role: 'Super Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      lastLogin: 'Today, 05:38 PM'
    };
  }
};
