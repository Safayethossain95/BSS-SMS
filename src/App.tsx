import { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import type {
  Student,
  ClassInfo,
  SmsTemplate,
  SentBroadcastRecord,
  CustomGroup,
  AuthUser,
  AppPage
} from './types';
import type { SmsBalanceInfo } from './types/api';
import { calculateSmsMetrics } from './utils/smsCalculator';
import { PAGE_ROUTES, getPageFromPath } from './routes';

// API Services
import { academicService } from './services/academicService';
import { groupService } from './services/groupService';
import { studentService } from './services/studentService';
import { templateService } from './services/templateService';
import { smsService } from './services/smsService';
import { birthdayService } from './services/birthdayService';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FilterSection } from './components/FilterSection';
import { GroupShifter } from './components/GroupShifter';
import { MessageComposer } from './components/MessageComposer';
import { StudentTable } from './components/StudentTable';
import { ActionBar } from './components/ActionBar';
import { LoginPage } from './components/LoginPage';
import { Toaster } from './components/Toaster';

// Pages
import { CustomGroupsPage } from './pages/CustomGroupsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { BroadcastLogsPage } from './pages/BroadcastLogsPage';
import { StatusPage } from './pages/StatusPage';
import { SmsGatewayPage } from './pages/SmsGatewayPage';
import { ScheduledMessagesPage } from './pages/ScheduledMessagesPage';
import { BirthdaysPage } from './pages/BirthdaysPage';
import { BirthdaySettingsPage } from './pages/BirthdaySettingsPage';
import { SystemMessagesPage } from './pages/SystemMessagesPage';
import { DatabaseIndexerPage } from './pages/DatabaseIndexerPage';

// Modals
import { PhonePreviewModal } from './components/PhonePreviewModal';
import { SendConfirmModal } from './components/SendConfirmModal';
import { HistoryModal } from './components/HistoryModal';
import { TemplateManagerModal } from './components/TemplateManagerModal';
import { TestSmsModal } from './components/TestSmsModal';
import { CustomGroupModal } from './components/CustomGroupModal';

