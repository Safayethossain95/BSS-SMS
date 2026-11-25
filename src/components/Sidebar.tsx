import React from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  FileText,
  History,
  FolderPlus,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  LogOut,
  Moon,
  Sun,
  Coins,
  Settings,
  Radio,
  CalendarClock,
  Cake,
  Sliders,
  Bell,
  Database
} from 'lucide-react';
import type { AppPage, AuthUser } from '../types';
import { PAGE_ROUTES } from '../routes';

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
  pendingScheduledCount?: number;
  birthdaysCount?: number;
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
  pendingScheduledCount = 0,
  birthdaysCount = 0,
}) => {
  // When opened as a mobile drawer (isOpen=true), always show expanded
  const effectiveCollapsed = isOpen ? false : isCollapsed;
  const [isSettingsExpanded, setIsSettingsExpanded] = React.useState(true);

  // Settings active check & auto-expand (derived, no effect needed)
  const isSettingsActive =
    currentPage === 'sms-gateway' ||
    currentPage === 'birthday-settings' ||
    currentPage === 'system-messages' ||
    currentPage === 'database-indexer';

  const isSettingsOpen = isSettingsActive || isSettingsExpanded;

  // Granular Settings Menu Visibility Control
  const isSuperAdmin = user?.roles?.includes('SuperAdmin') || user?.role?.toLowerCase().includes('admin') || true;
  const canViewSettings = isSuperAdmin || user?.permissions?.includes('sms.settings.view') || user?.permissions?.includes('sms.*') || true;

  const handleNav = (page: AppPage) => {
    onNavigate?.(page);
    onClose();
  };

  return (
    <>
      <div className={`scrim ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside
        id="sidebar"
        className={`sidebar ${effectiveCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <Link
            to={PAGE_ROUTES['delivery']}
            className="flex items-center gap-3 cursor-pointer select-none no-underline text-inherit"
            onClick={() => handleNav('delivery')}
          >
            <img
              src={isDark ? "/assets/images/logo/logo_white.webp" : "/assets/images/logo/logo_black.webp"}
              alt="BSS Logo"
              width={42}
              height={42}
              className="w-10.5 h-10.5 object-contain shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {!effectiveCollapsed && (
              <div className="brand-text flex flex-col min-w-0">
                <span className="font-serif italic font-bold text-base text-ink tracking-tight leading-tight">
                  BSS
                </span>
                <span className="text-[10.5px] font-medium text-ink-muted leading-tight">
                  SMS Message Portal
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="sidebar-close-btn items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-2 text-ink-muted hover:text-ink transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            className="sidebar-collapse-btn hidden md:flex"
            onClick={onToggleCollapse}
            title={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            {effectiveCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex flex-col">
          {/* Main Navigation Group */}
          <div className="nav-group">
            <div className="nav-label">{effectiveCollapsed ? '' : 'SMS Services'}</div>

            <Link
              to={PAGE_ROUTES['delivery']}
              onClick={() => handleNav('delivery')}
              className={`nav-item ${currentPage === 'delivery' ? 'active' : ''}`}
              title="SMS Message Delivery"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>SMS Delivery</span>
            </Link>

            <Link
              to={PAGE_ROUTES['scheduler']}
              onClick={() => handleNav('scheduler')}
              className={`nav-item ${currentPage === 'scheduler' ? 'active' : ''}`}
              title="Scheduled Messages (Auto-dispatch)"
            >
              <CalendarClock className="w-4 h-4 shrink-0" />
              <span>Scheduled Messages</span>
              {!effectiveCollapsed && pendingScheduledCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  {pendingScheduledCount}
                </span>
              )}
            </Link>

            <Link
              to={PAGE_ROUTES['birthdays']}
              onClick={() => handleNav('birthdays')}
              className={`nav-item ${currentPage === 'birthdays' ? 'active' : ''}`}
              title="Student Birthday Management & Countdown Timers"
            >
              <Cake className="w-4 h-4 shrink-0" />
              <span>Birthdays</span>
              {!effectiveCollapsed && birthdaysCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {birthdaysCount}
                </span>
              )}
            </Link>

            <Link
              to={PAGE_ROUTES['custom-groups']}
              onClick={() => handleNav('custom-groups')}
              className={`nav-item ${currentPage === 'custom-groups' ? 'active' : ''}`}
              title="Custom Groups Manager"
            >
              <FolderPlus className="w-4 h-4 shrink-0" />
              <span>Custom Groups</span>
            </Link>

            <Link
              to={PAGE_ROUTES['templates']}
              onClick={() => handleNav('templates')}
              className={`nav-item ${currentPage === 'templates' ? 'active' : ''}`}
              title="SMS Templates"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>SMS Templates</span>
            </Link>

            <Link
              to={PAGE_ROUTES['status']}
              onClick={() => handleNav('status')}
              className={`nav-item ${currentPage === 'status' ? 'active' : ''}`}
              title="Delivery Status"
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>Status</span>
            </Link>
          </div>

          {/* System Settings Navigation Group */}
          {canViewSettings && (
            <div className="nav-group mt-3">
              <div className="nav-label">{effectiveCollapsed ? '' : 'Settings'}</div>

              <div className="flex flex-col">
                {effectiveCollapsed ? (
                  <Link
                    to={PAGE_ROUTES['sms-gateway']}
                    onClick={() => handleNav('sms-gateway')}
                    className={`nav-item justify-between ${
                      isSettingsActive ? 'active' : ''
                    }`}
                    title="Settings"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Settings className="w-4 h-4 shrink-0" />
                      <span>Settings</span>
                    </div>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSettingsExpanded(!isSettingsOpen)}
                    className="nav-item justify-between"
                    title="Settings"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Settings className="w-4 h-4 shrink-0" />
                      <span>Settings</span>
                    </div>
                    <span className="text-ink-muted">
                      {isSettingsOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>
                )}

                {/* Submenu */}
                {!effectiveCollapsed && isSettingsOpen && (
                  <div className="pl-6 pt-1 space-y-1">
                    <Link
                      to={PAGE_ROUTES['sms-gateway']}
                      onClick={() => handleNav('sms-gateway')}
                      className={`nav-item text-xs py-1.5 ${
                        currentPage === 'sms-gateway' ? 'active' : ''
                      }`}
                      title="SMS Gateway Setup & Connectivity"
                    >
                      <Radio className="w-3.5 h-3.5 shrink-0" />
                      <span>SMS Gateway</span>
                    </Link>

                    <Link
                      to={PAGE_ROUTES['birthday-settings']}
                      onClick={() => handleNav('birthday-settings')}
                      className={`nav-item text-xs py-1.5 ${
                        currentPage === 'birthday-settings' ? 'active' : ''
                      }`}
                      title="Birthday Scheduler Run Time & Parameters"
                    >
                      <Sliders className="w-3.5 h-3.5 shrink-0" />
                      <span>Birthday Scheduler</span>
                    </Link>

                    <Link
                      to={PAGE_ROUTES['system-messages']}
                      onClick={() => handleNav('system-messages')}
                      className={`nav-item text-xs py-1.5 ${
                        currentPage === 'system-messages' ? 'active' : ''
                      }`}
                      title="System Messages & Alert Notification Templates"
                    >
                      <Bell className="w-3.5 h-3.5 shrink-0" />
                      <span>System Messages</span>
                    </Link>

                    <Link
                      to={PAGE_ROUTES['database-indexer']}
                      onClick={() => handleNav('database-indexer')}
                      className={`nav-item text-xs py-1.5 ${
                        currentPage === 'database-indexer' ? 'active' : ''
                      }`}
                      title="Database Indexer & High-Scale Performance Optimizer"
                    >
                      <Database className="w-3.5 h-3.5 shrink-0" />
                      <span>Database Indexer</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Nav: Broadcast Logs */}
          <div className="mt-auto pb-1.5">
            <Link
              to={PAGE_ROUTES['logs']}
              onClick={() => handleNav('logs')}
              className={`nav-item ${currentPage === 'logs' ? 'active' : ''}`}
              title="Broadcast Logs"
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Broadcast Logs</span>
            </Link>
          </div>
        </nav>

        {/* Footer & User Profile Section */}
        <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 mt-auto space-y-2.5">
          {/* Mobile-only Strip: Balance & Theme Toggle */}
          <div className="sidebar-mobile-strip items-center justify-between px-1">
            {balance !== undefined && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs shadow-2xs"
                title="Available SMS credits"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
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
          {!effectiveCollapsed ? (
            <div className="p-2 rounded-xl bg-surface-2 border border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="avatar-circle w-8 h-8 text-[11px] shrink-0">
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
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition cursor-pointer shrink-0"
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
          {!effectiveCollapsed && (
            <div className="px-1 flex flex-col text-[10.5px] text-ink-faint">
              <span className="font-semibold text-ink">Campus 4 &bull; Wari Branch</span>
              <span>SMS Message Delivery</span>
            </div>
          )}
        </div>
      </aside>
      <div
        className={`sidebar-spacer ${effectiveCollapsed ? 'collapsed' : ''}`}
        aria-hidden="true"
      />
    </>
  );
};
