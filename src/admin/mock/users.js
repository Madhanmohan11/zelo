// Mock data for ZELO Admin Panel User Management
// Masked email addresses as specified in requirements

export const MOCK_USERS = [
  {
    id: 'usr_101',
    name: 'Madhan Mohan',
    email: 'm***n@gmail.com',
    rawEmail: 'madhan@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    status: 'Active',
    joinedDate: '2026-09-14',
    joinedFormatted: 'Sep 14, 2026',
    lastActive: 'Just now',
    lastActiveTimestamp: '2026-09-14T17:30:00Z',
    verified: true,
    onboardingCompleted: true,
    role: 'User',
    stats: {
      meals: 24,
      workouts: 12,
      remember: 8,
      expenses: 43
    }
  },
  {
    id: 'usr_102',
    name: 'Sarah Jenkins',
    email: 's***h@outlook.com',
    rawEmail: 'sarah.j@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    status: 'Active',
    joinedDate: '2026-09-12',
    joinedFormatted: 'Sep 12, 2026',
    lastActive: '2 hours ago',
    lastActiveTimestamp: '2026-09-14T15:10:00Z',
    verified: true,
    onboardingCompleted: true,
    role: 'User',
    stats: {
      meals: 19,
      workouts: 8,
      remember: 14,
      expenses: 28
    }
  },
  {
    id: 'usr_103',
    name: 'Alex Rivera',
    email: 'a***x@techcorp.io',
    rawEmail: 'alex.r@techcorp.io',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    status: 'Active',
    joinedDate: '2026-09-10',
    joinedFormatted: 'Sep 10, 2026',
    lastActive: '5 hours ago',
    lastActiveTimestamp: '2026-09-14T12:00:00Z',
    verified: true,
    onboardingCompleted: true,
    role: 'User',
    stats: {
      meals: 31,
      workouts: 15,
      remember: 5,
      expenses: 62
    }
  },
  {
    id: 'usr_104',
    name: 'Elena Rostova',
    email: 'e***a@protonmail.com',
    rawEmail: 'elena.r@protonmail.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    status: 'Inactive',
    joinedDate: '2026-09-08',
    joinedFormatted: 'Sep 08, 2026',
    lastActive: '3 days ago',
    lastActiveTimestamp: '2026-09-11T09:30:00Z',
    verified: true,
    onboardingCompleted: true,
    role: 'User',
    stats: {
      meals: 6,
      workouts: 2,
      remember: 1,
      expenses: 9
    }
  },
  {
    id: 'usr_105',
    name: 'David Chen',
    email: 'd***d@startup.co',
    rawEmail: 'david.c@startup.co',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    status: 'Unverified',
    joinedDate: '2026-09-14',
    joinedFormatted: 'Sep 14, 2026',
    lastActive: '10 mins ago',
    lastActiveTimestamp: '2026-09-14T17:20:00Z',
    verified: false,
    onboardingCompleted: false,
    role: 'User',
    stats: {
      meals: 0,
      workouts: 0,
      remember: 0,
      expenses: 0
    }
  },
  {
    id: 'usr_106',
    name: 'Emma Watson',
    email: 'e***a@domain.org',
    rawEmail: 'emma.w@domain.org',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    status: 'Active',
    joinedDate: '2026-09-01',
    joinedFormatted: 'Sep 01, 2026',
    lastActive: 'Yesterday',
    lastActiveTimestamp: '2026-09-13T18:45:00Z',
    verified: true,
    onboardingCompleted: true,
    role: 'User',
    stats: {
      meals: 45,
      workouts: 22,
      remember: 19,
      expenses: 88
    }
  },
  {
    id: 'usr_107',
    name: 'Marcus Vance',
    email: 'm***s@agency.com',
    rawEmail: 'marcus.v@agency.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    status: 'Active',
    joinedDate: '2026-08-25',
    joinedFormatted: 'Aug 25, 2026',
    lastActive: '4 hours ago',
    lastActiveTimestamp: '2026-09-14T13:30:00Z',
    verified: true,
    onboardingCompleted: true,
    role: 'User',
    stats: {
      meals: 52,
      workouts: 18,
      remember: 30,
      expenses: 104
    }
  },
  {
    id: 'usr_108',
    name: 'Priya Sharma',
    email: 'p***a@global.net',
    rawEmail: 'priya.s@global.net',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    status: 'Inactive',
    joinedDate: '2026-08-18',
    joinedFormatted: 'Aug 18, 2026',
    lastActive: '12 days ago',
    lastActiveTimestamp: '2026-09-02T11:15:00Z',
    verified: true,
    onboardingCompleted: true,
    role: 'User',
    stats: {
      meals: 12,
      workouts: 5,
      remember: 3,
      expenses: 14
    }
  },
  {
    id: 'usr_109',
    name: 'Liam O\'Connor',
    email: 'l***m@company.com',
    rawEmail: 'liam.o@company.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    status: 'Active',
    joinedDate: '2026-09-13',
    joinedFormatted: 'Sep 13, 2026',
    lastActive: '30 mins ago',
    lastActiveTimestamp: '2026-09-14T17:00:00Z',
    verified: true,
    onboardingCompleted: true,
    role: 'User',
    stats: {
      meals: 8,
      workouts: 4,
      remember: 2,
      expenses: 11
    }
  },
  {
    id: 'usr_110',
    name: 'Sophia Patel',
    email: 's***a@design.co',
    rawEmail: 'sophia.p@design.co',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    status: 'Unverified',
    joinedDate: '2026-09-14',
    joinedFormatted: 'Sep 14, 2026',
    lastActive: '1 hour ago',
    lastActiveTimestamp: '2026-09-14T16:30:00Z',
    verified: false,
    onboardingCompleted: false,
    role: 'User',
    stats: {
      meals: 1,
      workouts: 0,
      remember: 0,
      expenses: 2
    }
  }
];
