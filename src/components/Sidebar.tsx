import React from 'react';
import {
  UserPlus,
  Send,
  Users,
  FileText,
  History,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Moon,
  Sun,
  Coins
} from 'lucide-react';
import type { AppPage, AuthUser } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
  balance?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  currentPage,
  onNavigate,
  isDark = false,
  onToggleTheme,
  user,
  onLogout,
  balance,
}) => {
  const handleNav = (page: AppPage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      <div className={`scrim ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside
        id="sidebar"
        className={`sidebar relative ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleNav('delivery')}
          >
            <img
              src={isDark ? "/assets/images/logo/logo_white.webp" : "/assets/images/logo/logo_black.webp"}
              alt="BSS Logo"
              width={42}
              height={42}
              className="w-[42px] h-[42px] object-contain flex-shrink-0"
              onError={(e) => {
                // Fallback text icon if image fails
                e.currentTarget.style.display = 'none';
              }}
            />
            {!isCollapsed && (
              <div className="brand-text flex flex-col min-w-0">
                <span className="font-serif italic font-bold text-base text-ink tracking-tight leading-tight">
                  BSS
                </span>
                <span className="text-[10.5px] font-medium text-ink-muted leading-tight">
                  SMS Message Portal
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-2 text-ink-muted hover:text-ink transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            className="sidebar-collapse-btn !hidden md:!flex"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Main Navigation Group */}
          <div className="nav-group">
            <div className="nav-label">{isCollapsed ? '' : 'SMS Services'}</div>

            <button
              type="button"
              onClick={() => handleNav('delivery')}
              className={`nav-item ${currentPage === 'delivery' ? 'active' : ''}`}
              title="SMS Message Delivery"
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              <span>SMS Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('custom-groups')}
              className={`nav-item ${currentPage === 'custom-groups' ? 'active' : ''}`}
              title="Custom Groups Manager"
            >
              <FolderPlus className="w-4 h-4 flex-shrink-0" />
              <span>Custom Groups</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('templates')}
              className={`nav-item ${currentPage === 'templates' ? 'active' : ''}`}
              title="SMS Templates"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span>SMS Templates</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('logs')}
              className={`nav-item ${currentPage === 'logs' ? 'active' : ''}`}
              title="Broadcast Logs"
            >
              <History className="w-4 h-4 flex-shrink-0" />
              <span>Broadcast Logs</span>
            </button>
          </div>

          {/* Directory & Quick Actions */}
          <div className="nav-group">
            <div className="nav-label">{isCollapsed ? '' : 'Directory & Tools'}</div>

            <button
              type="button"
              onClick={() => handleNav('students')}
              className={`nav-item ${currentPage === 'students' ? 'active' : ''}`}
              title="Students Directory"
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>Students Table</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('add-student')}
              className={`nav-item ${currentPage === 'add-student' ? 'active' : ''}`}
              title="Add New Student"
            >
              <UserPlus className="w-4 h-4 flex-shrink-0" />
              <span>Add Student</span>
            </button>
          </div>
        </nav>

        {/* Footer & User Profile Section */}
        <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 mt-auto space-y-2.5">
          {/* Mobile-only Strip: Balance & Theme Toggle (hidden on md+) */}
          <div className="md:hidden flex items-center justify-between px-1">
            {balance !== undefined && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs shadow-2xs"
                title="Available SMS credits"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-ink-muted text-[11px] font-medium">Balance:</span>
                <span className="text-amber-800 dark:text-amber-300 font-bold font-mono text-xs">
                  {balance.toLocaleString()}
                </span>
              </div>
            )}

            {onToggleTheme && (
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
            )}
          </div>

          {/* User Account / Login & Logout Info */}
          {!isCollapsed ? (
            <div className="p-2 rounded-xl bg-surface-2 border border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="avatar-circle w-8 h-8 text-[11px] flex-shrink-0">
                  {user?.initials || 'AD'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-ink truncate leading-tight">
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-ink-muted truncate leading-tight mt-0.5">
                    {user?.role || 'Campus 4 • Admin'}
                  </div>
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition cursor-pointer flex-shrink-0"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="avatar-circle w-8 h-8 text-[11px]" title={user?.name || 'Administrator'}>
                {user?.initials || 'AD'}
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-surface-2 rounded-lg transition cursor-pointer"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Branch Sub-footer */}
          {!isCollapsed && (
            <div className="px-1 flex flex-col text-[10.5px] text-ink-faint">
              <span className="font-semibold text-ink">Campus 4 &bull; Wari Branch</span>
              <span>SMS Message Delivery</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

