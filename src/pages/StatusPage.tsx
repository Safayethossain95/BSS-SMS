import React, { useState, useMemo } from 'react';
import {
  Activity,
  Search,
  Filter,
  X,
  Send,
  RotateCcw,
  Download,
  Copy,
  Check,
  ChevronDown,
  Bell,
  Radio,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Smartphone
} from 'lucide-react';
import type { ClassInfo, CustomGroup, AppPage, StatusLogRecord } from '../types';

interface StatusPageProps {
  classes: ClassInfo[];
  customGroups: CustomGroup[];
  onNavigate: (page: AppPage) => void;
}

// Initial realistic status logs data
const INITIAL_STATUS_LOGS: StatusLogRecord[] = [
  {
    id: 'STAT-001',
    time: '2026-11-12 11:42 AM',
    alertName: 'Attendance Alert',
    receiverName: 'Md. Tanvir Ahmed',
    receiverMobile: '01712345678',
    receiverId: 'BSS-2601',
    channel: 'Masking',
    operator: 'Grameenphone',
    messageCount: 1,
    classId: 'class-1',
    className: 'Class 1',
    sectionId: 'sec-1a',
    sectionName: 'Section A',
    customGroupId: 'cg-1',
    customGroupName: 'Morning Shift Monitors',
    status: 'Delivered',
  },
  {
    id: 'STAT-002',
    time: '2026-11-12 11:38 AM',
    alertName: 'Fee Reminder Alert',
    receiverName: 'Nusrat Jahan Mim',
    receiverMobile: '01823456789',
    receiverId: 'BSS-2602',
    channel: 'Masking',
    operator: 'Robi',
    messageCount: 2,
    classId: 'class-1',
    className: 'Class 1',
    sectionId: 'sec-1b',
    sectionName: 'Section B',
    status: 'Delivered',
  },
  {
    id: 'STAT-003',
    time: '2026-11-12 11:25 AM',
    alertName: 'Midterm Exam Schedule',
    receiverName: 'Farhan Kabir',
    receiverMobile: '01934567890',
    receiverId: 'BSS-2603',
    channel: 'Masking',
    operator: 'Banglalink',
    messageCount: 2,
    classId: 'class-2',
    className: 'Class 2',
    sectionId: 'sec-2a',
    sectionName: 'Section A',
    customGroupId: 'cg-2',
    customGroupName: 'Prefects & Council',
    status: 'Delivered',
  },
  {
    id: 'STAT-004',
    time: '2026-11-12 11:15 AM',
    alertName: 'Emergency Weather Notice',
    receiverName: 'Ayesha Siddiqua',
    receiverMobile: '01645678901',
    receiverId: 'BSS-2604',
    channel: 'Non-Masking',
    operator: 'Airtel',
    messageCount: 1,
    classId: 'class-2',
    className: 'Class 2',
    sectionId: 'sec-2b',
    sectionName: 'Section B',
    status: 'Delivered',
  },
  {
    id: 'STAT-005',
    time: '2026-11-12 10:55 AM',
    alertName: 'Attendance Alert',
    receiverName: 'Siam Chowdhury',
    receiverMobile: '01556789012',
    receiverId: 'BSS-2605',
    channel: 'Masking',
    operator: 'Teletalk',
    messageCount: 1,
    classId: 'class-3',
    className: 'Class 3',
    sectionId: 'sec-3a',
    sectionName: 'Section A',
    status: 'Delivered',
  },
  {
    id: 'STAT-006',
    time: '2026-11-12 10:30 AM',
    alertName: 'Parent-Teacher Meeting',
    receiverName: 'Zubair Hossain',
    receiverMobile: '01798765432',
    receiverId: 'BSS-2606',
    channel: 'Masking',
    operator: 'Grameenphone',
    messageCount: 1,
    classId: 'class-3',
    className: 'Class 3',
    sectionId: 'sec-3b',
    sectionName: 'Section B',
    customGroupId: 'cg-1',
    customGroupName: 'Morning Shift Monitors',
    status: 'Delivered',
  },
  {
    id: 'STAT-007',
    time: '2026-11-12 10:12 AM',
    alertName: 'Sports Day Notice',
    receiverName: 'Mahir Faisal',
    receiverMobile: '01887654321',
    receiverId: 'BSS-2607',
    channel: 'Masking',
    operator: 'Robi',
    messageCount: 1,
    classId: 'class-4',
    className: 'Class 4',
    sectionId: 'sec-4a',
    sectionName: 'Section A',
    status: 'Processing',
  },
  {
    id: 'STAT-008',
    time: '2026-11-12 09:45 AM',
    alertName: 'Fee Reminder Alert',
    receiverName: 'Anika Tabassum',
    receiverMobile: '01976543210',
    receiverId: 'BSS-2608',
    channel: 'Non-Masking',
    operator: 'Banglalink',
    messageCount: 2,
    classId: 'class-4',
    className: 'Class 4',
    sectionId: 'sec-4b',
    sectionName: 'Section B',
    status: 'Failed',
  },
  {
    id: 'STAT-009',
    time: '2026-11-12 09:10 AM',
    alertName: 'Library Due Notice',
    receiverName: 'Rezaul Karim',
    receiverMobile: '01765432109',
    receiverId: 'BSS-2609',
    channel: 'Masking',
    operator: 'Grameenphone',
    messageCount: 1,
    classId: 'class-5',
    className: 'Class 5',
    sectionId: 'sec-5a',
    sectionName: 'Section A',
    customGroupId: 'cg-2',
    customGroupName: 'Prefects & Council',
    status: 'Delivered',
  },
  {
    id: 'STAT-010',
    time: '2026-11-12 08:30 AM',
    alertName: 'Morning Assembly Notice',
    receiverName: 'Tasnim Rahman',
    receiverMobile: '01543210987',
    receiverId: 'BSS-2610',
    channel: 'Masking',
    operator: 'Teletalk',
    messageCount: 1,
    classId: 'class-5',
    className: 'Class 5',
    sectionId: 'sec-5b',
    sectionName: 'Section B',
    status: 'Processing',
  },
  {
    id: 'STAT-011',
    time: '2026-11-11 04:50 PM',
    alertName: 'Attendance Alert',
    receiverName: 'Sabbir Ahmed',
    receiverMobile: '01865432198',
    receiverId: 'BSS-2611',
    channel: 'Masking',
    operator: 'Robi',
    messageCount: 1,
    classId: 'class-1',
    className: 'Class 1',
    sectionId: 'sec-1a',
    sectionName: 'Section A',
    status: 'Delivered',
  },
  {
    id: 'STAT-012',
    time: '2026-11-11 03:15 PM',
    alertName: 'Exam Results Published',
    receiverName: 'Kazi Naimul',
    receiverMobile: '01654321876',
    receiverId: 'BSS-2612',
    channel: 'Masking',
    operator: 'Airtel',
    messageCount: 3,
    classId: 'class-2',
    className: 'Class 2',
    sectionId: 'sec-2a',
    sectionName: 'Section A',
    customGroupId: 'cg-1',
    customGroupName: 'Morning Shift Monitors',
    status: 'Delivered',
  },
];

