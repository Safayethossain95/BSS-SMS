import React, { useState } from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="relative bg-slate-100 border border-slate-300 rounded-2xl p-5 max-w-md w-full shadow-xl space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-slate-900">Add Student</h3>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="new-student-class" className="block text-xs font-semibold text-slate-700 mb-1">
                Class:
              </label>
              <select
                id="new-student-class"
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b1e42]"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="new-student-section" className="block text-xs font-semibold text-slate-700 mb-1">
                Section:
              </label>
              <select
                id="new-student-section"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b1e42]"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="new-student-header-id" className="block text-xs font-semibold text-slate-700 mb-1">
                HEADER ID:
              </label>
              <input
                id="new-student-header-id"
                type="text"
                value={headerId}
                onChange={(e) => setHeaderId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#1b1e42]"
              />
            </div>

            <div>
              <label htmlFor="new-student-id" className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID:
              </label>
              <input
                id="new-student-id"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#1b1e42]"
                required
              />
            </div>

            <div>
              <label htmlFor="new-student-roll" className="block text-xs font-semibold text-slate-700 mb-1">
                Roll No:
              </label>
              <input
                id="new-student-roll"
                type="text"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#1b1e42]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-student-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Student Full Name:
            </label>
            <input
              id="new-student-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 uppercase focus:outline-none focus:border-[#1b1e42]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="new-student-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number:
              </label>
              <input
                id="new-student-phone"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="8801749421005"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#1b1e42]"
                required
              />
            </div>

            <div>
              <label htmlFor="new-student-guardian" className="block text-xs font-semibold text-slate-700 mb-1">
                Guardian Name:
              </label>
              <input
                id="new-student-guardian"
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b1e42]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#1b1e42] hover:bg-[#d91920] text-white text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
