import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { smsService } from '../services/smsService';
import { formatPhoneNumber } from '../utils/smsCalculator';

interface TestSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export const TestSmsModal: React.FC<TestSmsModalProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('01670319232');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');
    setError(null);

    try {
      await smsService.sendTestSms({
        phoneNumber: phoneNumber.trim(),
        message: message.trim(),
      });

      setStatus('sent');
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to deliver test SMS.';
      setError(errMsg);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="relative bg-slate-100 border border-slate-300 rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-slate-900">Send Test SMS</h3>

        {/* Safety Guard Notice */}
        <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Safety Guard Active: In test mode, SMS is <strong>STRICTLY intercepted to 01670319232</strong>.
          </span>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {status === 'sent' ? (
          <div className="py-6 text-center space-y-1.5">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Test SMS Sent Safely!</h4>
            <p className="text-xs text-slate-500 font-mono">Dispatched to: {formatPhoneNumber(phoneNumber)}</p>
          </div>
        ) : (
          <form onSubmit={handleSendTest} className="space-y-3">
            <div>
              <label htmlFor="test-phone-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Recipient Number:
              </label>
              <input
                id="test-phone-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#1b1e42]"
                required
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">Message Body:</span>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono max-h-24 overflow-y-auto whitespace-pre-wrap">
                {message || 'No message provided.'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'sending' || !message.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#1b1e42] hover:bg-[#d91920] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Send Test</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
