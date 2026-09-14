import React from 'react';

export function ChartCard({ title, subtitle, action, children }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

/**
 * Clean SVG Growth Area Chart
 */
export function GrowthAreaChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.users)) * 1.05;
  const minVal = Math.min(...data.map((d) => d.users)) * 0.95;

  const width = 500;
  const height = 180;

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((d.users - minVal) / (maxVal - minVal)) * height;
    return { x, y, label: d.date, val: d.users };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`),
    ''
  );
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full">
      <div className="h-48 w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background grid lines */}
          <line x1="0" y1="0" x2={width} y2="0" stroke="#F1F5F9" strokeWidth="1" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#F1F5F9" strokeWidth="1" />
          <line x1="0" y1={height} x2={width} y2={height} stroke="#E2E8F0" strokeWidth="1" />

          {/* Area fill */}
          <path d={areaD} fill="url(#growthGradient)" />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#FFFFFF"
                stroke="#0D9488"
                strokeWidth="2.5"
                className="transition-all group-hover:r-6"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between mt-3 text-xs font-semibold text-slate-400">
        {data.map((d, i) => (
          <span key={i}>{d.date}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Clean SVG Bar Chart for Daily Active Users
 */
export function DauBarChart({ data = [] }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.count)) * 1.15;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-44 gap-2 pt-4 border-b border-slate-100">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.count / maxVal) * 100);
          const isToday = item.day === 'Mon';

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[11px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.count}
              </div>
              <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden p-1">
                <div
                  className={`w-full rounded-md transition-all duration-500 ${
                    isToday ? 'bg-teal-600' : 'bg-teal-500/30 group-hover:bg-teal-500/60'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${isToday ? 'text-teal-700 font-bold' : 'text-slate-500'}`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Clean Horizontal Bar Visualization for Feature Usage
 */
export function FeatureUsageBars({ features = [] }) {
  return (
    <div className="space-y-4">
      {features.map((feat, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: feat.color || '#0F766E' }} />
              {feat.name}
            </span>
            <span className="font-bold text-slate-900">{feat.percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${feat.percentage}%`,
                backgroundColor: feat.color || '#0F766E'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
