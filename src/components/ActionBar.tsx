import React from 'react';
import {
  RotateCcw,
  Search,
  SendHorizonal,
  Smartphone
} from 'lucide-react';

interface ActionBarProps {
  onSearchClick: () => void;
  onResetClick: () => void;
  onSendClick: () => void;
  onTestSendClick: () => void;
  totalRecipientsSelected: number;
  isMessageEmpty: boolean;
  totalSmsCost: number;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onSearchClick,
  onResetClick,
  onSendClick,
  onTestSendClick,
  totalRecipientsSelected,
  isMessageEmpty,
  totalSmsCost,
}) => {
  const canSend = totalRecipientsSelected > 0 && !isMessageEmpty;

  return (
    <div className="bg-[#fafafa] border border-gray-300 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">

      {/* Left Action Buttons (Search, Reset, Test) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSearchClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1b1e42] hover:bg-[#d91920] text-white font-medium text-xs rounded-lg transition cursor-pointer shadow-xs active:scale-95"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={onResetClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 font-medium text-xs rounded-lg border border-gray-300 transition cursor-pointer active:scale-95 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={onTestSendClick}
          disabled={isMessageEmpty}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-[#1b1e42] font-medium text-xs rounded-lg border border-red-300 transition cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Test SMS</span>
        </button>
      </div>

      {/* Right Primary Send Button (#1b1e42) */}
      <div>
        <button
          type="button"
          onClick={onSendClick}
          disabled={!canSend}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-xs transition cursor-pointer active:scale-95 ${canSend
              ? 'bg-[#1b1e42] hover:bg-[#d91920] text-white shadow-xs'
              : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
            }`}
        >
          <SendHorizonal className="w-3.5 h-3.5" />
          <span>Send SMS ({totalRecipientsSelected} Selected &bull; {totalSmsCost} Credits)</span>
        </button>
      </div>

    </div>
  );
};
