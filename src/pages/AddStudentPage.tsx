import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import type { ClassInfo, Student, AppPage } from '../types';

interface AddStudentPageProps {
  classes: ClassInfo[];
  onAddStudent: (student: Student) => void;
  onNavigate: (page: AppPage) => void;
}

export const AddStudentPage: React.FC<AddStudentPageProps> = ({
  classes,
  onAddStudent,
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [headerId, setHeaderId] = useState(`29${Math.floor(100 + Math.random() * 900)}`);
  const [mobile, setMobile] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState(classes[0]?.sections[0]?.id || '');
  const [roll, setRoll] = useState('10');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [successMessage, setSuccessMessage] = useState(false);

  const currentClass = classes.find((c) => c.id === selectedClassId);
  const sections = currentClass?.sections || [];

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const cls = classes.find((c) => c.id === classId);
    if (cls && cls.sections.length > 0) {
      setSelectedSectionId(cls.sections[0].id);
    } else {
      setSelectedSectionId('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim() || !mobile.trim()) return;

    const chosenClass = classes.find((c) => c.id === selectedClassId);
    const chosenSection = chosenClass?.sections.find((s) => s.id === selectedSectionId);

    const newStudent: Student = {
      headerId: headerId.trim() || `28${Math.floor(100 + Math.random() * 900)}`,
      id: studentId.trim(),
      name: name.trim().toUpperCase(),
      mobile: mobile.trim(),
      guardianName: guardianName.trim() || 'Parent/Guardian',
      className: chosenClass ? chosenClass.name : 'Play Group',
      section: chosenSection ? chosenSection.name : 'Starter',
      roll: roll.trim(),
      status,
    };

    onAddStudent(newStudent);
    setSuccessMessage(true);

    // Reset inputs
    setName('');
    setStudentId('');
    setMobile('');
    setGuardianName('');
    setHeaderId(`29${Math.floor(100 + Math.random() * 900)}`);

    setTimeout(() => {
      setSuccessMessage(false);
    }, 4000);
  };

  return (
    <div className="space-y-4">
      {/* Page Head Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight mb-0.5">
            Add New Student
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Enroll student profile and mobile contacts into Campus 4 SMS broadcast database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('students')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-2 hover:bg-surface text-ink font-semibold text-xs border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>View All Students</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Student record successfully enrolled in directory!</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('students')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
          >
            Go to Students Table
          </button>
        </div>
      )}

      {/* Main Grid: Form (Left) & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Left Column: Form Card */}
        <div className="lg:col-span-8">
          <div className="card !p-5 sm:!p-6 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card space-y-4">
            <div className="card-head !mb-2">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
                  <UserPlus className="w-4 h-4" />
                </span>
                <span>Student Information Form</span>
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Full Name & Student ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. TAHMID ALAM"
                    required
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                    Student ID (Unique) *
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 2606093845"
                    required
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink font-mono rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Class & Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                    Class *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors cursor-pointer"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                    Section *
                  </label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    disabled={sections.length === 0}
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Mobile & Guardian Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                    SMS Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 8801749421005"
                    required
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink font-mono rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors"
                  />
                  <span className="text-[10px] text-ink-faint mt-1 block">
                    Format: 8801XXXXXXXXX for Bangladeshi mobile networks
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                    Guardian / Father Name
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Md. Alamgir Hossain"
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 4: Roll & Header ID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                    placeholder="e.g. 05"
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink font-mono rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                    Header ID
                  </label>
                  <input
                    type="text"
                    value={headerId}
                    onChange={(e) => setHeaderId(e.target.value)}
                    placeholder="e.g. 2901"
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink font-mono rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                    Enrollment Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none cursor-pointer"
                  >
                    <option value="active">Active (Receives SMS)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!name.trim() || !studentId.trim() || !mobile.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm shadow-sm active:scale-[0.98] transition cursor-pointer disabled:opacity-50 select-none"
                >
                  <Check className="w-4 h-4" />
                  <span>Enroll Student to SMS Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card !p-5 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Live Student Record Preview</span>
            </div>

            <div className="p-4 bg-surface-2/60 border border-gray-200 dark:border-zinc-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface text-ink border border-gray-200 dark:border-zinc-800">
                  {status.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono text-ink-muted">
                  Roll: {roll || '—'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-ink">
                  {name || 'STUDENT NAME'}
                </h4>
                <div className="text-xs text-ink-muted mt-0.5">
                  ID: <span className="font-mono font-medium text-ink">{studentId || '260609XXXX'}</span>
                </div>
              </div>

              <div className="text-xs space-y-1 pt-2 border-t border-gray-200 dark:border-zinc-800">
                <div className="flex justify-between">
                  <span className="text-ink-faint">Class:</span>
                  <span className="font-semibold text-ink">{currentClass?.name || 'Class'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint">Section:</span>
                  <span className="font-semibold text-ink">
                    {sections.find((s) => s.id === selectedSectionId)?.name || 'Section'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint">Mobile:</span>
                  <span className="font-mono font-semibold text-ink">{mobile || '8801XXXXXXXXX'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint">Guardian:</span>
                  <span className="text-ink truncate max-w-[130px]">{guardianName || 'Parent / Guardian'}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-ink-faint leading-relaxed">
              Once enrolled, this student will immediately be available in Class &amp; Section filters, Custom Groups, and targeted SMS broadcasts.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
