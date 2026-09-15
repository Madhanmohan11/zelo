// System health mock data clearly showing disconnected backend status

export const MOCK_SYSTEM_STATUS = {
  overall: 'Development Mode - Frontend Complete',
  lastCheck: 'Just now',
  services: [
    {
      id: 'frontend',
      name: 'Frontend Web App (React + Vite)',
      status: 'Operational',
      statusType: 'success',
      uptime: '99.98%',
      latency: '12ms',
      notes: 'Running smoothly on local server.'
    },
    {
      id: 'database',
      name: 'Database (Supabase PostgreSQL)',
      status: 'Not Connected Yet',
      statusType: 'warning',
      uptime: 'N/A',
      latency: 'N/A',
      notes: 'Pending backend connection phase. Frontend currently operating on mock development services.'
    },
    {
      id: 'auth',
      name: 'Authentication (Supabase Auth / GoTrue)',
      status: 'Not Connected Yet',
      statusType: 'warning',
      uptime: 'N/A',
      latency: 'N/A',
      notes: 'Real auth & role checks will be enabled after database connection.'
    },
    {
      id: 'notifications',
      name: 'Push Notification Engine',
      status: 'Not Connected Yet',
      statusType: 'warning',
      uptime: 'N/A',
      latency: 'N/A',
      notes: 'UI workflow built. Requires Supabase edge functions or notification provider.'
    },
    {
      id: 'api',
      name: 'Rest & Realtime API Gateway',
      status: 'Not Connected Yet',
      statusType: 'warning',
      uptime: 'N/A',
      latency: 'N/A',
      notes: 'Mock API abstraction service active in src/admin/services/mockAdminService.js.'
    }
  ],
  environment: {
    nodeEnv: 'development',
    framework: 'React 19 + Vite 8',
    styling: 'TailwindCSS v4',
    routing: 'React Router DOM v7',
    clientVersion: 'v2.1.0-admin-beta'
  }
};
