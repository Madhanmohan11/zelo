import React, { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

export function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState('user_growth');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-14');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const reportTypes = [
    {
      id: 'user_growth',
      title: 'User Growth Report',
      description: 'Comprehensive audit of new user registrations, verification rates, and cohort metrics.',
      format: 'CSV / PDF'
    },
    {
      id: 'user_activity',
      title: 'User Activity Report',
      description: 'Granular logs of daily active sessions, feature interactions, and user retention rates.',
      format: 'CSV / JSON'
    },
    {
      id: 'feature_usage',
      title: 'Feature Usage Report',
      description: 'Breakdown of usage across Food, Workout, Remember, Expenses, and AI Assistant.',
      format: 'CSV / XLSX'
    },
    {
      id: 'expenses_activity',
      title: 'Expenses Activity Report',
      description: 'Aggregated expense logging trends and category distributions.',
      format: 'CSV'
    },
    {
      id: 'workout_activity',
      title: 'Workout Activity Report',
      description: 'Fitness tracker engagement, workout completion counts, and exercise categories.',
      format: 'CSV'
    },
    {
      id: 'food_activity',
      title: 'Food Activity Report',
      description: 'Nutrition logging activity, caloric entry frequency, and meal time logs.',
      format: 'CSV'
    }
  ];

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const reportMeta = reportTypes.find((r) => r.id === selectedReport);
      setGeneratedReport({
        ...reportMeta,
        generatedAt: new Date().toLocaleString(),
        dateRange: `${startDate} to ${endDate}`,
        recordCount: Math.floor(Math.random() * 400) + 100,
        fileSize: `${(Math.random() * 2 + 0.4).toFixed(2)} MB`
      });
    }, 400);
  };

  const handleExportDownload = () => {
    alert(`Downloading ${generatedReport?.title} (${startDate} to ${endDate}). (UI placeholder feature).`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
          <FileSpreadsheet className="w-4 h-4" /> Administrative Reports
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Reports</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Generate, customize, and export platform analytical reports for business intelligence.
        </p>
      </div>

      {/* Generator Form Card */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-700" /> Report Configuration
        </h3>

        <form onSubmit={handleGenerateReport} className="space-y-6">
          {/* Select Report Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Select Report Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportTypes.map((rpt) => (
                <div
                  key={rpt.id}
                  onClick={() => setSelectedReport(rpt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReport === rpt.id
                      ? 'bg-teal-50/40 border-teal-600 ring-2 ring-teal-600/10'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{rpt.title}</h4>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {rpt.format}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{rpt.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Report Result Card */}
      {generatedReport && (
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{generatedReport.title} Ready</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Generated for period: {generatedReport.dateRange} &bull; {generatedReport.generatedAt}
                </p>
              </div>
            </div>

            <button
              onClick={handleExportDownload}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Report ({generatedReport.format})
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Records Processed</span>
              <div className="text-sm font-bold text-slate-900 mt-1">{generatedReport.recordCount} rows</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 font-bold uppercase text-[10px]">File Size</span>
              <div className="text-sm font-bold text-slate-900 mt-1">{generatedReport.fileSize}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
              <div className="text-sm font-bold text-emerald-700 mt-1">Ready for Download</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Backend Status</span>
              <div className="text-sm font-bold text-slate-600 mt-1">Mock Development Data</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
