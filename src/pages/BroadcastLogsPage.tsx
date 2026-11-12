import React, { useState } from 'react';
import {
  History,
  CheckCheck,
  Users,
  RotateCcw,
  Search,
  Send,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { SentBroadcastRecord, AppPage } from '../types';

interface BroadcastLogsPageProps {
  records: SentBroadcastRecord[];
  onRefresh?: () => void;
  isLoading?: boolean;
  onNavigate: (page: AppPage) => void;
  onReuseMessage?: (message: string) => void;
}

export const BroadcastLogsPage: React.FC<BroadcastLogsPageProps> = ({
  records,
  onRefresh,
  isLoading,
  onNavigate,
  onReuseMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // Compute summary stats
  const totalDispatches = records.length;
  const totalSmsUnits = records.reduce((acc, r) => acc + (r.totalSmsUnits || 0), 0);
  const totalRecipients = records.reduce((acc, r) => acc + (r.totalRecipients || 0), 0);

  const filteredRecords = records.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchSearch =
      r.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.timestamp.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleReuse = (msg: string) => {
    if (onReuseMessage) {
      onReuseMessage(msg);
    }
    onNavigate('delivery');
  };

  return (
    <div className="space-y-4">
      {/* Page Head Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight mb-0.5">
            Broadcast Delivery Logs
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Inspect sent notifications, delivery rates, dispatch receipts, and student recipients.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-2 hover:bg-surface text-ink text-xs font-semibold border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs disabled:opacity-50"
              title="Refresh logs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('delivery')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs transition cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card !p-4 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card flex items-center gap-3.5">
          <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent w-10 h-10 rounded-xl">
            <History className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xl font-bold font-mono text-ink leading-none">{totalDispatches}</div>
            <div className="text-[11px] text-ink-muted mt-1 font-medium">Broadcasts Sent</div>
          </div>
        </div>

        <div className="card !p-4 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card flex items-center gap-3.5">
          <span className="icon-chip bg-surface-2 text-emerald-600 dark:text-emerald-400 w-10 h-10 rounded-xl">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xl font-bold font-mono text-ink leading-none">{totalRecipients.toLocaleString()}</div>
            <div className="text-[11px] text-ink-muted mt-1 font-medium">Recipients Reached</div>
          </div>
        </div>

        <div className="card !p-4 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card flex items-center gap-3.5">
          <span className="icon-chip bg-surface-2 text-amber-600 dark:text-amber-400 w-10 h-10 rounded-xl">
            <CheckCheck className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xl font-bold font-mono text-ink leading-none">{totalSmsUnits.toLocaleString()}</div>
            <div className="text-[11px] text-ink-muted mt-1 font-medium">SMS Units Consumed</div>
          </div>
        </div>
      </div>

      {/* Main Logs Table Card */}
      <div className="card !p-5 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['all', 'Delivered', 'Partially Delivered', 'Processing'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#1b1e42] dark:bg-accent text-white shadow-2xs'
                    : 'bg-surface-2 text-ink hover:bg-surface border border-gray-200 dark:border-zinc-800'
                }`}
              >
                {st === 'all' ? 'All Broadcasts' : st}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by text, class..."
              className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none transition-colors"
            />
          </div>
        </div>

        {/* Logs List */}
        {filteredRecords.length === 0 ? (
          <div className="p-10 bg-surface-2/30 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl text-center text-xs text-ink-muted space-y-2">
            <History className="w-8 h-8 text-ink-faint mx-auto opacity-50" />
            <p className="font-semibold text-ink">No Broadcast Logs Found</p>
            <p className="text-[11px] text-ink-faint max-w-sm mx-auto">
              {searchQuery ? 'No dispatch records match your search filter.' : 'When you dispatch messages from SMS Delivery, real-time records and delivery logs will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => {
              const isExpanded = expandedRecordId === record.id;
              const isDelivered = record.status === 'Delivered';
              const isPartial = record.status === 'Partially Delivered';

              return (
                <div
                  key={record.id}
                  className="p-4 bg-surface border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-2xl transition shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-ink">{record.className}</span>
                      <span className="text-ink-faint">&bull;</span>
                      <span className="text-xs text-ink-muted">{record.section}</span>
                      <span className="text-ink-faint">&bull;</span>
                      <span className="text-[11px] font-mono text-ink-faint flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {record.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isDelivered
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                            : isPartial
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                            : 'bg-surface-2 border-gray-200 dark:border-zinc-800 text-ink-muted'
                        }`}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>{record.status}</span>
                      </span>

                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-surface-2 text-ink border border-gray-200 dark:border-zinc-800">
                        {record.totalRecipients} recipients
                      </span>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="p-3 bg-surface-2/60 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-ink leading-relaxed whitespace-pre-wrap font-sans">
                    {record.message}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-ink-muted font-mono">
                      Units: {record.totalSmsUnits} SMS
                    </span>

                    <div className="flex items-center gap-2">
                      {record.recipients && record.recipients.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                          className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink font-medium cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Recipients' : `View Recipients (${record.recipients.length})`}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleReuse(record.message)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-surface-2 hover:bg-surface-3 text-ink border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs active:scale-95"
                      >
                        <span>Re-send in SMS Delivery</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Recipients List */}
                  {isExpanded && record.recipients && (
                    <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 animate-in fade-in duration-200 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint block">
                        Recipient Dispatch Details
                      </span>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                        {record.recipients.map((rcp, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-surface-2/40 border border-gray-200 dark:border-zinc-800 text-xs"
                          >
                            <span className="font-medium text-ink">{rcp.name}</span>
                            <span className="font-mono text-ink-muted">{rcp.mobile}</span>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              {rcp.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
