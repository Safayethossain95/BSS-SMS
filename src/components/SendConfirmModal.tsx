import React, { useState } from 'react';
import {
  X,
  SendHorizonal,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SmsMetrics, Student } from '../types';

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
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleConfirmSend = () => {
    setIsSending(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setProgress(100);
            setIsSending(false);
            setIsDone(true);
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
            onSendSuccess(selectedStudents, message);
          }, 350);
          return 90;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleFinish = () => {
    setIsDone(false);
    setProgress(0);
    setIsSending(false);
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
            {isDone ? 'SMS Sent Successfully' : 'Confirm SMS Broadcast'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDone
              ? 'Your messages have been delivered to telco gateways.'
              : 'Please review before sending.'}
          </p>
        </div>

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

            {/* Progress Bar during sending */}
            {isSending && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1b1e42]" />
                    Transmitting...
                  </span>
                  <span className="font-semibold text-[#1b1e42]">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-[#1b1e42] transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
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

        {isDone && (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#1b1e42] mx-auto" />
            <p className="text-xs text-slate-600">
              Dispatched to {selectedStudents.length} student guardians.
            </p>
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2 rounded-lg bg-[#1b1e42] hover:bg-[#d91920] text-white text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
