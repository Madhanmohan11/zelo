import React from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';

export function ConfirmDialog({ isOpen, onClose, title, message, actionLabel = 'Confirm', isDanger = false, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl ${
              isDanger ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Clear warning callout that backend is not connected yet */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2 text-xs font-semibold text-amber-800">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Backend not connected yet. This action is a UI placeholder and will not modify database records.</span>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition-all ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20'
            }`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
