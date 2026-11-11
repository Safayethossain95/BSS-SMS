import { useState, useEffect, useMemo, useCallback } from 'react';
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

// API Services
import { academicService } from './services/academicService';
import { groupService } from './services/groupService';
import { studentService } from './services/studentService';
import { templateService } from './services/templateService';
import { smsService } from './services/smsService';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FilterSection } from './components/FilterSection';
import { GroupShifter } from './components/GroupShifter';
import { MessageComposer } from './components/MessageComposer';
import { StudentTable } from './components/StudentTable';
import { ActionBar } from './components/ActionBar';
import { LoginPage } from './components/LoginPage';

// Pages
import { CustomGroupsPage } from './pages/CustomGroupsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { BroadcastLogsPage } from './pages/BroadcastLogsPage';
import { StudentsPage } from './pages/StudentsPage';
import { AddStudentPage } from './pages/AddStudentPage';

// Modals
import { PhonePreviewModal } from './components/PhonePreviewModal';
import { SendConfirmModal } from './components/SendConfirmModal';
import { HistoryModal } from './components/HistoryModal';
import { TemplateManagerModal } from './components/TemplateManagerModal';
import { TestSmsModal } from './components/TestSmsModal';
import { AddStudentModal } from './components/AddStudentModal';
import { CustomGroupModal } from './components/CustomGroupModal';

