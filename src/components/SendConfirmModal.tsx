import React, { useState, useMemo, useEffect } from 'react';
import { X, Send, CheckCircle2, CalendarClock, Clock, Calendar, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Student, SmsMetrics } from '../types';
import { smsService } from '../services/smsService';

interface SendConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  targetGroupSummary?: string;
  selectedStudents: Student[];
  metrics: SmsMetrics;
  onSendSuccess: (recipients: Student[], message: string, isScheduled?: boolean) => void;
}

export const SendConfirmModal: React.FC<SendConfirmModalProps> = ({
  isOpen,
  onClose,
  message,
  targetGroupSummary = 'SMS Broadcast',
  selectedStudents,
  metrics,
  onSendSuccess,
}) => {
  const [dispatchMode, setDispatchMode] = useState<'now' | 'schedule'>('now');
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Scheduling states: Date, Hour (00-23), Minute (00-59), Second (00-59)
  const [todayStr] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  const [schedDate, setSchedDate] = useState<string>(todayStr);
  const [schedHour, setSchedHour] = useState<number>(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000); // Default +5 min
    return d.getHours();
  });
  const [schedMinute, setSchedMinute] = useState<number>(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    return d.getMinutes();
  });
  const [schedSecond, setSchedSecond] = useState<number>(0);

  // Current real-time clock to check validity & countdown
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  useEffect(() => {
    if (!isOpen || dispatchMode !== 'schedule') return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen, dispatchMode]);

  useEffect(() => {
    if (!isOpen || isSending) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSending, onClose]);

  // Construct target Date object from inputs
  const targetDate = useMemo(() => {
    if (!schedDate) return null;
    const parts = schedDate.split('-').map(Number);
    if (parts.length !== 3) return null;
    const [year, month, day] = parts;
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day, schedHour, schedMinute, schedSecond);
  }, [schedDate, schedHour, schedMinute, schedSecond]);

  const diffMs = useMemo(() => {
    if (!targetDate) return 0;
    return targetDate.getTime() - currentTime.getTime();
  }, [targetDate, currentTime]);

  const isFuture = diffMs > 2000; // at least 2 seconds in future

  const formattedCountdown = useMemo(() => {
    if (diffMs <= 0) return 'Scheduled time has passed';
    const totalSec = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const parts: string[] = [];
    if (hrs > 0) parts.push(`${hrs} hr${hrs === 1 ? '' : 's'}`);
    if (mins > 0 || hrs > 0) parts.push(`${mins} min${mins === 1 ? '' : 's'}`);
    parts.push(`${secs} sec${secs === 1 ? '' : 's'}`);
    return `Will dispatch in ${parts.join(' ')}`;
  }, [diffMs]);

  // Quick preset helper
  const applyPresetSeconds = (seconds: number) => {
    const target = new Date(Date.now() + seconds * 1000);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    setSchedDate(`${y}-${m}-${d}`);
    setSchedHour(target.getHours());
    setSchedMinute(target.getMinutes());
    setSchedSecond(target.getSeconds());
  };

  const applyTomorrowMorning = () => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    setSchedDate(`${y}-${m}-${d}`);
    setSchedHour(9);
    setSchedMinute(0);
    setSchedSecond(0);
  };

  if (!isOpen) return null;

  const handleConfirmSend = async () => {
    setIsSending(true);
    setSendError(null);

    try {
      if (dispatchMode === 'now') {
        // Immediate send
        await smsService.sendBroadcast({
          message,
          targetGroupSummary: targetGroupSummary.trim() || 'SMS Broadcast',
          recipients: selectedStudents,
        });
      } else {
        // Scheduled send
        if (!targetDate || !isFuture) {
          throw new Error('Please select a scheduled delivery time in the future.');
        }

        await smsService.scheduleBroadcast({
          message,
          targetGroupSummary: targetGroupSummary.trim() || 'SMS Broadcast',
          recipients: selectedStudents,
          scheduledFor: targetDate.toISOString(),
        });
      }

      setIsDone(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onSendSuccess(selectedStudents, message, dispatchMode === 'schedule');

      setTimeout(() => {
        setIsDone(false);
        onClose();
      }, 1800);
    } catch (err: unknown) {
      console.error('Failed to dispatch broadcast:', err);
      const msg = err instanceof Error ? err.message : 'Failed to process SMS delivery request.';
      setSendError(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative bg-surface border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
              {dispatchMode === 'schedule' ? (
                <CalendarClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </span>
            <div>
              <h3 id="send-confirm-title" className="text-base font-bold text-ink">
                {dispatchMode === 'schedule' ? 'Schedule SMS Broadcast' : 'Confirm SMS Dispatch'}
              </h3>
              <p className="text-xs text-ink-muted">
                {dispatchMode === 'schedule'
                  ? 'Set exact day, hour, minute, and second for auto-dispatch'
                  : 'Review broadcast details before instant delivery'}
              </p>
            </div>
          </div>
          {!isSending && !isDone && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Success View */}
        {isDone ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-ink">
              {dispatchMode === 'schedule' ? 'Broadcast Scheduled!' : 'Broadcast Dispatched!'}
            </h4>
            <p className="text-xs text-ink-muted max-w-xs mx-auto">
              {dispatchMode === 'schedule' ? (
                <>
                  Message added to <strong>Scheduled Messages</strong> menu with status <strong>Pending</strong>. It will auto-dispatch at the exact second without consuming your real balance.
                </>
              ) : (
                <>
                  {selectedStudents.length} SMS message{selectedStudents.length === 1 ? '' : 's'} queued for instant background delivery.
                </>
              )}
            </p>
          </div>
        ) : (
          <>
            {/* Delivery Mode Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-2 rounded-xl border border-gray-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setDispatchMode('now')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  dispatchMode === 'now'
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Send Immediately</span>
              </button>
              <button
                type="button"
                onClick={() => setDispatchMode('schedule')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  dispatchMode === 'schedule'
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
                <span>Schedule for Later</span>
              </button>
            </div>

            {/* Zero-Cost Simulation Protection Banner */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11.5px]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>Zero-Cost Simulation Active:</strong> Outbound gateway dispatches are 100% simulated. Zero telco balance will be consumed.
              </span>
            </div>

            {/* Scheduled Date & Time Controls */}
            {dispatchMode === 'schedule' && (
              <div className="p-3.5 bg-surface-2 rounded-xl border border-amber-300 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Delivery Schedule (Day • Hour • Min • Sec)
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                    Status: Pending
                  </span>
                </div>

                {/* Day / Date Picker */}
                <div>
                  <label htmlFor="sched-date-input" className="text-[11px] font-medium text-ink-muted flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" />
                    Select Day / Date:
                  </label>
                  <input
                    id="sched-date-input"
                    type="date"
                    min={todayStr}
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full bg-surface border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-ink outline-none focus:border-amber-500 transition cursor-pointer"
                  />
                </div>

                {/* Hour, Min, Sec Selectors */}
                <div>
                  <span className="text-[11px] font-medium text-ink-muted flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" />
                    Exact Dispatch Time:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Hour */}
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-ink-faint block mb-0.5">Hour (0-23)</span>
                      <select
                        aria-label="Hour (0-23)"
                        value={schedHour}
                        onChange={(e) => setSchedHour(Number(e.target.value))}
                        className="w-full bg-surface border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-ink font-mono font-semibold outline-none cursor-pointer"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={i}>
                            {String(i).padStart(2, '0')}:00 {i >= 12 ? 'PM' : 'AM'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Minute */}
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-ink-faint block mb-0.5">Minute (0-59)</span>
                      <select
                        aria-label="Minute (0-59)"
                        value={schedMinute}
                        onChange={(e) => setSchedMinute(Number(e.target.value))}
                        className="w-full bg-surface border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-ink font-mono font-semibold outline-none cursor-pointer"
                      >
                        {Array.from({ length: 60 }).map((_, i) => (
                          <option key={i} value={i}>
                            {String(i).padStart(2, '0')} min
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Second */}
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-ink-faint block mb-0.5">Second (0-59)</span>
                      <select
                        aria-label="Second (0-59)"
                        value={schedSecond}
                        onChange={(e) => setSchedSecond(Number(e.target.value))}
                        className="w-full bg-surface border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-ink font-mono font-semibold outline-none cursor-pointer"
                      >
                        {Array.from({ length: 60 }).map((_, i) => (
                          <option key={i} value={i}>
                            {String(i).padStart(2, '0')} sec
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-faint block mb-1">
                    Quick Preset Increments:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPresetSeconds(15)}
                      className="px-2 py-0.5 text-[10.5px] font-medium rounded-md bg-surface border border-gray-200 dark:border-zinc-700 text-ink hover:border-amber-400 transition cursor-pointer"
                    >
                      +15 Sec (Instant Test)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetSeconds(60)}
                      className="px-2 py-0.5 text-[10.5px] font-medium rounded-md bg-surface border border-gray-200 dark:border-zinc-700 text-ink hover:border-amber-400 transition cursor-pointer"
                    >
                      +1 Min
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetSeconds(300)}
                      className="px-2 py-0.5 text-[10.5px] font-medium rounded-md bg-surface border border-gray-200 dark:border-zinc-700 text-ink hover:border-amber-400 transition cursor-pointer"
                    >
                      +5 Min
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetSeconds(3600)}
                      className="px-2 py-0.5 text-[10.5px] font-medium rounded-md bg-surface border border-gray-200 dark:border-zinc-700 text-ink hover:border-amber-400 transition cursor-pointer"
                    >
                      +1 Hour
                    </button>
                    <button
                      type="button"
                      onClick={applyTomorrowMorning}
                      className="px-2 py-0.5 text-[10.5px] font-medium rounded-md bg-surface border border-gray-200 dark:border-zinc-700 text-ink hover:border-amber-400 transition cursor-pointer"
                    >
                      Tomorrow 9 AM
                    </button>
                  </div>
                </div>

                {/* Live Delivery Timestamp & Countdown Preview */}
                <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                  isFuture
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase font-bold block opacity-75">
                      Exact Delivery Time:
                    </span>
                    <span className="font-semibold font-mono">
                      {targetDate ? targetDate.toLocaleString() : 'Invalid date'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold block opacity-75">
                      Countdown:
                    </span>
                    <span className="font-bold font-mono text-xs">
                      {isFuture ? formattedCountdown : 'Must be future time'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Target Summary */}
            <div className="p-3 bg-surface-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-ink-faint block mb-0.5">
                Alert Sent To:
              </span>
              <span className="font-semibold text-ink">
                {targetGroupSummary || 'SMS Broadcast'}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 p-3 bg-surface-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-center text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-faint block">Recipients</span>
                <span className="font-bold text-sm text-ink">{selectedStudents.length}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-faint block">Segments</span>
                <span className="font-bold text-sm text-ink">{metrics.messageCount ?? metrics.segments}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-faint block">Simulated Cost</span>
                <span className="font-bold text-sm text-[#1b1e42] dark:text-accent">0 Credits</span>
              </div>
            </div>

            {/* Message Preview */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint block mb-1">
                Message Preview:
              </span>
              <div className="p-3 bg-surface-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-ink whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto font-sans">
                {message}
              </div>
            </div>

            {/* Error Message */}
            {sendError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
                {sendError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-surface-2 hover:bg-surface-3 text-ink transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={
                  isSending ||
                  selectedStudents.length === 0 ||
                  (dispatchMode === 'schedule' && !isFuture)
                }
                className={`inline-flex items-center gap-2 px-6 py-2.5 font-semibold text-xs sm:text-sm rounded-full transition shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 text-white ${
                  dispatchMode === 'schedule'
                    ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600'
                    : 'bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover'
                }`}
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : dispatchMode === 'schedule' ? (
                  <CalendarClock className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {isSending
                    ? 'Processing...'
                    : dispatchMode === 'schedule'
                    ? `Schedule Broadcast (${selectedStudents.length} Selected)`
                    : `Confirm & Dispatch (${selectedStudents.length} Selected)`}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
