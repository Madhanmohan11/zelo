// Mock notifications data for ZELO Admin Notification Management & Bell Menu

export const MOCK_ADMIN_NOTIFICATIONS = [
  {
    id: 'n_1',
    title: 'New User Spike Detected',
    message: '18 new users registered today in the last 6 hours.',
    timestamp: '15 mins ago',
    type: 'info',
    read: false
  },
  {
    id: 'n_2',
    title: 'Weekly Summary Report Ready',
    message: 'The Weekly User Growth and Feature Usage report is ready for export.',
    timestamp: '2 hours ago',
    type: 'report',
    read: false
  },
  {
    id: 'n_3',
    title: 'Backend Connection Status',
    message: 'Supabase integration is pending. Operating on mock database mode.',
    timestamp: '1 day ago',
    type: 'system',
    read: true
  },
  {
    id: 'n_4',
    title: 'System Health Check Completed',
    message: 'Frontend app rendering normally with 0 runtime errors detected.',
    timestamp: '2 days ago',
    type: 'success',
    read: true
  }
];

export const MOCK_BROADCAST_HISTORY = [
  {
    id: 'b_101',
    title: 'Welcome to ZELO v2.0',
    message: 'Explore your new daily tracker with food, workout & expense logging.',
    audience: 'All Users',
    sentCount: 1240,
    status: 'Sent',
    date: '2026-09-10 10:00 AM'
  },
  {
    id: 'b_102',
    title: 'New Feature Announcement: Daily Timeline',
    message: 'Check out the new interactive home timeline on your Today screen.',
    audience: 'Active Users',
    sentCount: 386,
    status: 'Sent',
    date: '2026-09-12 02:30 PM'
  },
  {
    id: 'b_103',
    title: 'Monthly Goal Check-in',
    message: 'Don\'t forget to log your habits and workout progress this weekend!',
    audience: 'Active Users',
    sentCount: 0,
    status: 'Scheduled',
    date: '2026-09-18 09:00 AM'
  },
  {
    id: 'b_104',
    title: 'Re-engagement Reminder',
    message: 'We miss you! Log your daily activity today.',
    audience: 'Inactive Users',
    sentCount: 0,
    status: 'Failed',
    failureReason: 'Backend push notification engine not connected',
    date: '2026-09-13 11:00 AM'
  }
];
