import React from 'react';
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  History,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenTemplates: () => void;
  onOpenHistory: () => void;
  onOpenAddStudent: () => void;
  onOpenCustomGroups: () => void;
  activeTab?: string;
  isDark?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  onOpenTemplates,
  onOpenHistory,
  onOpenAddStudent,
  onOpenCustomGroups,
  isDark = false,
}) => {
  return (
    <>
      <div className={`scrim ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside
        id="sidebar"
        className={`sidebar relative ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="flex items-center gap-3 cursor-pointer select-none">
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
            className="sidebar-collapse-btn hidden md:flex"
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
              className="nav-item active"
              title="SMS Message Delivery"
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              <span>SMS Delivery</span>
            </button>

            <button
              type="button"
              onClick={onOpenCustomGroups}
              className="nav-item"
              title="Custom Groups Manager"
            >
              <FolderPlus className="w-4 h-4 flex-shrink-0" />
              <span>Custom Groups</span>
            </button>

            <button
              type="button"
              onClick={onOpenTemplates}
              className="nav-item"
              title="SMS Templates"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span>SMS Templates</span>
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className="nav-item"
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
              onClick={() => {
                const table = document.getElementById('students-table-section');
                table?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="nav-item"
              title="Students Directory"
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>Students Table</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddStudent}
              className="nav-item"
              title="Add New Student"
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Add Student</span>
            </button>
          </div>
        </nav>

        {/* Footer info in sidebar */}
        {!isCollapsed && (
          <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 mt-auto flex flex-col text-[11px] text-ink-faint">
            <span className="font-semibold text-ink">Campus 4 &bull; Wari Branch</span>
            <span>SMS Message Delivery</span>
          </div>
        )}
      </aside>
    </>
  );
};

