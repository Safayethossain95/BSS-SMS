import React, { useState } from 'react';
import {
  X,
  SendHorizonal,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SmsMetrics, Student } from '../types';
import type { BroadcastSubmissionResult } from '../types/api';
import { smsService } from '../services/smsService';

interface SendConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  selectedStudents: Student[];
  metrics: SmsMetrics;
  onSendSuccess: (recipients: Student[], smsMessage: string) => void;
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
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BroadcastSubmissionResult | null>(null);

  if (!isOpen) return null;

  const handleConfirmSend = async () => {
    setIsSending(true);
    setError(null);

    try {
      const response = await smsService.sendBroadcast({
        templateText: message,
        recipients: selectedStudents,
      });

      setResult(response);
      setIsDone(true);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onSendSuccess(selectedStudents, message);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to enqueue broadcast job.';
      setError(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleFinish = () => {
    setIsDone(false);
    setIsSending(false);
    setError(null);
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="relative bg-slate-100 border border-slate-300 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {!isSending && (
          <button
            type="button"
            onClick={handleFinish}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div>
          <h3 className="text-base font-bold text-slate-900">
            {isDone ? 'Broadcast Accepted for Dispatch' : 'Confirm SMS Broadcast'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDone
              ? 'Job queued in background Channel Queue for high-speed delivery.'
              : 'Please review before enqueueing broadcast.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!isDone && (
          <>
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-slate-300 shadow-2xs">
                <span className="text-[10px] text-slate-500 block uppercase">Recipients</span>
                <span className="text-sm font-bold text-slate-800">{selectedStudents.length}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-300 shadow-2xs">
                <span className="text-[10px] text-slate-500 block uppercase">Per Person</span>
                <span className="text-sm font-bold text-[#1b1e42]">{metrics.segments} SMS</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-300 shadow-2xs">
                <span className="text-[10px] text-slate-500 block uppercase">Total Credits</span>
                <span className="text-sm font-bold text-slate-800">{metrics.totalSmsCost}</span>
              </div>
            </div>

            {/* Message Preview */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">Message:</span>
              <div className="bg-white p-3 rounded-lg border border-slate-300 text-xs text-slate-700 font-mono max-h-28 overflow-y-auto whitespace-pre-wrap shadow-2xs">
                {message}
              </div>
            </div>

            {/* Progress / Spinner during sending */}
            {isSending && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-700 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1b1e42]" />
                  <span>Enqueuing into Channel Queue...</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            {!isSending && (
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSend}
                  className="px-5 py-2 rounded-lg bg-[#1b1e42] hover:bg-[#d91920] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <SendHorizonal className="w-3.5 h-3.5" />
                  <span>Send Now</span>
                </button>
              </div>
            )}
          </>
        )}

        {isDone && result && (
          <div className="text-center py-3 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Job ID:</span>
                <span className="font-mono font-bold text-slate-800">{result.jobId}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Recipients:</span>
                <span className="font-bold text-slate-800">{result.totalRecipients}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dispatch Mode:</span>
                <span className="font-semibold text-emerald-700">
                  {result.isPersonalized ? 'Personalized Multi-Threaded' : `Bulk Batched (${result.batchCount} batches)`}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safety Guard Active: Only 01670319232 receives SMS</span>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2 rounded-lg bg-[#1b1e42] hover:bg-[#d91920] text-white text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
