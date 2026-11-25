import React, { useState } from 'react';
import {
  Cake,
  Send,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  MessageSquare,
  Edit3
} from 'lucide-react';
import type { StudentBirthdayInfo } from '../types/birthday';
import confetti from 'canvas-confetti';

interface BirthdayCountdownCardProps {
  info: StudentBirthdayInfo;
  onSendWish: (info: StudentBirthdayInfo) => Promise<void>;
  onEditDob: (info: StudentBirthdayInfo) => void;
  onPreviewWish: (info: StudentBirthdayInfo) => void;
  isSending?: boolean;
}

export const BirthdayCountdownCard: React.FC<BirthdayCountdownCardProps> = ({
  info,
  onSendWish,
  onEditDob,
  onPreviewWish,
  isSending = false,
}) => {
  const { student, dob, daysUntil, hoursUntil, minutesUntil, secondsUntil, isToday, isWithinCountdownWindow, hasSentThisYear, turningAge, lastSentRecord, targetSendDateTime } = info;
  const [justTriggeredConfetti, setJustTriggeredConfetti] = useState(false);

  const handleConfetti = (e: React.MouseEvent) => {
    e.stopPropagation();
    setJustTriggeredConfetti(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => setJustTriggeredConfetti(false), 1200);
  };

  // Format DOB string nicely: e.g. "18 Nov 2017"
  const formatDobDisplay = (dobStr: string) => {
    try {
      const [y, m, d] = dobStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dobStr;
    }
  };

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isToday
          ? 'bg-gradient-to-br from-amber-500/10 via-pink-500/5 to-purple-500/10 dark:from-amber-950/30 dark:via-pink-950/20 dark:to-purple-950/30 border-amber-300 dark:border-amber-700/60 shadow-lg shadow-amber-500/5'
          : isWithinCountdownWindow
          ? 'bg-surface border-indigo-200 dark:border-indigo-900/50 shadow-sm hover:shadow-md'
          : 'bg-surface border-border-default/60 hover:border-border-default'
      }`}
    >
      {/* Top Festive Header Bar */}
      {isToday && (
        <div className="bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 text-white text-[11px] font-bold py-1 px-4 flex items-center justify-between tracking-wide uppercase shadow-inner">
          <span className="flex items-center gap-1.5 animate-pulse">
            <Cake className="w-3.5 h-3.5" />
            🎉 Celebrating Today! Turning {turningAge}
          </span>
          <button
            type="button"
            onClick={handleConfetti}
            className={`px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-[10px] font-semibold flex items-center gap-1 transition-transform ${
              justTriggeredConfetti ? 'scale-110' : ''
            }`}
            title="Throw celebration confetti!"
          >
            <Sparkles className="w-3 h-3 text-yellow-200" />
            Confetti
          </button>
        </div>
      )}

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        {/* Student Meta Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Student Avatar */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border shadow-2xs ${
                isToday
                  ? 'bg-gradient-to-br from-amber-400 to-rose-500 text-white border-amber-300 dark:border-amber-600'
                  : 'bg-surface-2 text-ink border-border-default'
              }`}
            >
              {isToday ? <Cake className="w-5 h-5" /> : <User className="w-5 h-5 text-ink-muted" />}
            </div>

            {/* Info */}
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-ink truncate leading-tight flex items-center gap-1.5">
                <span className="truncate">{student.name}</span>
              </h4>
              <p className="text-xs text-ink-muted mt-0.5">
                ID: <span className="font-mono font-medium text-ink">{student.id}</span>
                {student.roll && (
                  <span className="ml-2 font-mono">
                    Roll: <span className="font-semibold text-ink">{student.roll}</span>
                  </span>
                )}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-ink-faint">
                <span className="px-1.5 py-0.5 rounded bg-surface-2 font-medium text-ink-muted">
                  {student.className}
                </span>
                <span>&bull;</span>
                <span className="px-1.5 py-0.5 rounded bg-surface-2 font-medium text-ink-muted">
                  {student.section && student.section.trim() && student.section.trim() !== '-' ? student.section : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* DOB & Status Pill */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onEditDob(info)}
              className="text-[11px] font-mono text-ink-muted hover:text-primary flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors cursor-pointer border border-border-default/40"
              title="Click to edit date of birth or test with custom date"
            >
              <Calendar className="w-3 h-3 text-ink-faint" />
              <span>{formatDobDisplay(dob)}</span>
              <Edit3 className="w-2.5 h-2.5 ml-0.5 text-ink-faint" />
            </button>

            {hasSentThisYear ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Wish Sent
              </span>
            ) : isToday ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-spin" />
                Target Today
              </span>
            ) : isWithinCountdownWindow ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                Countdown T-{daysUntil}d
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-2 text-ink-faint">
                In {daysUntil} days
              </span>
            )}
          </div>
        </div>

        {/* Live Countdown Display Box */}
        <div className="bg-surface-2/60 dark:bg-surface-2/40 rounded-xl p-3 border border-border-default/50">
          <div className="flex items-center justify-between text-[11px] text-ink-muted mb-2 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-ink-faint" />
              {hasSentThisYear
                ? 'Delivered for ' + targetSendDateTime.getFullYear()
                : isToday
                ? 'Sending target: ' + targetSendDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : `Countdown to Birthday (${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} left)`}
            </span>
            <span className="text-[10.5px] font-mono text-ink-faint">
              {student.mobile ? student.mobile : 'No Mobile'}
            </span>
          </div>

          {hasSentThisYear ? (
            <div className="flex items-center gap-2 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="truncate">
                <span className="font-semibold">Birthday SMS Delivered</span>
                {lastSentRecord?.sentAt && (
                  <span className="ml-1 text-[11px] opacity-80">
                    &bull; {new Date(lastSentRecord.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {/* Days */}
              <div className="flex flex-col bg-surface rounded-lg py-1.5 border border-border-default/60 shadow-2xs">
                <span className="font-mono font-bold text-base text-ink leading-tight">
                  {String(daysUntil).padStart(2, '0')}
                </span>
                <span className="text-[9.5px] uppercase tracking-wider text-ink-faint font-semibold">
                  Days
                </span>
              </div>

              {/* Hours */}
              <div className="flex flex-col bg-surface rounded-lg py-1.5 border border-border-default/60 shadow-2xs">
                <span className="font-mono font-bold text-base text-ink leading-tight">
                  {String(hoursUntil).padStart(2, '0')}
                </span>
                <span className="text-[9.5px] uppercase tracking-wider text-ink-faint font-semibold">
                  Hours
                </span>
              </div>

              {/* Mins */}
              <div className="flex flex-col bg-surface rounded-lg py-1.5 border border-border-default/60 shadow-2xs">
                <span className="font-mono font-bold text-base text-ink leading-tight">
                  {String(minutesUntil).padStart(2, '0')}
                </span>
                <span className="text-[9.5px] uppercase tracking-wider text-ink-faint font-semibold">
                  Mins
                </span>
              </div>

              {/* Secs */}
              <div className="flex flex-col bg-surface rounded-lg py-1.5 border border-border-default/60 shadow-2xs">
                <span className="font-mono font-bold text-base text-ink leading-tight text-primary">
                  {String(secondsUntil).padStart(2, '0')}
                </span>
                <span className="text-[9.5px] uppercase tracking-wider text-ink-faint font-semibold">
                  Secs
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center gap-2 pt-1 border-t border-border-default/40">
          <button
            type="button"
            onClick={() => onPreviewWish(info)}
            className="flex-1 py-1.5 px-2.5 rounded-xl border border-border-default hover:bg-surface-2 text-ink-muted hover:text-ink text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Preview birthday greeting message"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => onSendWish(info)}
            disabled={isSending}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              hasSentThisYear
                ? 'bg-surface-2 hover:bg-surface-3 text-ink-muted border border-border-default'
                : isToday
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-amber-500/20'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
            title={hasSentThisYear ? 'Resend birthday wish SMS' : 'Dispatch birthday wish now'}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Sending...' : hasSentThisYear ? 'Resend' : 'Send Wish Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
