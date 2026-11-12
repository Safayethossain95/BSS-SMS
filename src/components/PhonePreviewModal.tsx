import React from 'react';
import { X, Smartphone, Signal, Wifi, Battery } from 'lucide-react';

interface PhonePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  sampleStudentName?: string;
}

export const PhonePreviewModal: React.FC<PhonePreviewModalProps> = ({
  isOpen,
  onClose,
  message,
  sampleStudentName = 'Julaybib Muhammad',
}) => {
  if (!isOpen) return null;

  const renderedPreview = message
    .replace(/{StudentName}/g, sampleStudentName)
    .replace(/{StudentID}/g, '2606093807')
    .replace(/{Class}/g, 'Play Group')
    .replace(/{Section}/g, 'Starter')
    .replace(/{Roll}/g, '01');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative bg-surface border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
              <Smartphone className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Device Preview</h3>
              <p className="text-xs text-ink-muted">Preview rendered SMS notification</p>
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

        {/* Smartphone Shell */}
        <div className="mx-auto w-[270px] bg-slate-950 rounded-[38px] p-3 shadow-2xl border-4 border-slate-700">
          {/* Top Speaker / Camera */}
          <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-2.5 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-700 mr-2" />
            <div className="w-8 h-1 rounded-full bg-slate-700" />
          </div>

          {/* Screen */}
          <div className="bg-slate-100 dark:bg-zinc-900 rounded-[28px] p-3.5 min-h-[360px] flex flex-col justify-between text-slate-800 dark:text-zinc-100 font-sans">
            
            {/* Status bar */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium px-1">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-2.5 h-2.5" />
                <Wifi className="w-2.5 h-2.5" />
                <Battery className="w-3 h-3" />
              </div>
            </div>

            {/* Sender info */}
            <div className="text-center py-2 border-b border-slate-200 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-[#1b1e42] text-white flex items-center justify-center text-xs font-bold mx-auto mb-1 shadow-2xs">
                BSS
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Bona Fide School</div>
              <div className="text-[10px] text-slate-500">SMS Notification</div>
            </div>

            {/* Bubble */}
            <div className="my-auto py-2">
              <div className="bg-[#1b1e42] text-white p-3 rounded-2xl rounded-bl-xs text-xs shadow-xs leading-relaxed font-sans">
                {renderedPreview || <span className="italic opacity-60">No message written.</span>}
              </div>
              <div className="text-[9px] text-slate-400 mt-1 pl-1">Delivered &bull; Just now</div>
            </div>

            {/* Bottom Bar */}
            <div className="w-24 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mt-2" />
          </div>
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
