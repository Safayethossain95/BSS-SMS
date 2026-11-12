import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Send,
  ChevronDown,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import type { Student, ClassInfo, AppPage } from '../types';

interface StudentsPageProps {
  students: Student[];
  classes: ClassInfo[];
  selectedClassId: string;
  selectedSectionId: string;
  onClassChange: (clsId: string) => void;
  onSectionChange: (secId: string) => void;
  onNavigate: (page: AppPage) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  students,
  classes,
  selectedClassId,
  selectedSectionId,
  onClassChange,
  onSectionChange,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Filter sections for current selected class
  const currentClass = classes.find((c) => c.id === selectedClassId);
  const sections = currentClass ? currentClass.sections : [];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Class filter
      if (selectedClassId) {
        const clsObj = classes.find((c) => c.id === selectedClassId);
        if (clsObj && s.className.toLowerCase() !== clsObj.name.toLowerCase()) {
          return false;
        }
      }
      // Section filter
      if (selectedSectionId) {
        const secObj = sections.find((sec) => sec.id === selectedSectionId);
        if (secObj && s.section.toLowerCase() !== secObj.name.toLowerCase()) {
          return false;
        }
      }
      // Status filter
      if (statusFilter !== 'all' && s.status !== statusFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesId = s.id.toLowerCase().includes(q);
        const matchesMobile = s.mobile.toLowerCase().includes(q);
        const matchesHeader = s.headerId.toLowerCase().includes(q);
        const matchesGuardian = s.guardianName?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesId && !matchesMobile && !matchesHeader && !matchesGuardian) {
          return false;
        }
      }
      return true;
    });
  }, [students, selectedClassId, selectedSectionId, statusFilter, searchQuery, classes, sections]);

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handleResetFilters = () => {
    onClassChange('');
    onSectionChange('');
    setStatusFilter('all');
    setSearchQuery('');
    setSelectedStudentIds(new Set());
  };

  const isAllSelected = filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length;

  return (
    <div className="space-y-4">
      {/* Page Head Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight mb-0.5">
            Students Directory
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Manage enrolled students, verify phone numbers, and inspect cohort rosters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('add-student')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs transition cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="card !p-4 sm:!p-5 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          {/* Class Selector */}
          <div className="flex flex-col min-w-[140px] flex-1 sm:flex-initial">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
              Class
            </label>
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => onClassChange(e.target.value)}
                className="w-full sm:w-44 bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer transition-colors"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            </div>
          </div>

          {/* Section Selector */}
          <div className="flex flex-col min-w-[140px] flex-1 sm:flex-initial">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
              Section
            </label>
            <div className="relative">
              <select
                value={selectedSectionId}
                onChange={(e) => onSectionChange(e.target.value)}
                disabled={!selectedClassId || sections.length === 0}
                className="w-full sm:w-40 bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer disabled:opacity-50 transition-colors"
              >
                <option value="">All Sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col min-w-[120px] flex-1 sm:flex-initial">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none">
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-36 bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <ChevronDown className="w-4 h-4 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none block">
              Search Directory
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, ID, mobile, guardian..."
                className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-colors"
              />
            </div>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface-2 hover:bg-surface-3 text-ink text-xs font-semibold rounded-xl border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs"
            title="Reset all search filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="card !p-0 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card overflow-hidden">
        {/* Table header bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
              <Users className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink">Student Roster</h3>
              <span className="text-xs text-ink-muted">
                Showing {filteredStudents.length} of {students.length} enrolled student{students.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {selectedStudentIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <span className="text-xs font-semibold text-ink px-2.5 py-1 rounded-full bg-surface-2 border border-gray-200 dark:border-zinc-800">
                {selectedStudentIds.size} selected
              </span>
              <button
                type="button"
                onClick={() => onNavigate('delivery')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent text-white text-xs font-semibold transition cursor-pointer shadow-2xs active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Compose SMS to Selection</span>
              </button>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 bg-surface-2/60 text-ink-muted text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-3.5 text-center w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#1b1e42] dark:text-accent focus:ring-accent cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Header ID</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class &amp; Section</th>
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Guardian / Mobile</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-ink-muted italic">
                    No matching students found in directory.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isSelected = selectedStudentIds.has(student.id);
                  return (
                    <tr
                      key={student.id}
                      onClick={() => handleToggleStudent(student.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-surface-2/80 font-medium'
                          : idx % 2 === 0
                          ? 'bg-surface hover:bg-surface-2/40'
                          : 'bg-surface-2/20 hover:bg-surface-2/50'
                      }`}
                    >
                      <td className="py-3 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleStudent(student.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#1b1e42] dark:text-accent focus:ring-accent cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 font-mono text-ink-muted text-xs">
                        {student.headerId}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-ink">
                        <div className="flex items-center gap-1.5">
                          <span>{student.id}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(student.id, `id-${student.id}`);
                            }}
                            className="p-1 text-ink-faint hover:text-ink rounded transition"
                            title="Copy Student ID"
                          >
                            {copiedId === `id-${student.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-ink">
                        {student.name}
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <span className="font-semibold text-ink">{student.className}</span>
                        <span className="text-ink-faint"> &bull; </span>
                        <span className="text-ink-muted">{student.section}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-ink-muted text-xs">
                        {student.roll || '-'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-xs font-mono font-medium text-ink flex items-center gap-1">
                          <span>{student.mobile}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(student.mobile, `mob-${student.id}`);
                            }}
                            className="p-1 text-ink-faint hover:text-ink rounded transition"
                            title="Copy Mobile Number"
                          >
                            {copiedId === `mob-${student.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {student.guardianName && (
                          <div className="text-[11px] text-ink-faint mt-0.5 truncate max-w-[150px]">
                            {student.guardianName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            student.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : 'bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink-muted'
                          }`}
                        >
                          {student.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer info */}
        <div className="p-3.5 border-t border-gray-200 dark:border-zinc-800 bg-surface-2/30 flex items-center justify-between text-xs text-ink-muted">
          <span>Showing {filteredStudents.length} entries</span>
          <span className="font-semibold text-ink">Campus 4 &bull; Wari Branch</span>
        </div>
      </div>
    </div>
  );
};
