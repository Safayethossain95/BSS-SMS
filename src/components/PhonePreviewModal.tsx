import React from 'react';
import { X, Wifi, Battery, Signal, CheckCheck } from 'lucide-react';

interface PhonePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  senderId?: string;
  sampleStudentName?: string;
}

export const PhonePreviewModal: React.FC<PhonePreviewModalProps> = ({
  isOpen,
  onClose,
  message,
  senderId = 'BONA_FIDE',
  sampleStudentName = 'Julaybib Muhammad',
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderedMessage = message
    ? message
        .replace(/{StudentName}/g, sampleStudentName)
        .replace(/{StudentID}/g, '2606093807')
        .replace(/{Class}/g, 'Play Group')
        .replace(/{Section}/g, 'Starter')
        .replace(/{Roll}/g, '01')
    : 'No message written yet.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="relative bg-slate-100 border border-slate-300 rounded-2xl p-5 max-w-sm w-full shadow-xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Mobile SMS Preview
        </h3>

        {/* Clean Smartphone Mockup */}
        <div className="w-[280px] h-[520px] bg-slate-900 rounded-[36px] p-2.5 shadow-lg border-2 border-slate-300 relative flex flex-col">
          {/* Notch */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-full z-10" />

          {/* Screen Content */}
          <div className="w-full h-full bg-slate-50 rounded-[28px] overflow-hidden flex flex-col pt-5 pb-3">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-1 text-[10px] text-slate-600 font-medium">
              <span>{timeString}</span>
              <div className="flex items-center gap-1">
                <Signal className="w-2.5 h-2.5" />
                <Wifi className="w-2.5 h-2.5" />
                <Battery className="w-3 h-3" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center py-2 border-b border-slate-200 bg-white">
              <div className="text-xs font-semibold text-slate-900">{senderId}</div>
              <div className="text-[10px] text-slate-400">Verified Sender</div>
            </div>

            {/* Message Bubble Area */}
            <div className="flex-1 p-3 flex flex-col justify-end space-y-1.5 overflow-y-auto">
              <div className="self-start max-w-[85%] bg-indigo-600 text-white rounded-2xl rounded-bl-xs p-3 text-xs shadow-xs space-y-1">
                <div className="whitespace-pre-wrap leading-relaxed">{renderedMessage}</div>
                <div className="flex items-center justify-end gap-1 text-[9px] text-indigo-200">
                  <span>{timeString}</span>
                  <CheckCheck className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>

            {/* Home indicator */}
            <div className="w-20 h-1 bg-slate-300 rounded-full mx-auto mt-2" />
          </div>
        </div>

      </div>
    </div>
  );
};
