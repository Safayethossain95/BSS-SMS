import React, { useState } from 'react';
import { X, Plus, UserPlus } from 'lucide-react';
import type { ClassInfo, Student } from '../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassInfo[];
  onAddStudent: (student: Student) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  classes,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [headerId, setHeaderId] = useState(`29${Math.floor(100 + Math.random() * 900)}`);
  const [mobile, setMobile] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState(
    classes[0]?.sections[0]?.id || ''
  );
  const [roll, setRoll] = useState('10');

  if (!isOpen) return null;

  const currentClass = classes.find((c) => c.id === selectedClassId);
  const sections = currentClass ? currentClass.sections : [];

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const cls = classes.find((c) => c.id === classId);
    if (cls && cls.sections.length > 0) {
      setSelectedSectionId(cls.sections[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentId || !mobile) return;

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
      status: 'active',
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative bg-surface border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
              <UserPlus className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Add New Student</h3>
              <p className="text-xs text-ink-muted">Add student record into directory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-student-class" className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Class:
              </label>
              <select
                id="new-student-class"
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full bg-surface-2 border border-transparent focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium outline-none transition-colors cursor-pointer"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="new-student-section" className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Section:
              </label>
              <select
                id="new-student-section"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full bg-surface-2 border border-transparent focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium outline-none transition-colors cursor-pointer"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-student-name" className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Full Name: <span className="text-brand-red">*</span>
              </label>
              <input
                id="new-student-name"
                type="text"
                placeholder="e.g. AHMAD HOSSAIN"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-surface-2 border border-transparent focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="new-student-id" className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Student ID: <span className="text-brand-red">*</span>
              </label>
              <input
                id="new-student-id"
                type="text"
                placeholder="e.g. 2609074005"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full bg-surface-2 border border-transparent focus:border-[#1b1e42] dark:focus:border-accent text-ink font-mono rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-student-mobile" className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Mobile Number: <span className="text-brand-red">*</span>
              </label>
              <input
                id="new-student-mobile"
                type="tel"
                placeholder="e.g. 8801749421005"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="w-full bg-surface-2 border border-transparent focus:border-[#1b1e42] dark:focus:border-accent text-ink font-mono rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="new-student-guardian" className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Guardian Name:
              </label>
              <input
                id="new-student-guardian"
                type="text"
                placeholder="Parent or Guardian"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full bg-surface-2 border border-transparent focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-student-header-id" className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Header ID:
              </label>
              <input
                id="new-student-header-id"
                type="text"
                value={headerId}
                onChange={(e) => setHeaderId(e.target.value)}
                className="w-full bg-surface-2 border border-transparent focus:border-[#1b1e42] dark:focus:border-accent text-ink font-mono rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="new-student-roll" className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
                Roll:
              </label>
              <input
                id="new-student-roll"
                type="text"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                className="w-full bg-surface-2 border border-transparent focus:border-[#1b1e42] dark:focus:border-accent text-ink font-mono rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-surface-2 hover:bg-surface-3 text-ink transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save Student</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
