import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarClock,
  Clock,
  Trash2,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Users,
  MessageSquare,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import type { ScheduledBroadcastItem } from '../types/api';
import type { AppPage } from '../types';
import { smsService } from '../services/smsService';
import { toast } from '../services/toastService';

interface ScheduledMessagesPageProps {
  onNavigate?: (page: AppPage) => void;
  onRefreshParent?: () => void;
}

export const ScheduledMessagesPage: React.FC<ScheduledMessagesPageProps> = ({
  onNavigate,
  onRefreshParent,
}) => {
  const [scheduledItems, setScheduledItems] = useState<ScheduledBroadcastItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Real-time ticking clock for live countdown calculation
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchScheduled = useCallback(async (quiet: boolean = false) => {
    if (!quiet) setIsLoading(true);
    setError(null);
    try {
      const data = await smsService.getScheduled();
      setScheduledItems(data);
      if (onRefreshParent) onRefreshParent();
    } catch (err: unknown) {
      console.error('Failed to load scheduled broadcasts:', err);
      if (!quiet) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch scheduled broadcasts.';
        setError(msg);
      }
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, [onRefreshParent]);

  // Initial fetch and 3-second auto-refresh polling
  useEffect(() => {
    let isMounted = true;
    smsService.getScheduled()
      .then((data) => {
        if (isMounted) {
          setScheduledItems(data);
          setIsLoading(false);
          if (onRefreshParent) onRefreshParent();
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setIsLoading(false);
          const msg = err instanceof Error ? err.message : 'Failed to fetch scheduled broadcasts.';
          setError(msg);
        }
      });

    const poller = setInterval(() => {
      smsService.getScheduled()
        .then((data) => {
          if (isMounted) {
            setScheduledItems(data);
            if (onRefreshParent) onRefreshParent();
          }
        })
        .catch(() => {});
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(poller);
    };
  }, [onRefreshParent]);

  // Handle Cancel
  const handleCancel = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled broadcast?')) {
      return;
    }
    try {
      await smsService.cancelScheduled(jobId);
      toast.success('SUCCESS_SCHEDULED_CANCELLED');
      setActionSuccessMessage('Scheduled broadcast cancelled successfully.');
      setTimeout(() => setActionSuccessMessage(null), 3000);
      await fetchScheduled(false);
    } catch (err) {
      console.error('Failed to cancel scheduled broadcast:', err);
      toast.error('ERR_CANCEL_SCHEDULED_FAILED');
    }
  };

  // Handle Send Now
  const handleSendNow = async (jobId: string) => {
    try {
      await smsService.triggerScheduledNow(jobId);
      toast.success('SUCCESS_SCHEDULED_DISPATCHED_NOW');
      setActionSuccessMessage('Broadcast dispatched immediately and moved to logs.');
      setTimeout(() => setActionSuccessMessage(null), 3000);
      await fetchScheduled(false);
    } catch (err) {
      console.error('Failed to immediately send scheduled broadcast:', err);
      toast.error('ERR_DISPATCH_NOW_FAILED');
    }
  };

  // Helper for computing countdown text
  const getCountdown = (scheduledForUtc: string) => {
    const schedDate = new Date(scheduledForUtc);
    const diffMs = schedDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return {
        text: 'Executing & delivering...',
        isDue: true,
        hours: 0,
        mins: 0,
        secs: 0,
      };
    }

    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    let text = '';
    if (hours > 0) text += `${hours}h `;
    if (mins > 0 || hours > 0) text += `${mins}m `;
    text += `${secs}s`;

    return {
      text: `in ${text.trim()}`,
      isDue: false,
      hours,
      mins,
      secs,
    };
  };

  const nextUpcoming = useMemo(() => {
    if (scheduledItems.length === 0) return null;
    return scheduledItems[0];
  }, [scheduledItems]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight mb-0.5">
              Scheduled Messages
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
              {scheduledItems.length} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted">
            Automated SMS messages scheduled by day, hour, minute, and second. When the scheduled time is reached, broadcasts auto-deliver and move directly to Broadcast Logs.
          </p>
        </div>

        {/* Actions & Safety Info */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchScheduled(false)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-2 hover:bg-surface-3 text-ink transition cursor-pointer border border-gray-200 dark:border-zinc-800"
            title="Refresh scheduled list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('delivery')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white transition cursor-pointer shadow-xs"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Schedule New</span>
            </button>
          )}
        </div>
      </div>

      {/* Info & Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Zero Cost Banner */}
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
              Zero-Cost Simulation
            </span>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300">
              Mock dispatches active. Zero balance consumed.
            </span>
          </div>
        </div>

        {/* Next Scheduled Broadcast */}
        <div className="p-3 bg-surface-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-ink-faint block">
              Next Scheduled Dispatch
            </span>
            <span className="font-semibold text-ink">
              {nextUpcoming ? nextUpcoming.targetGroupSummary : 'No broadcasts queued'}
            </span>
          </div>
          {nextUpcoming && (
            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold">
              {getCountdown(nextUpcoming.scheduledFor).text}
            </span>
          )}
        </div>

        {/* Destination Reminder */}
        <div className="p-3 bg-surface-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-ink-faint block">
              Post-Execution Destination
            </span>
            <span className="font-semibold text-ink">
              Auto-moves to Broadcast Logs
            </span>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('logs')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View Logs</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Action Feedback Message */}
      {actionSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content: Scheduled Items Table or Cards */}
      {isLoading && scheduledItems.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-2xl border border-gray-200 dark:border-zinc-800">
          <div className="w-7 h-7 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted">Loading scheduled messages...</p>
        </div>
      ) : scheduledItems.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">No Scheduled Messages</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto mt-1">
              There are currently no SMS broadcasts waiting in the queue. You can schedule a message anytime from the SMS Delivery screen.
            </p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('delivery')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white transition shadow-sm cursor-pointer"
            >
              <span>Go to SMS Delivery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledItems.map((item) => {
            const countdown = getCountdown(item.scheduledFor);
            const schedDate = new Date(item.scheduledFor);

            return (
              <div
                key={item.jobId}
                className="p-4 bg-surface rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700/60 transition space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-ink">
                          {item.targetGroupSummary || 'SMS Broadcast'}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted">
                        Job ID: <span className="font-mono">{item.jobId}</span> &bull; Created: {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Countdown Badge & Delivery Timestamp */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-ink-faint block uppercase">
                        Exact Delivery Time
                      </span>
                      <span className="text-xs font-semibold text-ink font-mono">
                        {schedDate.toLocaleString()}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold shrink-0 ${
                        countdown.isDue
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 animate-pulse'
                          : 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      {countdown.text}
                    </span>
                  </div>
                </div>

                {/* Details Grid: Recipients & Message */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start text-xs">
                  {/* Left: Message preview */}
                  <div className="md:col-span-8 bg-surface-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <span className="text-[10.5px] font-bold text-ink-faint uppercase block mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Message Content:
                    </span>
                    <p className="text-xs text-ink whitespace-pre-wrap leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {/* Right: Recipients & Actions */}
                  <div className="md:col-span-4 space-y-2">
                    <div className="bg-surface-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-muted flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-ink-faint" />
                          Total Recipients:
                        </span>
                        <span className="font-bold text-ink font-mono text-sm">
                          {item.totalRecipients || item.recipients?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-ink-muted">Simulated Cost:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          0 Credits (Mock)
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSendNow(item.jobId)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer active:scale-95"
                        title="Dispatch immediately without waiting"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Now</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCancel(item.jobId)}
                        className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer active:scale-95"
                        title="Cancel this scheduled broadcast"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="text-[11px] text-ink-muted flex items-center justify-between pt-1">
                  <span>
                    ⚡ At <strong>{schedDate.toLocaleTimeString()}</strong>, this broadcast will automatically execute, vanish from this menu, and log into <strong>Broadcast Logs</strong>.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