export function App() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students] = useState<Student[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [historyRecords, setHistoryRecords] = useState<SentBroadcastRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [pendingScheduledCount, setPendingScheduledCount] = useState<number>(0);
  const [activeBirthdaysCount, setActiveBirthdaysCount] = useState<number>(0);

  const [balance, setBalance] = useState<number>(5000);
  const [_safetyInfo, setSafetyInfo] = useState<SmsBalanceInfo>({
    currentBalance: 5000,
    activeGatewayName: 'Active Gateway',
    isMasking: false,
    isSafeTestMode: true,
    safeTestPhoneNumber: '01670319232',
  });

  // Filter States
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Group Shifter (Available <-> Destination)
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [destinationGroups, setDestinationGroups] = useState<string[]>([]);

  // Table & Selection States
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);

  // Message State
  const [message, setMessage] = useState<string>(
    'Dear {StudentName}, you are requested to attend the school session on time. Regards, BSS School.'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Modals
  const [isPhonePreviewOpen, setIsPhonePreviewOpen] = useState(false);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isTestSmsOpen, setIsTestSmsOpen] = useState(false);
  const [isCustomGroupModalOpen, setIsCustomGroupModalOpen] = useState(false);
  const [singleStudentForTest, setSingleStudentForTest] = useState<Student | null>(null);

  // Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('bss_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('bss_sms_auth_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    localStorage.setItem('bss_sms_auth_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('bss_sms_auth_user');
    localStorage.removeItem('bss_gateway_token');
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bss_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bss_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Sidebar State (never auto-collapsed by screen size)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bss_sms_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bss_sms_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
    } catch {
      // Storage quota or private mode protection
    }
  }, [sidebarCollapsed]);

  // Active Navigation Page derived from Route
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = useMemo(() => getPageFromPath(location.pathname), [location.pathname]);

  const handleNavigate = useCallback((page: AppPage) => {
    navigate(PAGE_ROUTES[page] || '/delivery');
  }, [navigate]);

  // Custom Groups State
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>(() => {
    try {
      const saved = localStorage.getItem('bss_sms_custom_groups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bss_sms_custom_groups', JSON.stringify(customGroups));
    } catch {
      // Storage quota or private mode protection
    }
  }, [customGroups]);

  // Initial Data Fetching from ASP.NET Core 10 Web API
  const fetchClasses = useCallback(async () => {
    try {
      const data = await academicService.getClassesWithSections();
      setClasses(data || []);
      if (data && data.length > 0) {
        setSelectedClassId(data[0].id);
        if (data[0].sections && data[0].sections.length > 0) {
          setSelectedSectionId(data[0].sections[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load academic hierarchy:', err);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await groupService.getAvailableGroups();
      setAvailableGroups(data || []);
    } catch (err) {
      console.error('Failed to load recipient groups:', err);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await templateService.getTemplates();
      setTemplates(data || []);
      if (data && data.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(data[0].id);
        setMessage(data[0].body);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }, [selectedTemplateId]);

  const fetchBalance = useCallback(async () => {
    try {
      const info = await smsService.getBalance();
      setSafetyInfo(info);
      setBalance(info.currentBalance);
    } catch (err) {
      console.error('Failed to load balance info:', err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const data = await smsService.getHistory(50);
      setHistoryRecords(data);
    } catch (err) {
      console.error('Failed to load history records:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const fetchPendingScheduledCount = useCallback(async () => {
    try {
      const list = await smsService.getScheduled();
      setPendingScheduledCount(list.length);
    } catch (err) {
      console.error('Failed to load scheduled count:', err);
    }
  }, []);

  const updateBirthdaysCount = useCallback(() => {
    try {
      const infos = birthdayService.getAllBirthdayInfos(new Date());
      const count = infos.filter((i) => i.isWithinCountdownWindow || i.isToday).length;
      setActiveBirthdaysCount(count);
    } catch (e) {
      console.error('Failed to update birthdays count:', e);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchClasses();
      await fetchGroups();
      await fetchTemplates();
      await fetchBalance();
      await fetchHistory();
      await fetchPendingScheduledCount();
      updateBirthdaysCount();
    };
    loadInitialData();
  }, [fetchClasses, fetchGroups, fetchTemplates, fetchBalance, fetchHistory, fetchPendingScheduledCount, updateBirthdaysCount]);

  // Birthday Scheduler Background Interval Loop (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await birthdayService.checkAndExecuteScheduler(new Date());
        updateBirthdaysCount();
      } catch (err) {
        console.error('Background birthday scheduler error:', err);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [updateBirthdaysCount]);

  // Sync custom groups into available groups list
  useEffect(() => {
    const customNames = customGroups.map((cg) => cg.name);
    queueMicrotask(() => {
      setAvailableGroups((prev) => {
        const activeInDest = new Set(destinationGroups);
        const existingInAvail = new Set(prev);
        const toAdd = customNames.filter((name) => !activeInDest.has(name) && !existingInAvail.has(name));
        return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
      });
    });
  }, [customGroups, destinationGroups]);

  // Load students based on destinationGroups from Backend
  const syncStudentsFromDestinationGroups = useCallback(async (
    destGroups: string[]
  ) => {
    if (destGroups.length === 0) {
      setDisplayedStudents([]);
      setSelectedStudentIds(new Set());
      return;
    }

    setIsLoadingStudents(true);
    try {
      const resolved = await groupService.resolveRecipients(destGroups);
      setDisplayedStudents(resolved || []);
      setSelectedStudentIds(new Set((resolved || []).map((s) => s.id)));
    } catch (err) {
      console.error('Failed to resolve recipients from destination groups:', err);
      setDisplayedStudents([]);
      setSelectedStudentIds(new Set());
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  const handleCreateCustomGroup = (newGroup: CustomGroup) => {
    const updated = [newGroup, ...customGroups];
    setCustomGroups(updated);
    setAvailableGroups((prev) => {
      if (!prev.includes(newGroup.name) && !destinationGroups.includes(newGroup.name)) {
        return [newGroup.name, ...prev];
      }
      return prev;
    });
  };

  const handleUpdateCustomGroup = (updatedGroup: CustomGroup) => {
    const oldGroup = customGroups.find((g) => g.id === updatedGroup.id);
    const updatedList = customGroups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g));
    setCustomGroups(updatedList);

    if (oldGroup && oldGroup.name !== updatedGroup.name) {
      setAvailableGroups((prev) =>
        prev.map((name) => (name === oldGroup.name ? updatedGroup.name : name))
      );
      setDestinationGroups((prev) =>
        prev.map((name) => (name === oldGroup.name ? updatedGroup.name : name))
      );
    }

    if (
      destinationGroups.includes(updatedGroup.name) ||
      (oldGroup && destinationGroups.includes(oldGroup.name))
    ) {
      const activeDest = destinationGroups.map((n) =>
        oldGroup && n === oldGroup.name ? updatedGroup.name : n
      );
      syncStudentsFromDestinationGroups(activeDest);
    }
  };

  const handleDeleteCustomGroup = (id: string) => {
    const groupToDelete = customGroups.find((g) => g.id === id);
    if (!groupToDelete) return;

    const updatedList = customGroups.filter((g) => g.id !== id);
    setCustomGroups(updatedList);

    setAvailableGroups((prev) => prev.filter((name) => name !== groupToDelete.name));
    const nextDest = destinationGroups.filter((name) => name !== groupToDelete.name);
    setDestinationGroups(nextDest);

    if (destinationGroups.includes(groupToDelete.name)) {
      syncStudentsFromDestinationGroups(nextDest);
    }
  };

  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    const cls = classes.find((c) => c.id === newClassId);
    if (cls && cls.sections.length > 0) {
      setSelectedSectionId(cls.sections[0].id);
    } else {
      setSelectedSectionId('');
    }
  };

  const handleSectionChange = (newSectionId: string) => {
    setSelectedSectionId(newSectionId);
  };

  const handleLoadFromDropdown = async () => {
    if (!selectedClassId) return;

    const currentCls = classes.find((c) => c.id === selectedClassId);
    if (!currentCls) return;

    const currentSec = currentCls.sections.find((s) => s.id === selectedSectionId);

    // Determine group name to append to Destination Group
    let groupToAppend = '';
    if (currentSec) {
      const matchingAvail = availableGroups.find(
        (g) =>
          g.toLowerCase() === currentSec.name.toLowerCase() ||
          g.toLowerCase() === `${currentCls.name} - ${currentSec.name}`.toLowerCase() ||
          g.toLowerCase() === `${currentCls.name} ${currentSec.name}`.toLowerCase()
      );
      groupToAppend = matchingAvail || currentSec.name;
    } else {
      const matchingAvail = availableGroups.find(
        (g) => g.toLowerCase() === currentCls.name.toLowerCase()
      );
      groupToAppend = matchingAvail || currentCls.name;
    }

    if (groupToAppend && !destinationGroups.includes(groupToAppend)) {
      setDestinationGroups((prev) => [...prev, groupToAppend]);
      setAvailableGroups((prev) => prev.filter((g) => g !== groupToAppend));
    }

    setIsLoadingStudents(true);
    try {
      const loaded = await studentService.getStudentsByClassAndSection(
        selectedClassId,
        selectedSectionId || undefined
      );
      if (loaded && loaded.length > 0) {
        setDisplayedStudents((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const combined = [...prev];
          for (const s of loaded) {
            if (!existingIds.has(s.id)) {
              combined.push(s);
              existingIds.add(s.id);
            }
          }
          return combined.length > 0 ? combined : loaded;
        });
        setSelectedStudentIds((prev) => {
          const next = new Set(prev);
          loaded.forEach((s) => next.add(s.id));
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to load students from class/section:', err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleTransferToDestination = (group: string) => {
    const nextDest = [...destinationGroups, group];
    const nextAvail = availableGroups.filter((g) => g !== group);
    setDestinationGroups(nextDest);
    setAvailableGroups(nextAvail);
    syncStudentsFromDestinationGroups(nextDest);
  };

  const handleTransferToAvailable = (group: string) => {
    const nextDest = destinationGroups.filter((g) => g !== group);
    const nextAvail = [...availableGroups, group];
    setDestinationGroups(nextDest);
    setAvailableGroups(nextAvail);
    syncStudentsFromDestinationGroups(nextDest);
  };

  const handleTransferAllToDestination = () => {
    const nextDest = [...destinationGroups, ...availableGroups];
    setDestinationGroups(nextDest);
    setAvailableGroups([]);
    syncStudentsFromDestinationGroups(nextDest);
  };

  const handleTransferAllToAvailable = () => {
    const nextAvail = [...availableGroups, ...destinationGroups];
    setAvailableGroups(nextAvail);
    setDestinationGroups([]);
    syncStudentsFromDestinationGroups([]);
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return displayedStudents;
    const q = searchQuery.toLowerCase();
    return displayedStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.mobile.toLowerCase().includes(q) ||
        (s.headerId && s.headerId.toLowerCase().includes(q))
    );
  }, [displayedStudents, searchQuery]);

  const metrics = useMemo(() => {
    return calculateSmsMetrics(message, selectedStudentIds.size);
  }, [message, selectedStudentIds.size]);

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const isAll = filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudentIds.has(s.id));
    if (isAll) {
      setSelectedStudentIds((prev) => {
        const next = new Set(prev);
        filteredStudents.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelectedStudentIds((prev) => {
        const next = new Set(prev);
        filteredStudents.forEach((s) => next.add(s.id));
        return next;
      });
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setMessage(tpl.body);
    }
  };

  const handleReset = () => {
    setMessage('');
    setSelectedTemplateId('');
    setSelectedStudentIds(new Set());
    setDestinationGroups([]);
    fetchGroups();
    setDisplayedStudents([]);
  };

  const selectedStudentsList = useMemo(() => {
    return displayedStudents.filter((s) => selectedStudentIds.has(s.id));
  }, [displayedStudents, selectedStudentIds]);

  const targetGroupSummary = useMemo(() => {
    if (destinationGroups.length > 0) {
      return destinationGroups.join(', ');
    }
    const currentCls = classes.find((c) => c.id === selectedClassId);
    if (currentCls) {
      const currentSec = currentCls.sections.find((s) => s.id === selectedSectionId);
      return currentSec ? `${currentCls.name} - ${currentSec.name}` : currentCls.name;
    }
    return 'All Classes';
  }, [destinationGroups, classes, selectedClassId, selectedSectionId]);

  const handleSendSuccess = (
    recipients: Student[],
    sentMessage: string,
    isScheduled?: boolean
  ) => {
    if (isScheduled) {
      fetchPendingScheduledCount();
      return;
    }

    const currentCls = classes.find((c) => c.id === selectedClassId);
    const currentSec = currentCls?.sections.find((s) => s.id === selectedSectionId);

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newRecord: SentBroadcastRecord = {
      id: `BC-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      className: currentCls ? currentCls.name : 'Custom Selection',
      section: currentSec ? currentSec.name : 'Multiple Sections',
      message: sentMessage,
      totalRecipients: recipients.length,
      totalSmsUnits: metrics.totalSmsCost,
      status: 'Delivered',
      recipients: recipients.map((r) => ({
        name: r.name,
        mobile: r.mobile,
        status: 'Delivered',
      })),
    };

    setHistoryRecords((prev) => [newRecord, ...prev]);
    fetchBalance();
    fetchHistory();
  };

  const sampleStudent = displayedStudents[0] || null;

  if (!authUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen min-h-dvh bg-surface-2 text-ink flex transition-colors">
      {/* 1. Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        user={authUser}
        onLogout={handleLogout}
        balance={balance}
        pendingScheduledCount={pendingScheduledCount}
        birthdaysCount={activeBirthdaysCount}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header
          onOpenMenu={() => setSidebarOpen(true)}
          balance={balance}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          user={authUser}
          onLogout={handleLogout}
        />

        <main className="p-3 sm:p-5 lg:p-6 w-full space-y-4">
          <Routes>
            {/* 1. SMS Delivery */}
            <Route
              path="/"
              element={<Navigate to="/delivery" replace />}
            />
            <Route
              path="/delivery"
              element={
                <>
                  {/* 3. Class & Section Filter Section */}
                  <FilterSection
                    classes={classes}
                    selectedClassId={selectedClassId}
                    selectedSectionId={selectedSectionId}
                    onClassChange={handleClassChange}
                    onSectionChange={handleSectionChange}
                    onLoadStudents={handleLoadFromDropdown}
                    alertSentToText={targetGroupSummary}
                    totalLoadedStudents={displayedStudents.length}
                    isLoading={isLoadingStudents}
                  />

                  {/* 4. Group Shifter (Left) & Compact Message Composer (Right) */}
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    {/* Left: Small Group Shifter */}
                    <div className="lg:w-[374px] min-w-[374px] shrink-0 flex flex-col">
                      <GroupShifter
                        availableGroups={availableGroups}
                        destinationGroups={destinationGroups}
                        onTransferToDestination={handleTransferToDestination}
                        onTransferToAvailable={handleTransferToAvailable}
                        onTransferAllToDestination={handleTransferAllToDestination}
                        onTransferAllToAvailable={handleTransferAllToAvailable}
                        onOpenCustomGroupModal={() => setIsCustomGroupModalOpen(true)}
                      />
                    </div>

                    {/* Right: Compact Message Composer */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <MessageComposer
                        message={message}
                        onChangeMessage={setMessage}
                        templates={templates}
                        selectedTemplateId={selectedTemplateId}
                        onSelectTemplate={handleSelectTemplate}
                        metrics={metrics}
                        totalRecipients={selectedStudentIds.size}
                        sampleStudentName={sampleStudent?.name}
                        onOpenPhonePreview={() => setIsPhonePreviewOpen(true)}
                      />
                    </div>
                  </div>

                  {/* 6. Sticky Action Bar */}
                  <ActionBar
                    onSearchClick={() => {
                      const el = document.getElementById('class-select');
                      el?.focus();
                    }}
                    onResetClick={handleReset}
                    onSendClick={() => setIsSendConfirmOpen(true)}
                    onTestSendClick={() => setIsTestSmsOpen(true)}
                    totalRecipientsSelected={selectedStudentIds.size}
                    isMessageEmpty={!message.trim()}
                    totalSmsCost={metrics.totalSmsCost}
                  />

                  {/* 7. Student Table */}
                  <StudentTable
                    students={filteredStudents}
                    selectedStudentIds={selectedStudentIds}
                    onToggleStudent={handleToggleStudent}
                    onToggleSelectAll={handleToggleSelectAll}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onQuickSendSingle={(student) => {
                      setSingleStudentForTest(student);
                      setIsTestSmsOpen(true);
                    }}
                  />
                </>
              }
            />

            {/* 2. Scheduled Messages */}
            <Route
              path="/scheduler"
              element={
                <ScheduledMessagesPage
                  onNavigate={handleNavigate}
                  onRefreshParent={fetchPendingScheduledCount}
                />
              }
            />
            <Route path="/scheduled-messages" element={<Navigate to="/scheduler" replace />} />

            {/* 3. Birthdays */}
            <Route
              path="/birthdays"
              element={
                <BirthdaysPage
                  classes={classes}
                  onNavigate={handleNavigate}
                  onRefreshBalance={fetchBalance}
                />
              }
            />

            {/* 4. Custom Groups */}
            <Route
              path="/custom-groups"
              element={
                <CustomGroupsPage
                  classes={classes}
                  students={students}
                  customGroups={customGroups}
                  onCreateCustomGroup={handleCreateCustomGroup}
                  onUpdateCustomGroup={handleUpdateCustomGroup}
                  onDeleteCustomGroup={handleDeleteCustomGroup}
                  onNavigate={handleNavigate}
                />
              }
            />

            {/* 5. SMS Templates */}
            <Route
              path="/templates"
              element={
                <TemplatesPage
                  templates={templates}
                  onAddTemplate={(tpl) => setTemplates((prev) => [tpl, ...prev])}
                  onDeleteTemplate={(id) => setTemplates((prev) => prev.filter((t) => t.id !== id))}
                  onApplyTemplate={(tpl) => {
                    handleSelectTemplate(tpl.id);
                    handleNavigate('delivery');
                  }}
                  onNavigate={handleNavigate}
                />
              }
            />

            {/* 6. Message Delivery Status */}
            <Route
              path="/status"
              element={
                <StatusPage
                  classes={classes}
                  customGroups={customGroups}
                />
              }
            />

            {/* 7. Broadcast Delivery Logs */}
            <Route
              path="/logs"
              element={
                <BroadcastLogsPage
                  records={historyRecords}
                  onRefresh={fetchHistory}
                  isLoading={isLoadingHistory}
                  onNavigate={handleNavigate}
                  onReuseMessage={(msg) => {
                    setMessage(msg);
                    handleNavigate('delivery');
                  }}
                />
              }
            />
            <Route path="/broadcast-logs" element={<Navigate to="/logs" replace />} />

            {/* 8. Settings: SMS Gateway */}
            <Route
              path="/settings/sms-gateway"
              element={<SmsGatewayPage onGatewayChanged={fetchBalance} user={authUser} />}
            />
            <Route path="/sms-gateway" element={<Navigate to="/settings/sms-gateway" replace />} />

            {/* 9. Settings: Birthday Scheduler */}
            <Route
              path="/settings/birthday"
              element={
                <BirthdaySettingsPage
                  onNavigate={handleNavigate}
                  onRefreshBalance={fetchBalance}
                />
              }
            />
            <Route path="/birthday-settings" element={<Navigate to="/settings/birthday" replace />} />
            <Route path="/settings/birthday-settings" element={<Navigate to="/settings/birthday" replace />} />

            {/* 10. Settings: System Messages */}
            <Route
              path="/settings/system-messages"
              element={<SystemMessagesPage onNavigate={handleNavigate} />}
            />
            <Route path="/system-messages" element={<Navigate to="/settings/system-messages" replace />} />

            {/* 11. Settings: Database Indexer */}
            <Route
              path="/settings/database-indexer"
              element={<DatabaseIndexerPage onNavigate={handleNavigate} />}
            />
            <Route path="/database-indexer" element={<Navigate to="/settings/database-indexer" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/delivery" replace />} />
          </Routes>

          {/* 8. Footer Ribbon */}
          <div className="pt-4 pb-2 text-center text-xs text-ink-faint">
            British Standard School &bull; SMS Message Delivery System
          </div>

        </main>
      </div>

      {/* Modals */}
      <PhonePreviewModal
        isOpen={isPhonePreviewOpen}
        onClose={() => setIsPhonePreviewOpen(false)}
        message={message}
        sampleStudentName={sampleStudent?.name}
      />

      <SendConfirmModal
        isOpen={isSendConfirmOpen}
        onClose={() => setIsSendConfirmOpen(false)}
        message={message}
        targetGroupSummary={targetGroupSummary}
        selectedStudents={selectedStudentsList}
        metrics={metrics}
        onSendSuccess={handleSendSuccess}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={historyRecords}
        onRefresh={fetchHistory}
        isLoading={isLoadingHistory}
      />

      <TemplateManagerModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        templates={templates}
        onRefreshTemplates={fetchTemplates}
        onApplyTemplate={(tpl) => {
          setSelectedTemplateId(tpl.id);
          setMessage(tpl.body);
        }}
      />

      <TestSmsModal
        isOpen={isTestSmsOpen}
        onClose={() => {
          setIsTestSmsOpen(false);
          setSingleStudentForTest(null);
        }}
        message={
          singleStudentForTest
            ? message
              .replace(/{StudentName}/g, singleStudentForTest.name)
              .replace(/{StudentID}/g, singleStudentForTest.id)
              .replace(/{Class}/g, singleStudentForTest.className)
              .replace(/{Section}/g, singleStudentForTest.section)
              .replace(/{Roll}/g, singleStudentForTest.roll || '01')
            : message
        }
      />

      <CustomGroupModal
        isOpen={isCustomGroupModalOpen}
        onClose={() => setIsCustomGroupModalOpen(false)}
        classes={classes}
        students={students}
        customGroups={customGroups}
        onCreateCustomGroup={handleCreateCustomGroup}
        onUpdateCustomGroup={handleUpdateCustomGroup}
        onDeleteCustomGroup={handleDeleteCustomGroup}
        initialSelectedClassId={selectedClassId}
        initialSelectedSectionId={selectedSectionId}
      />

      {/* Global Toast Alerts */}
      <Toaster />

    </div>
  );
}

export default App;
