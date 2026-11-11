import React from 'react';
import { X, History, CheckCheck, Users, RotateCcw } from 'lucide-react';
import type { SentBroadcastRecord } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SentBroadcastRecord[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onRefresh,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative bg-surface border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
              <History className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Broadcast Delivery Logs</h3>
              <p className="text-xs text-ink-muted">Historical SMS dispatches and delivery status</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition cursor-pointer disabled:opacity-50"
                title="Refresh logs"
              >
                <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-12 text-ink-muted text-xs">
              No broadcasts logged yet.
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-surface-2/40 border border-gray-200 dark:border-zinc-800 rounded-2xl space-y-2 hover:border-gray-300 dark:hover:border-zinc-700 transition shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-ink">{rec.className}</span>
                    <span className="text-xs text-ink-faint">&bull;</span>
                    <span className="text-xs text-ink-muted font-medium">{rec.section}</span>
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> {rec.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-ink-faint">{rec.timestamp}</span>
                </div>

                <p className="text-xs text-ink bg-surface p-3 rounded-xl border border-gray-200 dark:border-zinc-800 whitespace-pre-wrap leading-relaxed">
                  {rec.message}
                </p>

                <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-ink-faint" />
                    <strong>{rec.totalRecipients}</strong> recipients
                  </span>
                  <span className="font-semibold text-[#1b1e42] dark:text-accent">
                    Cost: {rec.totalSmsUnits} Credits
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-full bg-surface-2 hover:bg-surface-3 text-ink transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
