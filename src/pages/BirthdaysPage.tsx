import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Cake,
  Calendar,
  Clock,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  Plus,
  History,
  Grid,
  List,
  ChevronRight,
  X,
  Eye,
  Sliders
} from 'lucide-react';
import type { AppPage, ClassInfo, Student } from '../types';
import type {
  BirthdaySchedulerSettings,
  BirthdayWishRecord,
  StudentBirthdayInfo,
} from '../types/birthday';
import { birthdayService } from '../services/birthdayService';
import { BirthdayCountdownCard } from '../components/BirthdayCountdownCard';
import { toast } from '../services/toastService';

interface BirthdaysPageProps {
  classes: ClassInfo[];
  onNavigate: (page: AppPage) => void;
  onRefreshBalance?: () => void;
}

export const BirthdaysPage: React.FC<BirthdaysPageProps> = ({
  classes,
  onNavigate,
  onRefreshBalance,
}) => {
  // Current ticking time (updates every second for real-time countdown)
  const [now, setNow] = useState<Date>(() => new Date());

  // Settings & Data States
  const [settings, setSettings] = useState<BirthdaySchedulerSettings>(() =>
    birthdayService.getSettings()
  );
  const [wishHistory, setWishHistory] = useState<BirthdayWishRecord[]>(() =>
    birthdayService.getWishRecords()
  );

  // Recalculate countdowns purely when 'now' ticks
  const allInfos = useMemo(() => birthdayService.getAllBirthdayInfos(now), [now]);

  // UI States
  const [activeTab, setActiveTab] = useState<'upcoming' | 'today' | 'all' | 'history'>('upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [isExecutingScheduler, setIsExecutingScheduler] = useState<boolean>(false);
  const [sendingStudentId, setSendingStudentId] = useState<string | null>(null);

  // Modals
  const [editingInfo, setEditingInfo] = useState<StudentBirthdayInfo | null>(null);
  const [newDobValue, setNewDobValue] = useState<string>('');
  const [previewInfo, setPreviewInfo] = useState<StudentBirthdayInfo | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);

  // New Student Form State
  const [newStudentForm, setNewStudentForm] = useState<{
    id: string;
    name: string;
    mobile: string;
    className: string;
    section: string;
    roll: string;
    dob: string;
  }>({
    id: '',
    name: '',
    mobile: '',
    className: 'Play Group',
    section: 'Starter',
    roll: '01',
    dob: '2018-01-01',
  });

  // Tick clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Refresh data from service
  const refreshData = useCallback(() => {
    setSettings(birthdayService.getSettings());
    setWishHistory(birthdayService.getWishRecords());
  }, []);

  // Listen to custom dispatch events from service
  useEffect(() => {
    const handleDispatched = (e: Event) => {
      const customEvent = e as CustomEvent<{ record: BirthdayWishRecord; student: Student }>;
      if (customEvent.detail) {
        toast.showKey('SUCCESS_BIRTHDAY_WISH_SENT', {
          StudentName: customEvent.detail.student.name,
        });
        refreshData();
        if (onRefreshBalance) onRefreshBalance();
      }
    };

    window.addEventListener('bss_birthday_wish_dispatched', handleDispatched);
    return () => window.removeEventListener('bss_birthday_wish_dispatched', handleDispatched);
  }, [refreshData, onRefreshBalance]);

  // Counts for Badges
  const stats = useMemo(() => {
    const todayCount = allInfos.filter((i) => i.isToday).length;
    const upcomingCount = allInfos.filter((i) => i.isWithinCountdownWindow && !i.isToday).length;
    const sentCount = wishHistory.filter((r) => r.year === now.getFullYear()).length;
    const totalCount = allInfos.length;
    return { todayCount, upcomingCount, sentCount, totalCount };
  }, [allInfos, wishHistory, now]);

  // Filtered Students List
  const filteredList = useMemo(() => {
    let result = [...allInfos];

    // Tab filter
    if (activeTab === 'today') {
      result = result.filter((i) => i.isToday);
    } else if (activeTab === 'upcoming') {
      // Within countdown lookahead window (n)
      result = result.filter((i) => i.isWithinCountdownWindow);
    }

    // Class filter
    if (selectedClassId !== 'all') {
      result = result.filter(
        (i) => i.student.className.toLowerCase() === selectedClassId.toLowerCase()
      );
    }

    // Section filter
    if (selectedSectionId !== 'all') {
      result = result.filter(
        (i) => i.student.section.toLowerCase() === selectedSectionId.toLowerCase()
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.student.name.toLowerCase().includes(q) ||
          i.student.id.includes(q) ||
          i.student.mobile.includes(q) ||
          (i.student.roll && i.student.roll.includes(q))
      );
    }

    return result;
  }, [allInfos, activeTab, selectedClassId, selectedSectionId, searchQuery]);

  // Execute Scheduler check now
  const handleRunSchedulerNow = async () => {
    setIsExecutingScheduler(true);
    try {
      const result = await birthdayService.checkAndExecuteScheduler(new Date());
      refreshData();
      if (onRefreshBalance) onRefreshBalance();

      if (result.dispatchedCount > 0) {
        toast.showKey('SUCCESS_AUTO_WISH_BATCH', { Count: result.dispatchedCount });
      } else {
        toast.showKey('INFO_SCHEDULER_NO_DUE');
      }
    } catch (err: unknown) {
      console.error('Failed to run birthday scheduler:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.showKey('ERR_SCHEDULER_EXECUTION', { Details: msg });
    } finally {
      setIsExecutingScheduler(false);
    }
  };

  // Immediate Send Birthday Wish
  const handleSendWish = async (info: StudentBirthdayInfo) => {
    setSendingStudentId(info.student.id);
    try {
      await birthdayService.sendWish(info.student, undefined, 'manual');
      refreshData();
      if (onRefreshBalance) onRefreshBalance();
      toast.showKey('SUCCESS_BIRTHDAY_WISH_SENT', { StudentName: info.student.name });
    } catch (err: unknown) {
      console.error('Failed to send wish:', err);
      const msg = err instanceof Error ? err.message : 'Gateway error';
      toast.showKey('ERR_BIRTHDAY_WISH_FAILED', { StudentName: info.student.name, Details: msg });
    } finally {
      setSendingStudentId(null);
    }
  };

  // Save DOB Edit
  const handleSaveDob = () => {
    if (!editingInfo || !newDobValue) return;
    birthdayService.updateStudentDob(editingInfo.student.id, newDobValue);
    setEditingInfo(null);
    refreshData();
    toast.showKey('SUCCESS_STUDENT_DOB_UPDATED', { StudentName: editingInfo.student.name });
  };

  // Quick Test DOB Presets for easy verification
  const handleQuickPresetDob = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setNewDobValue(`2017-${mm}-${dd}`);
  };

  // Add New Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name.trim() || !newStudentForm.mobile.trim()) {
      toast.warning('WARN_NO_STUDENT_DOB', { StudentName: newStudentForm.name || 'Student' });
      return;
    }

    const newStudent: Student = {
      headerId: String(Math.floor(20000 + Math.random() * 80000)),
      id: newStudentForm.id || `260${Date.now().toString().slice(-7)}`,
      name: newStudentForm.name.trim().toUpperCase(),
      mobile: newStudentForm.mobile.trim(),
      className: newStudentForm.className,
      section: newStudentForm.section,
      roll: newStudentForm.roll || '01',
      status: 'active',
      dob: newStudentForm.dob,
    };

    birthdayService.addStudent(newStudent);
    setIsAddStudentOpen(false);
    refreshData();
    toast.showKey('SUCCESS_STUDENT_DOB_UPDATED', { StudentName: newStudent.name });
  };

  // Reset sent records for testing
  const handleResetRecords = () => {
    if (window.confirm('Reset all sent birthday wish records for testing? This will re-enable all countdowns.')) {
      birthdayService.resetWishRecords();
      refreshData();
      toast.showKey('SUCCESS_SETTINGS_SAVED');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero / Header Card */}
      <div className="rounded-2xl p-5 sm:p-6 bg-surface border border-border-default shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
            <Cake className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-ink tracking-tight">
                Student Birthday Management &amp; Scheduler
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0">
                {settings.isAutoSendEnabled ? 'Auto-Dispatch ON' : 'Manual Mode'}
              </span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Automated scheduler runs every <strong className="text-ink">{settings.schedulerIntervalDays} day(s)</strong>.
              Countdown activates <strong className="text-ink">{settings.lookaheadDays} days</strong> prior, with exact wishing at{' '}
              <strong className="text-ink font-mono">{settings.exactWishTime}</strong>.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRunSchedulerNow}
            disabled={isExecutingScheduler}
            className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink text-xs font-semibold border border-border-default flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Execute scheduler check immediately"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-primary ${isExecutingScheduler ? 'animate-spin' : ''}`}
            />
            <span>{isExecutingScheduler ? 'Checking...' : 'Run Scheduler Now'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('birthday-settings')}
            className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink text-xs font-semibold border border-border-default flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Configure Birthday Scheduler"
          >
            <Sliders className="w-3.5 h-3.5 text-ink-muted" />
            <span>Scheduler Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddStudentOpen(true)}
            className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Birthday</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Celebrating Today */}
        <div
          onClick={() => setActiveTab('today')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-amber-500/10 border-amber-400 dark:border-amber-600 shadow-sm'
              : 'bg-surface border-border-default hover:border-amber-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Celebrating Today</span>
            <Cake className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-ink flex items-baseline gap-2">
            <span>{stats.todayCount}</span>
            {stats.todayCount > 0 && (
              <span className="text-[11px] font-sans font-semibold text-amber-600 dark:text-amber-400 animate-pulse">
                🎉 Active!
              </span>
            )}
          </div>
        </div>

        {/* Upcoming within N days */}
        <div
          onClick={() => setActiveTab('upcoming')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-indigo-500/10 border-indigo-400 dark:border-indigo-600 shadow-sm'
              : 'bg-surface border-border-default hover:border-indigo-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Countdown Active ({settings.lookaheadDays}d window)</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-ink flex items-baseline gap-2">
            <span>{stats.upcomingCount}</span>
            <span className="text-[11px] font-sans font-medium text-indigo-600 dark:text-indigo-400">
              Students
            </span>
          </div>
        </div>

        {/* Total Registered */}
        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-surface-2 border-border-default shadow-sm'
              : 'bg-surface border-border-default hover:bg-surface-2'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Registered Birthdays</span>
            <Calendar className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-ink flex items-baseline gap-2">
            <span>{stats.totalCount}</span>
            <span className="text-[11px] font-sans font-medium text-ink-faint">Students</span>
          </div>
        </div>

        {/* Wishes Dispatched */}
        <div
          onClick={() => setActiveTab('history')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-emerald-500/10 border-emerald-400 dark:border-emerald-600 shadow-sm'
              : 'bg-surface border-border-default hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Wishes Sent ({now.getFullYear()})</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-ink flex items-baseline gap-2">
            <span>{stats.sentCount}</span>
            <span className="text-[11px] font-sans font-medium text-emerald-600 dark:text-emerald-400">
              Delivered
            </span>
          </div>
        </div>
      </div>

      {/* Scheduler Configuration Strip / Status Info */}
      <div className="rounded-xl p-3.5 bg-surface-2/60 dark:bg-surface-2/30 border border-border-default flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-ink-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-ink">Scheduler Status:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Active &amp; Monitoring
            </span>
          </div>
          <div className="hidden sm:inline text-border-default">|</div>
          <div>
            Run Frequency: <span className="font-semibold text-ink">Every {settings.schedulerIntervalDays} day(s)</span>
          </div>
          <div className="hidden sm:inline text-border-default">|</div>
          <div>
            Countdown Window: <span className="font-semibold text-ink">Within {settings.lookaheadDays} days</span>
          </div>
          <div className="hidden sm:inline text-border-default">|</div>
          <div>
            Exact Send Time: <span className="font-semibold font-mono text-ink">{settings.exactWishTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {wishHistory.length > 0 && (
            <button
              type="button"
              onClick={handleResetRecords}
              className="text-[11px] text-ink-faint hover:text-rose-600 underline cursor-pointer"
              title="Reset sent flags to test countdown again"
            >
              Reset Sent Flags (Test)
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('birthday-settings')}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Edit in Settings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'history' ? (
        /* History View */
        <div className="rounded-2xl bg-surface border border-border-default shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border-default flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span>Birthday Wish Dispatch History</span>
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Audit log of all automated and manual birthday wishes dispatched to students.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetRecords}
              className="px-2.5 py-1.5 rounded-lg border border-border-default hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-xs font-medium transition-colors cursor-pointer"
            >
              Clear Log History
            </button>
          </div>

          {wishHistory.length === 0 ? (
            <div className="p-12 text-center text-ink-muted text-xs">
              <Cake className="w-8 h-8 mx-auto text-ink-faint mb-2 opacity-50" />
              <p>No birthday wishes have been dispatched yet.</p>
              <p className="text-ink-faint mt-1">
                Wishes will be recorded here automatically when countdown timers complete or when sent manually.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-2 text-ink-muted border-b border-border-default">
                    <th className="py-2.5 px-4 font-semibold">Student</th>
                    <th className="py-2.5 px-4 font-semibold">Class / Section</th>
                    <th className="py-2.5 px-4 font-semibold">Mobile</th>
                    <th className="py-2.5 px-4 font-semibold">Dispatched At</th>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Message Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/60">
                  {wishHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink">{item.studentName}</div>
                        <div className="text-[11px] font-mono text-ink-faint">ID: {item.studentId}</div>
                      </td>
                      <td className="py-3 px-4 text-ink-muted">
                        {item.className} &bull; {item.section}
                      </td>
                      <td className="py-3 px-4 font-mono text-ink">{item.mobile}</td>
                      <td className="py-3 px-4 text-ink-muted">
                        <div>{new Date(item.sentAt).toLocaleDateString()}</div>
                        <div className="text-[11px] font-mono text-ink-faint">
                          {new Date(item.sentAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.triggerType === 'automatic'
                              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                              : 'bg-surface-2 text-ink-muted'
                          }`}
                        >
                          {item.triggerType === 'automatic' ? '⚡ Automatic' : 'Manual'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-ink-muted" title={item.message}>
                        {item.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Active / Upcoming / All Birthdays */
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="rounded-2xl p-4 bg-surface border border-border-default shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tab Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-2 w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upcoming'
                    ? 'bg-surface text-ink shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Countdown Active ({stats.upcomingCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'today'
                    ? 'bg-surface text-ink shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Cake className="w-3.5 h-3.5 text-amber-500" />
                <span>Today ({stats.todayCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-surface text-ink shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>All ({stats.totalCount})</span>
              </button>
            </div>

            {/* Search & Layout Toggles */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative min-w-50">
                <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student or mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border-default bg-surface text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Class Dropdown */}
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSelectedSectionId('all');
                }}
                className="py-1.5 px-2.5 rounded-xl border border-border-default bg-surface text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-surface-2 border border-border-default/60">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    viewMode === 'grid' ? 'bg-surface text-ink shadow-2xs' : 'text-ink-muted'
                  }`}
                  title="Grid Cards with live countdowns"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    viewMode === 'table' ? 'bg-surface text-ink shadow-2xs' : 'text-ink-muted'
                  }`}
                  title="Compact Table view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Student Cards or Table */}
          {filteredList.length === 0 ? (
            <div className="rounded-2xl p-12 text-center bg-surface border border-border-default text-ink-muted text-xs">
              <Cake className="w-8 h-8 mx-auto text-ink-faint mb-2 opacity-50" />
              <p className="font-semibold text-sm text-ink">No students found matching current filters.</p>
              <p className="text-ink-faint mt-1">
                {activeTab === 'upcoming'
                  ? `No student birthdays within the ${settings.lookaheadDays}-day countdown window. Try switching to 'All' or adjust the lookahead setting.`
                  : activeTab === 'today'
                  ? 'No student birthdays today.'
                  : 'Try clearing your search query or class filter.'}
              </p>
              {activeTab === 'upcoming' && (
                <div className="mt-4 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onNavigate('birthday-settings')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    Adjust Lookahead Window ({settings.lookaheadDays} Days)
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredList.map((info) => (
                <BirthdayCountdownCard
                  key={info.student.id}
                  info={info}
                  onSendWish={handleSendWish}
                  onEditDob={(target) => {
                    setEditingInfo(target);
                    setNewDobValue(target.dob);
                  }}
                  onPreviewWish={(target) => setPreviewInfo(target)}
                  isSending={sendingStudentId === info.student.id}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-2xl bg-surface border border-border-default shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-2 text-ink-muted border-b border-border-default">
                      <th className="py-2.5 px-4 font-semibold">Student Name</th>
                      <th className="py-2.5 px-4 font-semibold">Class &amp; Section</th>
                      <th className="py-2.5 px-4 font-semibold">Birthday (DOB)</th>
                      <th className="py-2.5 px-4 font-semibold">Countdown Remaining</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default/60">
                    {filteredList.map((info) => (
                      <tr key={info.student.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-ink flex items-center gap-1.5">
                            {info.isToday && <Cake className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                            <span>{info.student.name}</span>
                          </div>
                          <div className="text-[11px] font-mono text-ink-faint">
                            ID: {info.student.id} &bull; {info.student.mobile}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-ink-muted">
                          {info.student.className} &bull; {info.student.section}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingInfo(info);
                              setNewDobValue(info.dob);
                            }}
                            className="font-mono text-ink hover:text-primary flex items-center gap-1 underline-offset-2 hover:underline cursor-pointer"
                          >
                            <span>{info.dob}</span>
                            <span className="text-ink-faint text-[10.5px]">({info.turningAge} yrs)</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {info.hasSentThisYear ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Delivered
                            </span>
                          ) : (
                            <div className="text-ink font-semibold">
                              {info.daysUntil}d {String(info.hoursUntil).padStart(2, '0')}h{' '}
                              {String(info.minutesUntil).padStart(2, '0')}m{' '}
                              <span className="text-primary">{String(info.secondsUntil).padStart(2, '0')}s</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {info.hasSentThisYear ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                              Wish Sent
                            </span>
                          ) : info.isToday ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                              Today 🎉
                            </span>
                          ) : info.isWithinCountdownWindow ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                              T-{info.daysUntil}d
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-2 text-ink-faint">
                              In {info.daysUntil}d
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewInfo(info)}
                              className="p-1.5 rounded-lg border border-border-default hover:bg-surface-2 text-ink-muted cursor-pointer"
                              title="Preview SMS text"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendWish(info)}
                              disabled={sendingStudentId === info.student.id}
                              className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Student DOB Modal */}
      {editingInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border-default p-6 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Edit Student Date of Birth</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingInfo(null)}
                className="text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-ink-muted">
              Adjust birthday date for <strong className="text-ink">{editingInfo.student.name}</strong> (ID: {editingInfo.student.id}).
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Date of Birth (YYYY-MM-DD)</label>
              <input
                type="date"
                value={newDobValue}
                onChange={(e) => setNewDobValue(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border-default bg-surface text-xs font-mono text-ink focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-ink-muted">Quick Testing Presets:</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPresetDob(0)}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-800 dark:text-amber-300 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Set to TODAY (Nov 18)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDob(1)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 text-indigo-800 dark:text-indigo-300 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Set to Tomorrow (+1d)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDob(2)}
                  className="px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 text-ink-muted text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Set to +2 Days
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
              <button
                type="button"
                onClick={() => setEditingInfo(null)}
                className="px-3.5 py-2 rounded-xl border border-border-default hover:bg-surface-2 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDob}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold cursor-pointer"
              >
                Save Birthday
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Wish Message Modal */}
      {previewInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border-default p-6 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <Cake className="w-4 h-4 text-amber-500" />
                <span>Birthday SMS Preview</span>
              </h3>
              <button
                type="button"
                onClick={() => setPreviewInfo(null)}
                className="text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-ink-muted">
              SMS greeting prepared for <strong className="text-ink">{previewInfo.student.name}</strong> (Mobile: {previewInfo.student.mobile}):
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-border-default/60 text-xs text-ink leading-relaxed whitespace-pre-wrap font-sans">
              {birthdayService.compileMessage(
                settings.wishTemplate,
                previewInfo.student,
                previewInfo.turningAge
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-ink-faint">
              <span>Channel: {settings.channel} SMS</span>
              <span>Exact Dispatch Time: {settings.exactWishTime}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-default">
              <button
                type="button"
                onClick={() => setPreviewInfo(null)}
                className="px-3.5 py-2 rounded-xl border border-border-default hover:bg-surface-2 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = previewInfo;
                  setPreviewInfo(null);
                  handleSendWish(target);
                }}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Wish Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Student Birthday Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateStudent}
            className="w-full max-w-lg rounded-2xl bg-surface border border-border-default p-6 shadow-xl space-y-4 animate-scaleUp"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>Register Student Birthday</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TAHMID HASSAN"
                  value={newStudentForm.name}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-border-default bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Student ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 2609991234"
                  value={newStudentForm.id}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, id: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-border-default bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Guardian Mobile *</label>
                <input
                  type="text"
                  required
                  placeholder="8801711000000"
                  value={newStudentForm.mobile}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, mobile: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-border-default bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={newStudentForm.dob}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, dob: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-border-default bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Class</label>
                <select
                  value={newStudentForm.className}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, className: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-border-default bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Play Group">Play Group</option>
                  <option value="Nursery">Nursery</option>
                  <option value="Kindergarten (KG)">Kindergarten (KG)</option>
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Section</label>
                <input
                  type="text"
                  placeholder="Starter"
                  value={newStudentForm.section}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, section: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-border-default bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-border-default hover:bg-surface-2 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold cursor-pointer"
              >
                Register Student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
