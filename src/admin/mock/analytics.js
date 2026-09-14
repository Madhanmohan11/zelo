// Mock data for ZELO Admin Analytics

export const MOCK_ANALYTICS = {
  overview: {
    totalUsers: 1248,
    activeToday: 386,
    newToday: 18,
    newThisWeek: 104,
    totalUsersChange: '+12.4% vs last month',
    activeTodayChange: '+8.2% vs yesterday',
    newTodayChange: '+5.5% vs yesterday',
    newThisWeekChange: '+14.8% vs last week'
  },
  
  userGrowth: {
    '7d': [
      { date: 'Sep 08', users: 1150, newUsers: 12 },
      { date: 'Sep 09', users: 1164, newUsers: 14 },
      { date: 'Sep 10', users: 1180, newUsers: 16 },
      { date: 'Sep 11', users: 1195, newUsers: 15 },
      { date: 'Sep 12', users: 1212, newUsers: 17 },
      { date: 'Sep 13', users: 1230, newUsers: 18 },
      { date: 'Sep 14', users: 1248, newUsers: 18 }
    ],
    '30d': [
      { date: 'Aug 16', users: 920, newUsers: 8 },
      { date: 'Aug 21', users: 975, newUsers: 11 },
      { date: 'Aug 26', users: 1030, newUsers: 11 },
      { date: 'Aug 31', users: 1085, newUsers: 12 },
      { date: 'Sep 05', users: 1130, newUsers: 9 },
      { date: 'Sep 10', users: 1180, newUsers: 16 },
      { date: 'Sep 14', users: 1248, newUsers: 18 }
    ],
    '90d': [
      { date: 'Jun 16', users: 450, newUsers: 5 },
      { date: 'Jul 01', users: 580, newUsers: 8 },
      { date: 'Jul 16', users: 710, newUsers: 9 },
      { date: 'Aug 01', users: 840, newUsers: 10 },
      { date: 'Aug 16', users: 920, newUsers: 8 },
      { date: 'Sep 01', users: 1085, newUsers: 12 },
      { date: 'Sep 14', users: 1248, newUsers: 18 }
    ]
  },

  dailyActiveUsers: {
    today: 386,
    yesterday: 356,
    avg7Days: 362,
    avg30Days: 320,
    history: [
      { day: 'Mon', count: 386 },
      { day: 'Sun', count: 356 },
      { day: 'Sat', count: 340 },
      { day: 'Fri', count: 372 },
      { day: 'Thu', count: 368 },
      { day: 'Wed', count: 355 },
      { day: 'Tue', count: 359 }
    ]
  },

  featureUsage: [
    { name: 'Expenses', percentage: 71, count: '8,420 entries', color: '#0F766E' },
    { name: 'Food', percentage: 68, count: '7,950 entries', color: '#0D9488' },
    { name: 'Workout', percentage: 54, count: '6,210 entries', color: '#10B981' },
    { name: 'Remember', percentage: 42, count: '4,890 entries', color: '#059669' },
    { name: 'Tasks', percentage: 38, count: '4,110 entries', color: '#3B82F6' },
    { name: 'Goals', percentage: 31, count: '3,240 entries', color: '#6366F1' },
    { name: 'Sleep', percentage: 29, count: '2,980 entries', color: '#8B5CF6' },
    { name: 'Water', percentage: 25, count: '2,450 entries', color: '#0EA5E9' },
    { name: 'Habits', percentage: 22, count: '2,100 entries', color: '#F59E0B' },
    { name: 'Calendar', percentage: 19, count: '1,820 entries', color: '#EC4899' },
    { name: 'AI Assistant', percentage: 15, count: '1,340 queries', color: '#14B8A6' }
  ],

  retention: [
    { period: 'Day 1', rate: 84 },
    { period: 'Day 7', rate: 62 },
    { period: 'Day 14', rate: 51 },
    { period: 'Day 30', rate: 43 },
    { period: 'Day 60', rate: 38 },
    { period: 'Day 90', rate: 35 }
  ]
};
