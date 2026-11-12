import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Student, SmsMetrics } from '../types';

interface SendConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  selectedStudents: Student[];
  metrics: SmsMetrics;
  onSendSuccess: (recipients: Student[], message: string) => void;
}

export const SendConfirmModal: React.FC<SendConfirmModalProps> = ({
  isOpen,
  onClose,
  message,
  selectedStudents,
  metrics,
  onSendSuccess,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleConfirmSend = () => {
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setIsDone(true);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onSendSuccess(selectedStudents, message);

      setTimeout(() => {
        setIsDone(false);
        onClose();
      }, 1400);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative bg-surface border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
              <Send className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Confirm SMS Dispatch</h3>
              <p className="text-xs text-ink-muted">Review broadcast details before sending</p>
            </div>
          </div>
          {!isSending && !isDone && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isDone ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-ink">Broadcast Dispatched!</h4>
            <p className="text-xs text-ink-muted">
              {selectedStudents.length} SMS message{selectedStudents.length === 1 ? '' : 's'} queued for instant delivery.
            </p>
          </div>
        ) : (
          <>
            {/* Warning strip */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                You are about to broadcast this SMS to <strong>{selectedStudents.length}</strong> recipients.
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 p-3 bg-surface-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-center text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-faint block">Recipients</span>
                <span className="font-bold text-sm text-ink">{selectedStudents.length}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-faint block">Segments / SMS</span>
                <span className="font-bold text-sm text-ink">{metrics.segments}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-faint block">Total Cost</span>
                <span className="font-bold text-sm text-[#1b1e42] dark:text-accent">{metrics.totalSmsCost} Credits</span>
              </div>
            </div>

            {/* Message Preview */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint block mb-1">
                Message Preview:
              </span>
              <div className="p-3 bg-surface-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-ink whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto font-sans">
                {message}
              </div>
            </div>

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
                disabled={isSending || selectedStudents.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Confirm &amp; Send</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
