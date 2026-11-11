import React, { useState } from 'react';
import { X, Send, Smartphone, CheckCircle2 } from 'lucide-react';

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
  const [phoneNumber, setPhoneNumber] = useState('8801700000000');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative bg-surface border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
              <Smartphone className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Send Test SMS</h3>
              <p className="text-xs text-ink-muted">Deliver a test broadcast to verify format</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-ink">Test SMS Delivered!</h4>
            <p className="text-xs text-ink-muted">Successfully transmitted to {phoneNumber}.</p>
          </div>
        ) : (
          <form onSubmit={handleSendTest} className="space-y-3.5">
            <div>
              <label htmlFor="test-phone-input" className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Destination Phone Number:
              </label>
              <input
                id="test-phone-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 88017XXXXXXXX"
                className="w-full bg-surface-2 border border-transparent focus:border-[#1b1e42] dark:focus:border-accent font-mono text-xs sm:text-sm text-ink rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Live Body:
              </label>
              <div className="p-3 bg-surface-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-ink max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans">
                {message || <span className="italic text-ink-faint">No message text composed.</span>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-surface-2 hover:bg-surface-3 text-ink transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send Test</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
