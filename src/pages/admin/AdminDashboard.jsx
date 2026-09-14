import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserPlus, TrendingUp, Sparkles } from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { ChartCard, GrowthAreaChart, DauBarChart, FeatureUsageBars } from '../../components/admin/ChartCard';
import { ActivityTimeline } from '../../components/admin/ActivityTimeline';
import { mockAdminService } from '../../admin/services/mockAdminService';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockAdminService.getDashboardOverview().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Loading ZELO platform analytics...
        </div>
      </div>
    );
  }

  const { overview, userGrowth, dailyActiveUsers, featureUsage, recentActivities } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
            <Sparkles className="w-4 h-4" /> ZELO Platform Overview
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Good evening, Admin
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Here is what is happening across ZELO users today.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Metrics (Mock Data)
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Users"
          value={overview.totalUsers.toLocaleString()}
          change={overview.totalUsersChange}
          icon={Users}
          subtext="Total registered accounts"
        />
        <StatCard
          title="Active Today"
          value={overview.activeToday.toLocaleString()}
          change={overview.activeTodayChange}
          icon={UserCheck}
          subtext="LoggedIn or active in 24h"
        />
        <StatCard
          title="New Today"
          value={overview.newToday.toLocaleString()}
          change={overview.newTodayChange}
          icon={UserPlus}
          subtext="New registrations today"
        />
        <StatCard
          title="This Week"
          value={overview.newThisWeek.toLocaleString()}
          change={overview.newThisWeekChange}
          icon={TrendingUp}
          subtext="New registrations this week"
        />
      </div>

      {/* Charts Grid: Growth & Daily Active Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart (2 cols) */}
        <div className="lg:col-span-2">
          <ChartCard
            title="User Growth"
            subtitle="Total registered users trajectory"
            action={
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['7d', '30d', '90d'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      timeframe === t
                        ? 'bg-white text-teal-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Last {t}
                  </button>
                ))}
              </div>
            }
          >
            <GrowthAreaChart data={userGrowth[timeframe]} />
          </ChartCard>
        </div>

        {/* Daily Active Users Bar Summary (1 col) */}
        <div>
          <ChartCard title="Daily Active Users" subtitle="Active users over the last 7 days">
            <DauBarChart data={dailyActiveUsers.history} />
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Today</span>
                <span className="text-base font-extrabold text-slate-900">{dailyActiveUsers.today}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Yesterday</span>
                <span className="text-base font-extrabold text-slate-900">{dailyActiveUsers.yesterday}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">7-Day Avg</span>
                <span className="text-base font-extrabold text-slate-900">{dailyActiveUsers.avg7Days}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">30-Day Avg</span>
                <span className="text-base font-extrabold text-slate-900">{dailyActiveUsers.avg30Days}</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Feature Usage & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <ChartCard
          title="Feature Usage"
          subtitle="Percentage of active users engaging with features"
        >
          <FeatureUsageBars features={featureUsage} />
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard title="Recent Activity" subtitle="Real-time timeline of user actions">
          <ActivityTimeline activities={recentActivities} />
        </ChartCard>
      </div>
    </div>
  );
}
