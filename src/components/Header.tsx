import React from 'react';
import {
  Send,
  History,
  FileText,
  Plus,
  Coins
} from 'lucide-react';

interface HeaderProps {
  balance: number;
  onOpenHistory: () => void;
  onOpenTemplates: () => void;
  onOpenAddStudent: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  onOpenHistory,
  onOpenTemplates,
  onOpenAddStudent,
}) => {
  return (
    <header className="bg-[#fafafa] border-b border-gray-300 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">

          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1b1e42] flex items-center justify-center text-white shadow-xs">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 tracking-tight font-serif italic">
                  bona fide
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-300">
                  SMS System
                </span>
              </div>
            </div>
          </div>

          {/* Balance & Actions */}
          <div className="flex items-center gap-2.5">
            {/* SMS Balance */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-gray-700 font-medium">Balance:</span>
              <span className="text-amber-800 font-bold">
                {balance.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenTemplates}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 transition cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>Templates</span>
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 transition cursor-pointer shadow-2xs"
            >
              <History className="w-3.5 h-3.5 text-gray-500" />
              <span>Logs</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddStudent}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1b1e42] hover:bg-[#d91920] text-white transition cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
