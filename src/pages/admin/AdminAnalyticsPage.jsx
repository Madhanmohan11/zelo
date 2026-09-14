import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Activity } from 'lucide-react';
import { ChartCard, GrowthAreaChart, DauBarChart, FeatureUsageBars } from '../../components/admin/ChartCard';
import { mockAdminService } from '../../admin/services/mockAdminService';

export function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockAdminService.getAnalytics().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Loading analytics dashboard...
        </div>
      </div>
    );
  }

  const { overview, userGrowth, dailyActiveUsers, featureUsage, retention } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
            <BarChart3 className="w-4 h-4" /> Platform Insights
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Analytics</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Deep dive into user acquisition, daily activity metrics, feature retention, and engagement.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1 rounded-xl shadow-2xs">
          {['7d', '30d', '90d'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === t ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t === '7d' ? 'Last 7 Days' : t === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* WAU / MAU / DAU Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Daily Active Users (DAU)</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">386</div>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
            +8.2% vs yesterday
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Weekly Active Users (WAU)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">842</div>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
            +11.5% vs last week
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Active Users (MAU)</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">1,120</div>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
            +15.3% vs last month
          </span>
        </div>
      </div>

      {/* Main Growth Curve */}
      <ChartCard title="Cumulative User Growth" subtitle={`Registration growth curve for timeframe: ${timeframe}`}>
        <GrowthAreaChart data={userGrowth[timeframe]} />
      </ChartCard>

      {/* Two Column Grid: DAU & User Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Active Users (DAU)" subtitle="Daily unique active user count">
          <DauBarChart data={dailyActiveUsers.history} />
        </ChartCard>

        {/* User Retention Curve */}
        <ChartCard title="User Retention Rate" subtitle="Percentage of users returning after N days">
          <div className="space-y-4 pt-2">
            {retention.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{item.period}</span>
                  <span className="text-slate-900">{item.rate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Feature Usage Detailed Breakdown */}
      <ChartCard
        title="Feature Engagement & Usage Breakdown"
        subtitle="Ranked by active user interaction rates"
      >
        <FeatureUsageBars features={featureUsage} />
      </ChartCard>
    </div>
  );
}
