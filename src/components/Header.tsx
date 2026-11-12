import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Coins,
  History,
  Search,
  Sun,
  Moon,
  LogOut,
  ChevronDown
} from 'lucide-react';
import type { AuthUser, AppPage } from '../types';

interface HeaderProps {
  balance: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMenu: () => void;
  currentPage?: AppPage;
  onNavigate?: (page: AppPage) => void;
  user?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  isDark,
  onToggleTheme,
  onOpenMenu,
  currentPage = 'delivery',
  onNavigate,
  user,
  onLogout,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const pageTitles: Record<AppPage, string> = {
    'delivery': 'SMS Delivery System',
    'custom-groups': 'Custom Groups Manager',
    'templates': 'SMS Templates',
    'logs': 'Broadcast Delivery Logs',
    'students': 'Students Directory',
    'add-student': 'Add New Student',
  };
  const currentTitle = pageTitles[currentPage] || 'SMS Delivery System';

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);
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
            <span className="crumb-prefix font-medium">BSS</span>
            <span className="crumb-separator text-ink-faint">/</span>
            <span className="crumb-current font-semibold text-ink">{currentTitle}</span>
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
              if (currentPage !== 'students') {
                onNavigate?.('students');
              }
              setTimeout(() => {
                const el = document.getElementById('table-search-input');
                el?.focus();
              }, 50);
            }}
          />
        </div>

        {/* Right: Actions (Hidden on mobile, visible on desktop md+) */}
        <div className="tb-actions !hidden md:!flex">

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
            onClick={() => onNavigate?.('logs')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${currentPage === 'logs' ? 'bg-[#1b1e42] dark:bg-accent text-white font-semibold' : 'bg-surface-2 hover:bg-surface text-ink border border-gray-200 dark:border-zinc-800 font-medium'} text-xs transition cursor-pointer shadow-2xs`}
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

          {/* Avatar Chip with Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <div
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="avatar-chip hidden md:flex select-none items-center gap-2 p-1 -mr-1.5 rounded-xl hover:bg-surface-2 transition cursor-pointer text-left border border-transparent hover:border-gray-200 dark:hover:border-zinc-800"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
              title="Click to view account options"
            >
              <div className="avatar-circle">
                {user?.initials || 'AD'}
              </div>
              <div>
                <div className="avatar-name">{user?.name || 'Administrator'}</div>
                <div className="avatar-role">{user?.role || 'Campus 4 • Admin'}</div>
              </div>
              <ChevronDown className={`w-3 h-3 text-ink-faint transition-transform duration-200 ml-0.5 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 flex items-center gap-2.5">
                  <div className="avatar-circle w-8 h-8 text-[11px]">
                    {user?.initials || 'AD'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-ink truncate leading-tight">
                      {user?.name || 'Administrator'}
                    </div>
                    <div className="text-[10.5px] text-ink-faint truncate leading-tight mt-0.5">
                      @{user?.username || 'admin'} &bull; {user?.campus || 'Campus 4'}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 dark:border-zinc-800 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
