import React from 'react';
import {
  Menu,
  Coins,
  FileText,
  History,
  FolderPlus,
  Plus,
  Search,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  balance: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMenu: () => void;
  onOpenHistory: () => void;
  onOpenTemplates: () => void;
  onOpenAddStudent: () => void;
  onOpenCustomGroups: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  isDark,
  onToggleTheme,
  onOpenMenu,
  onOpenHistory,
  onOpenTemplates,
  onOpenAddStudent,
  onOpenCustomGroups,
}) => {
  return (
    <header className="topbar">
      <div className="topbar-inner flex items-center justify-between w-full">

        {/* Left: Hamburger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="menu-btn"
            onClick={onOpenMenu}
            aria-label="Open mobile navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="crumb select-none">
            <span className="crumb-prefix font-medium">British Standard</span>
            <span className="crumb-separator text-ink-faint">/</span>
            <span className="crumb-current font-semibold text-ink">SMS Delivery System</span>
          </div>
        </div>

        {/* Center: Search pill */}
        <div className="tb-search" role="search">
          <Search className="w-3.5 h-3.5 flex-shrink-0 text-ink-faint" />
          <input
            type="text"
            placeholder="Search students..."
            className="tb-search-input"
            onFocus={() => {
              const el = document.getElementById('table-search-input');
              el?.focus();
            }}
          />
        </div>

        {/* Right: Actions */}
        <div className="tb-actions">

          {/* SMS Balance Pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs shadow-2xs"
            title="Available SMS credits"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-ink-muted hidden sm:inline text-[11px] font-medium">Balance:</span>
            <span className="text-amber-800 dark:text-amber-300 font-bold font-mono text-xs">
              {balance.toLocaleString()}
            </span>
          </div>

          {/* Logs Shortcut */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface text-ink text-xs font-medium border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs"
            title="View Delivery Logs"
          >
            <History className="w-3.5 h-3.5 text-ink-muted" />
            <span>Logs</span>
          </button>

          {/* Theme Toggle Switch */}
          <button
            type="button"
            className={`theme-toggle ${isDark ? 'active' : ''}`}
            onClick={onToggleTheme}
            aria-label="Toggle dark / light theme"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="theme-knob">
              {isDark ? (
                <Moon className="w-3 h-3 text-white" />
              ) : (
                <Sun className="w-3 h-3 text-white" />
              )}
            </div>
          </button>

          {/* Avatar Chip */}
          <div className="avatar-chip hidden md:flex select-none">
            <div className="avatar-circle">
              AD
            </div>
            <div>
              <div className="avatar-name">Administrator</div>
              <div className="avatar-role">Campus 4 &bull; Admin</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