export const StatusPage: React.FC<StatusPageProps> = ({
  classes,
  customGroups,
  onNavigate,
}) => {
  // Filters State
  const [alertQuery, setAlertQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // UI State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Available sections based on selected class
  const availableSections = useMemo(() => {
    if (!selectedClassId) {
      // Gather all sections across all classes
      return classes.flatMap((c) => c.sections || []);
    }
    const currentClass = classes.find((c) => c.id === selectedClassId);
    return currentClass?.sections || [];
  }, [classes, selectedClassId]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return INITIAL_STATUS_LOGS.filter((record) => {
      // 1. Filter by Alert Name
      if (alertQuery.trim()) {
        const query = alertQuery.trim().toLowerCase();
        const matchesAlert = record.alertName.toLowerCase().includes(query);
        if (!matchesAlert) return false;
      }

      // 2. Filter by Class
      if (selectedClassId) {
        const selectedClassObj = classes.find((c) => c.id === selectedClassId);
        const matchesClass =
          record.classId === selectedClassId ||
          (selectedClassObj && record.className?.toLowerCase() === selectedClassObj.name.toLowerCase());
        if (!matchesClass) return false;
      }

      // 3. Filter by Section
      if (selectedSectionId) {
        const matchesSection =
          record.sectionId === selectedSectionId ||
          availableSections.some(
            (s) => s.id === selectedSectionId && record.sectionName?.toLowerCase() === s.name.toLowerCase()
          );
        if (!matchesSection) return false;
      }

      // 4. Filter by Custom Group
      if (selectedGroupId) {
        const selectedGroupObj = customGroups.find((g) => g.id === selectedGroupId);
        const matchesGroup =
          record.customGroupId === selectedGroupId ||
          (selectedGroupObj && record.customGroupName?.toLowerCase() === selectedGroupObj.name.toLowerCase());
        if (!matchesGroup) return false;
      }

      // 5. Filter by Status
      if (selectedStatus) {
        if (record.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [alertQuery, selectedClassId, selectedSectionId, selectedGroupId, selectedStatus, classes, availableSections, customGroups]);

  // KPI Calculations
  const totalMessagesCount = filteredRecords.reduce((acc, r) => acc + r.messageCount, 0);
  const deliveredCount = filteredRecords.filter((r) => r.status === 'Delivered').length;
  const deliveryRate = filteredRecords.length > 0
    ? Math.round((deliveredCount / filteredRecords.length) * 100)
    : 100;

  // Clear all filters
  const handleClearFilters = () => {
    setAlertQuery('');
    setSelectedClassId('');
    setSelectedSectionId('');
    setSelectedGroupId('');
    setSelectedStatus('');
  };

  const hasActiveFilters = Boolean(
    alertQuery.trim() || selectedClassId || selectedSectionId || selectedGroupId || selectedStatus
  );

  // Copy mobile number
  const handleCopyMobile = (mobile: string, id: string) => {
    navigator.clipboard.writeText(mobile);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  // Simulate refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Time', 'Alert Name', 'Receiver Name', 'Receiver Mobile', 'Channel', 'Operator', 'Message Count', 'Status'];
    const rows = filteredRecords.map((r) => [
      `"${r.time}"`,
      `"${r.alertName}"`,
      `"${r.receiverName}"`,
      `"${r.receiverMobile}"`,
      `"${r.channel}"`,
      `"${r.operator}"`,
      r.messageCount,
      `"${r.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bss_status_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for operator color chip
  const renderOperatorBadge = (operator: StatusLogRecord['operator']) => {
    switch (operator) {
      case 'Grameenphone':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            GP
          </span>
        );
      case 'Robi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Robi
          </span>
        );
      case 'Banglalink':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Banglalink
          </span>
        );
      case 'Teletalk':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Teletalk
          </span>
        );
      case 'Airtel':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Airtel
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-ink">
            {operator}
          </span>
        );
    }
  };

  // Helper for delivery status badge
  const renderStatusBadge = (status: StatusLogRecord['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Delivered
          </span>
        );
      case 'Processing':
      case 'Sent':
      case 'Queued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 shadow-2xs">
            <RotateCcw className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-spin" />
            Processing
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-2 text-ink">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight mb-0.5">
            Status Logs &amp; Delivery Reports
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Live delivery receipts, alert tracking, operator routing, and receiver logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-2 hover:bg-surface text-ink text-xs font-semibold border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-2 hover:bg-surface text-ink text-xs font-semibold border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs"
            title="Refresh logs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('delivery')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs transition cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card !p-4 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card flex items-center gap-3.5">
          <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent w-10 h-10 rounded-xl">
            <Activity className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xl font-bold font-mono text-ink leading-none">{filteredRecords.length}</div>
            <div className="text-xs text-ink-muted mt-1">Total Logs</div>
          </div>
        </div>

        <div className="card !p-4 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card flex items-center gap-3.5">
          <span className="icon-chip bg-surface-2 text-emerald-600 dark:text-emerald-400 w-10 h-10 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xl font-bold font-mono text-ink leading-none">{deliveryRate}%</div>
            <div className="text-xs text-ink-muted mt-1">Delivery Success Rate</div>
          </div>
        </div>

        <div className="card !p-4 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card flex items-center gap-3.5">
          <span className="icon-chip bg-surface-2 text-indigo-600 dark:text-indigo-400 w-10 h-10 rounded-xl">
            <Radio className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xl font-bold font-mono text-ink leading-none">{totalMessagesCount} SMS</div>
            <div className="text-xs text-ink-muted mt-1">Dispatched Units</div>
          </div>
        </div>

        <div className="card !p-4 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card flex items-center gap-3.5">
          <span className="icon-chip bg-surface-2 text-amber-600 dark:text-amber-400 w-10 h-10 rounded-xl">
            <Smartphone className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xl font-bold font-mono text-ink leading-none">5 Operators</div>
            <div className="text-xs text-ink-muted mt-1">GP, Robi, BL, TT, Airtel</div>
          </div>
        </div>
      </div>

      {/* 3. Filter Controls Section */}
      <div className="card !p-4 sm:!p-5 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card transition-colors">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-ink-muted" />
              <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                Filter Logs &amp; Status
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Filter 1: By Alert */}
            <div className="flex flex-col">
              <label
                htmlFor="alert-filter-input"
                className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none"
              >
                Filter by Alert
              </label>
              <div className="relative">
                <Bell className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                <input
                  id="alert-filter-input"
                  type="text"
                  value={alertQuery}
                  onChange={(e) => setAlertQuery(e.target.value)}
                  placeholder="e.g. Attendance, Fee, Exam..."
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 outline-none transition-colors"
                />
                {alertQuery && (
                  <button
                    type="button"
                    onClick={() => setAlertQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer p-0.5"
                    title="Clear alert search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter 2: Class Dropdown */}
            <div className="flex flex-col">
              <label
                htmlFor="class-filter-select"
                className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none"
              >
                Class
              </label>
              <div className="relative">
                <select
                  id="class-filter-select"
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedSectionId(''); // reset section if class changes
                  }}
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer transition-colors"
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
              </div>
            </div>

            {/* Filter 3: Section Dropdown */}
            <div className="flex flex-col">
              <label
                htmlFor="section-filter-select"
                className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none"
              >
                Section
              </label>
              <div className="relative">
                <select
                  id="section-filter-select"
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer transition-colors"
                >
                  <option value="">All Sections</option>
                  {availableSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
              </div>
            </div>

            {/* Filter 4: Custom Group Dropdown */}
            <div className="flex flex-col">
              <label
                htmlFor="group-filter-select"
                className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none"
              >
                Custom Group
              </label>
              <div className="relative">
                <select
                  id="group-filter-select"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer transition-colors"
                >
                  <option value="">All Custom Groups</option>
                  {customGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
              </div>
            </div>

            {/* Filter 5: Status Dropdown */}
            <div className="flex flex-col">
              <label
                htmlFor="status-filter-select"
                className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none"
              >
                Status
              </label>
              <div className="relative">
                <select
                  id="status-filter-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer transition-colors"
                >
                  <option value="">All Status</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed">Failed</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Results Status Table */}
      <div className="card !p-0 overflow-hidden border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card transition-colors">
        {/* Table Top Header Info */}
        <div className="p-3.5 sm:p-4 border-b border-gray-200 dark:border-zinc-800 bg-surface-2/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink">
              Showing <span className="font-mono font-bold">{filteredRecords.length}</span> of {INITIAL_STATUS_LOGS.length} records
            </span>
            {hasActiveFilters && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface border border-gray-200 dark:border-zinc-800 text-ink-muted">
                Filtered
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Delivered
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Processing
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Failed
            </span>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-dashed border-gray-200 dark:border-zinc-800 text-ink font-semibold bg-surface-2/60">
                <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800 whitespace-nowrap">
                  TIME
                </th>
                <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800 whitespace-nowrap">
                  ALERT
                </th>
                <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800 whitespace-nowrap">
                  RECEIVER
                </th>
                <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800 whitespace-nowrap">
                  CHANNEL
                </th>
                <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800 whitespace-nowrap">
                  OPERATOR
                </th>
                <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800 text-center whitespace-nowrap">
                  MESSAGE COUNT
                </th>
                <th scope="col" className="py-3 px-4 text-right whitespace-nowrap">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 px-4 text-center text-ink-muted text-xs bg-surface">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-ink-muted mb-1">
                        <Search className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-sm text-ink">No matching status logs found</span>
                      <p className="text-xs text-ink-muted">
                        No delivery records matched the current alert query or class/group filters. Try resetting the filters or broadening your search.
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface text-ink text-xs font-semibold border border-gray-200 dark:border-zinc-800 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear All Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, idx) => (
                  <tr
                    key={record.id}
                    className={`border-b border-dashed border-gray-200 dark:border-zinc-800 transition-colors ${
                      idx % 2 === 0
                        ? 'bg-surface hover:bg-surface-2/40'
                        : 'bg-surface-2/20 hover:bg-surface-2/50'
                    }`}
                  >
                    {/* 1. Time */}
                    <td className="py-3.5 px-4 font-mono text-xs text-ink-muted border-r border-dashed border-gray-200 dark:border-zinc-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" />
                        <span>{record.time}</span>
                      </div>
                    </td>

                    {/* 2. Alert Name */}
                    <td className="py-3.5 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-surface-2 text-[#1b1e42] dark:text-accent flex-shrink-0">
                          <Bell className="w-3 h-3" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs sm:text-sm text-ink truncate">
                            {record.alertName}
                          </div>
                          {(record.className || record.customGroupName) && (
                            <div className="text-[10.5px] text-ink-muted truncate">
                              {record.className} {record.sectionName ? `• ${record.sectionName}` : ''}
                              {record.customGroupName ? ` (${record.customGroupName})` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 3. Receiver */}
                    <td className="py-3.5 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-xs sm:text-sm text-ink truncate">
                            {record.receiverName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {record.receiverId && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-2 text-ink-muted border border-gray-200 dark:border-zinc-800">
                                {record.receiverId}
                              </span>
                            )}
                            <span className="font-mono text-[11px] text-ink-muted">
                              {record.receiverMobile}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyMobile(record.receiverMobile, record.id)}
                          className="p-1 text-ink-muted hover:text-ink hover:bg-surface-2 rounded transition cursor-pointer flex-shrink-0"
                          title="Copy phone number"
                        >
                          {copiedId === record.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 4. Channel */}
                    <td className="py-3.5 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800 whitespace-nowrap">
                      {record.channel === 'Masking' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs">
                          <Layers className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          BSS (Masking)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 shadow-2xs">
                          <Radio className="w-3 h-3 text-zinc-500" />
                          Non-Masking
                        </span>
                      )}
                    </td>

                    {/* 5. Operator */}
                    <td className="py-3.5 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800 whitespace-nowrap">
                      {renderOperatorBadge(record.operator)}
                    </td>

                    {/* 6. Message Count */}
                    <td className="py-3.5 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-surface-2 text-ink border border-gray-200 dark:border-zinc-800">
                        {record.messageCount} SMS
                      </span>
                    </td>

                    {/* 7. Status */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {renderStatusBadge(record.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

