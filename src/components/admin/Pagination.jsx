import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange, totalCount, limit }) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-800">{start}</span> to{' '}
        <span className="font-bold text-slate-800">{end}</span> of{' '}
        <span className="font-bold text-slate-800">{totalCount}</span> users
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                currentPage === p
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
