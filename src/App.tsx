import { useState, useEffect, useMemo } from 'react';
import { 
  INITIAL_CLASSES, 
  INITIAL_STUDENTS, 
  INITIAL_TEMPLATES, 
  AVAILABLE_GROUPS 
} from './data/mockData';
import type { 
  Student, 
  ClassInfo, 
  SmsTemplate, 
  SentBroadcastRecord 
} from './types';
import { calculateSmsMetrics } from './utils/smsCalculator';

// Components
import { Header } from './components/Header';
import { FilterSection } from './components/FilterSection';
import { GroupShifter } from './components/GroupShifter';
import { MessageComposer } from './components/MessageComposer';
import { StudentTable } from './components/StudentTable';
import { ActionBar } from './components/ActionBar';

// Modals
import { PhonePreviewModal } from './components/PhonePreviewModal';
import { SendConfirmModal } from './components/SendConfirmModal';
import { HistoryModal } from './components/HistoryModal';
import { TemplateManagerModal } from './components/TemplateManagerModal';
import { TestSmsModal } from './components/TestSmsModal';
import { AddStudentModal } from './components/AddStudentModal';

export function App() {
  const [classes] = useState<ClassInfo[]>(INITIAL_CLASSES);
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('bss_sms_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [templates, setTemplates] = useState<SmsTemplate[]>(() => {
    const saved = localStorage.getItem('bss_sms_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [historyRecords, setHistoryRecords] = useState<SentBroadcastRecord[]>(() => {
    const saved = localStorage.getItem('bss_sms_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 'hist-init-1',
        timestamp: 'Today, 09:30 AM',
        className: 'Play Group',
        section: 'Starter',
        message: 'Dear Guardian, Please note school dismissal is at 12:30 PM today.',
        totalRecipients: 4,
        totalSmsUnits: 4,
        status: 'Delivered',
        recipients: [
          { name: 'JULAYBIB MUHAMMAD', mobile: '8801749421005', status: 'Delivered' },
          { name: 'IFZA MARIYAM ISLAM', mobile: '8801786377188', status: 'Delivered' },
          { name: 'SHAH IHAN AHMED', mobile: '8801755555338', status: 'Delivered' },
          { name: 'YAZDAAN MANZOOR', mobile: '8801613677566', status: 'Delivered' },
        ],
      },
    ];
  });

  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('bss_sms_balance');
    return saved ? Number(saved) : 4850;
  });

  // Filter States
  const [selectedClassId, setSelectedClassId] = useState<string>('play');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('starter');

  // Group Shifter (Available <-> Destination)
  const [availableGroups, setAvailableGroups] = useState<string[]>(() => [...AVAILABLE_GROUPS]);
  const [destinationGroups, setDestinationGroups] = useState<string[]>([]);

  // Table & Selection States
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);

  // Message State
  const [message, setMessage] = useState<string>(
    'Dear Guardian, Please be informed that Bona Fide School will remain closed tomorrow due to unavoidable circumstances.'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-1');

  // Modals
  const [isPhonePreviewOpen, setIsPhonePreviewOpen] = useState(false);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isTestSmsOpen, setIsTestSmsOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [singleStudentForTest, setSingleStudentForTest] = useState<Student | null>(null);

  useEffect(() => {
    localStorage.setItem('bss_sms_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('bss_sms_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('bss_sms_history', JSON.stringify(historyRecords));
  }, [historyRecords]);

  useEffect(() => {
    localStorage.setItem('bss_sms_balance', balance.toString());
  }, [balance]);

  // Load students based on destinationGroups
  const syncStudentsFromDestinationGroups = (destGroups: string[]) => {
    setIsLoadingStudents(true);
    setTimeout(() => {
      if (destGroups.length === 0) {
        setDisplayedStudents([]);
        setSelectedStudentIds(new Set());
        setIsLoadingStudents(false);
        return;
      }

      const normalized = destGroups.map((g) => g.toLowerCase().trim());
      const matched = students.filter((s) => {
        const sec = s.section.toLowerCase().trim();
        const cls = s.className.toLowerCase().trim();
        return normalized.some((g) => {
          if (sec === g || sec.includes(g) || g.includes(sec)) return true;
          if (cls === g || cls.includes(g) || g.includes(cls)) return true;
          if (g.includes('teacher') && (sec.includes('teacher') || cls.includes('teacher'))) return true;
          if (g.includes('class 1') && cls.includes('class 1')) return true;
          if (g.includes('class 2') && cls.includes('class 2')) return true;
          return false;
        });
      });

      setDisplayedStudents(matched);
      setSelectedStudentIds(new Set(matched.map((s) => s.id)));
      setIsLoadingStudents(false);
    }, 120);
  };

  useEffect(() => {
    syncStudentsFromDestinationGroups(destinationGroups);
  }, []);

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

  const handleLoadFromDropdown = () => {
    const currentCls = classes.find((c) => c.id === selectedClassId);
    const currentSec = currentCls?.sections.find((s) => s.id === selectedSectionId);
    if (currentSec) {
      const secName = currentSec.name;
      if (!destinationGroups.includes(secName)) {
        const nextDest = [...destinationGroups, secName];
        setDestinationGroups(nextDest);
        setAvailableGroups((prev) => prev.filter((g) => g !== secName));
        syncStudentsFromDestinationGroups(nextDest);
      } else {
        syncStudentsFromDestinationGroups(destinationGroups);
      }
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
        s.headerId.toLowerCase().includes(q)
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
    const isAll = filteredStudents.every((s) => selectedStudentIds.has(s.id));
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
    setAvailableGroups([...AVAILABLE_GROUPS]);
    setDisplayedStudents([]);
  };

  const handleSendSuccess = (recipients: Student[], smsBody: string) => {
    const newUnitsCost = metrics.totalSmsCost;
    setBalance((prev) => Math.max(0, prev - newUnitsCost));

    const now = new Date();
    const formattedDate = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newRecord: SentBroadcastRecord = {
      id: `hist-${Date.now()}`,
      timestamp: formattedDate,
      className: destinationGroups.join(', ') || 'Selected Groups',
      section: `${recipients.length} Students`,
      message: smsBody,
      totalRecipients: recipients.length,
      totalSmsUnits: newUnitsCost,
      status: 'Delivered',
      recipients: recipients.map((r) => ({
        name: r.name,
        mobile: r.mobile,
        status: 'Delivered',
      })),
    };

    setHistoryRecords((prev) => [newRecord, ...prev]);
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

  const sampleStudent = displayedStudents[0] || INITIAL_STUDENTS[0];

  return (
    <div className="min-h-screen bg-gray-200 text-slate-800 flex flex-col font-sans">
      
      {/* 1. Top Header */}
      <Header
        balance={balance}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenAddStudent={() => setIsAddStudentOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 space-y-3">
        
        {/* 2. Compact Dropdowns Bar */}
        <FilterSection
          classes={classes}
          selectedClassId={selectedClassId}
          selectedSectionId={selectedSectionId}
          onClassChange={handleClassChange}
          onSectionChange={handleSectionChange}
          onLoadStudents={handleLoadFromDropdown}
          alertSentToText={alertSentToText}
          totalLoadedStudents={displayedStudents.length}
          isLoading={isLoadingStudents}
        />

        {/* 3. Group Shifter (Left) & Compact Message Composer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Left: Small Group Shifter */}
          <div className="lg:col-span-5 flex flex-col">
            <GroupShifter
              availableGroups={availableGroups}
              destinationGroups={destinationGroups}
              onTransferToDestination={handleTransferToDestination}
              onTransferToAvailable={handleTransferToAvailable}
              onTransferAllToDestination={handleTransferAllToDestination}
              onTransferAllToAvailable={handleTransferAllToAvailable}
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

        {/* 4. Action Bar */}
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

        {/* 5. Student Table */}
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

      </main>

      {/* 6. Iconic Bottom Ribbon */}
      <footer className="mt-auto py-3 bg-[#fafafa] border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-1">
          <div className="relative inline-block">
            <div className="px-10 py-1 bg-[#1b2b8c] text-white font-serif italic text-lg font-bold tracking-wider rounded shadow-xs">
              bona fide
            </div>
          </div>
          <p className="text-[10px] text-gray-500 font-medium">
            SMS Message Delivery System
          </p>
        </div>
      </footer>

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
      />

      <TemplateManagerModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        templates={templates}
        onAddTemplate={(newTpl) => setTemplates((prev) => [newTpl, ...prev])}
        onDeleteTemplate={(id) => setTemplates((prev) => prev.filter((t) => t.id !== id))}
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
          const currentCls = classes.find((c) => c.id === selectedClassId);
          const currentSec = currentCls?.sections.find((s) => s.id === selectedSectionId);
          if (
            currentCls?.name.toLowerCase() === newStudent.className.toLowerCase() &&
            currentSec?.name.toLowerCase() === newStudent.section.toLowerCase()
          ) {
            setDisplayedStudents((prev) => [newStudent, ...prev]);
            setSelectedStudentIds((prev) => new Set(prev).add(newStudent.id));
          }
        }}
      />

    </div>
  );
}

export default App;