export function App() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [historyRecords, setHistoryRecords] = useState<SentBroadcastRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

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
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
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

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1350;
    }
    return false;
  });

  // Active Navigation Page
  const [currentPage, setCurrentPage] = useState<AppPage>('delivery');

  // Custom Groups State
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>(() => {
    const saved = localStorage.getItem('bss_sms_custom_groups');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bss_sms_custom_groups', JSON.stringify(customGroups));
  }, [customGroups]);

  // Initial Data Fetching from ASP.NET Core 10 Web API
  const fetchClasses = useCallback(async () => {
    try {
      const data = await academicService.getClassesWithSections();
      setClasses(data);
      if (data.length > 0) {
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
      setAvailableGroups(data);
    } catch (err) {
      console.error('Failed to load recipient groups:', err);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await templateService.getTemplates();
      setTemplates(data);
      if (data.length > 0 && !selectedTemplateId) {
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

  useEffect(() => {
    fetchClasses();
    fetchGroups();
    fetchTemplates();
    fetchBalance();
    fetchHistory();
  }, [fetchClasses, fetchGroups, fetchTemplates, fetchBalance, fetchHistory]);

  // Sync custom groups into available groups list
  useEffect(() => {
    const customNames = customGroups.map((cg) => cg.name);
    setAvailableGroups((prev) => {
      const activeInDest = new Set(destinationGroups);
      const existingInAvail = new Set(prev);
      const toAdd = customNames.filter((name) => !activeInDest.has(name) && !existingInAvail.has(name));
      return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
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
      setDisplayedStudents(resolved);
      setSelectedStudentIds(new Set(resolved.map((s) => s.id)));
    } catch (err) {
      console.error('Failed to resolve recipients from destination groups:', err);
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
    setIsLoadingStudents(true);
    try {
      const loaded = await studentService.getStudentsByClassAndSection(
        selectedClassId,
        selectedSectionId || undefined
      );
      setDisplayedStudents(loaded);
      setSelectedStudentIds(new Set(loaded.map((s) => s.id)));
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

  const handleSendSuccess = () => {
    // Re-fetch real balance and updated history from SQL Server
    fetchBalance();
    fetchHistory();
  };

  const selectedStudentsList = useMemo(() => {
    return displayedStudents.filter((s) => selectedStudentIds.has(s.id));
  }, [displayedStudents, selectedStudentIds]);

  const alertSentToText = useMemo(() => {
    if (destinationGroups.length > 0) {
      return destinationGroups.join(', ');
    }
    const currentCls = classes.find((c) => c.id === selectedClassId);
    const currentSec = currentCls?.sections.find((s) => s.id === selectedSectionId);
    if (currentCls && currentSec) {
      return `${currentCls.name} - ${currentSec.name}`;
    }
    return '';
  }, [classes, selectedClassId, selectedSectionId, destinationGroups]);

  const sampleStudent = displayedStudents[0] || {
    headerId: '1',
    id: '2606093807',
    name: 'Julaybib Muhammad',
    mobile: '8801749421005',
    className: 'Play Group',
    section: 'Starter',
    roll: '01',
    status: 'active' as const,
  };

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
    <div className={`app-shell ${isDark ? 'dark' : ''}`}>

      {/* 1. Floating BSS Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        user={authUser}
        onLogout={handleLogout}
        balance={balance}
      />

      <div className="main-content">
        {/* 2. BSS Topbar */}
        <Header
          balance={balance}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenMenu={() => setSidebarOpen(true)}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={authUser}
          onLogout={handleLogout}
        />

        {/* 3. Main Page Content */}
        <main className="page-main space-y-4">

          {currentPage === 'delivery' && (
            <>
              {/* Page Head Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight mb-0.5">
                    SMS Message Delivery
                  </h1>
                  <p className="text-xs sm:text-sm text-ink-muted">
                    Broadcast notifications, attendance updates, and alerts to classes, sections, and custom student groups.
                  </p>
                </div>
                {/* 
                {safetyInfo.isSafeTestMode && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      Safe Mode Active &bull; Test Redirect: <strong>{safetyInfo.safeTestPhoneNumber}</strong>
                    </span>
                  </div>
                )} */}
              </div>

              {/* 4. Filter Section */}
              <FilterSection
                classes={classes}
                selectedClassId={selectedClassId}
                selectedSectionId={selectedSectionId}
                onClassChange={handleClassChange}
                onSectionChange={handleSectionChange}
                onLoadStudents={handleLoadFromDropdown}
                onAddToCustomGroup={() => setCurrentPage('custom-groups')}
                alertSentToText={alertSentToText}
                totalLoadedStudents={displayedStudents.length}
                isLoading={isLoadingStudents}
              />

              {/* 5. Group Shifter (Left) & Compact Message Composer (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

                {/* Left: Small Group Shifter */}
                <div className="lg:col-span-5 flex flex-col">
                  <GroupShifter
                    availableGroups={availableGroups}
                    destinationGroups={destinationGroups}
                    onTransferToDestination={handleTransferToDestination}
                    onTransferToAvailable={handleTransferToAvailable}
                    onTransferAllToDestination={handleTransferAllToDestination}
                    onTransferAllToAvailable={handleTransferAllToAvailable}
                    onOpenCustomGroupModal={() => setCurrentPage('custom-groups')}
                  />
                </div>

                {/* Right: Compact Message Composer */}
                <div className="lg:col-span-7 flex flex-col">
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

              {/* 6. Action Bar */}
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
          )}

          {currentPage === 'custom-groups' && (
            <CustomGroupsPage
              classes={classes}
              students={students}
              customGroups={customGroups}
              onCreateCustomGroup={handleCreateCustomGroup}
              onUpdateCustomGroup={handleUpdateCustomGroup}
              onDeleteCustomGroup={handleDeleteCustomGroup}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'templates' && (
            <TemplatesPage
              templates={templates}
              onAddTemplate={(tpl) => setTemplates((prev) => [tpl, ...prev])}
              onDeleteTemplate={(id) => setTemplates((prev) => prev.filter((t) => t.id !== id))}
              onApplyTemplate={(tpl) => handleSelectTemplate(tpl.id)}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'logs' && (
            <BroadcastLogsPage
              records={historyRecords}
              onRefresh={fetchHistory}
              isLoading={isLoadingHistory}
              onNavigate={setCurrentPage}
              onReuseMessage={(msg) => setMessage(msg)}
            />
          )}

          {currentPage === 'students' && (
            <StudentsPage
              students={students}
              classes={classes}
              selectedClassId={selectedClassId}
              selectedSectionId={selectedSectionId}
              onClassChange={handleClassChange}
              onSectionChange={handleSectionChange}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'add-student' && (
            <AddStudentPage
              classes={classes}
              onAddStudent={(newStudent) => {
                setStudents((prev) => [newStudent, ...prev]);
                setDisplayedStudents((prev) => [newStudent, ...prev]);
              }}
              onNavigate={setCurrentPage}
            />
          )}

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

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        classes={classes}
        onAddStudent={(newStudent) => {
          setStudents((prev) => [newStudent, ...prev]);
          setDisplayedStudents((prev) => [newStudent, ...prev]);
          setSelectedStudentIds((prev) => new Set(prev).add(newStudent.id));
        }}
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

    </div>
  );
}

export default App;
