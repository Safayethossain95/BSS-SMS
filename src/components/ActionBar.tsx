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
    <div className="card !p-4 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card flex flex-wrap items-center justify-between gap-3">

      {/* Left Action Buttons (Search, Reset, Test) */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onSearchClick}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-surface-2 hover:bg-surface-3 text-ink font-semibold text-xs sm:text-sm rounded-full border border-gray-200 dark:border-zinc-800 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <Search className="w-4 h-4 text-ink-muted" />
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={onResetClick}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-transparent hover:bg-surface-2 text-ink-muted hover:text-ink font-semibold text-xs sm:text-sm rounded-full transition-all cursor-pointer active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={onTestSendClick}
          disabled={isMessageEmpty}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-surface-2 hover:bg-surface-3 text-ink font-semibold text-xs sm:text-sm rounded-full border border-gray-200 dark:border-zinc-800 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-xs"
        >
          <Smartphone className="w-4 h-4 text-[#1b1e42] dark:text-accent" />
          <span>Test SMS</span>
        </button>
      </div>

      {/* Right Primary Send Button (#1b1e42 matching user screenshot) */}
      <div>
        <button
          type="button"
          onClick={onSendClick}
          disabled={!canSend}
          className={`inline-flex items-center gap-2 px-7 py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-[0.98] ${canSend
              ? 'bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white shadow-sm'
              : 'bg-surface-2 text-ink-faint border border-gray-200 dark:border-zinc-800 cursor-not-allowed'
            }`}
        >
          <SendHorizonal className="w-4 h-4 mt-2 md:mt-0" />
          <span>
            Send SMS ({totalRecipientsSelected} Selected &bull; {totalSmsCost} Credits)
          </span>
        </button>
      </div>

    </div>
  );
};
