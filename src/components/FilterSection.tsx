import React from 'react';
import { ChevronDown, Users } from 'lucide-react';
import type { ClassInfo, SectionInfo } from '../types';

interface FilterSectionProps {
  classes: ClassInfo[];
  selectedClassId: string;
  selectedSectionId: string;
  onClassChange: (classId: string) => void;
  onSectionChange: (sectionId: string) => void;
  onLoadStudents: () => void;
  alertSentToText: string;
  totalLoadedStudents: number;
  isLoading: boolean;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  classes,
  selectedClassId,
  selectedSectionId,
  onClassChange,
  onSectionChange,
  onLoadStudents,
  alertSentToText: _alertSentToText,
  totalLoadedStudents: _totalLoadedStudents,
  isLoading,
}) => {
  const currentClass = classes.find((c) => c.id === selectedClassId);
  const sections: SectionInfo[] = currentClass ? currentClass.sections : [];

  return (
    <div className="card p-4! sm:p-5! border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card transition-colors">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full">

        {/* Class Field */}
        <div className="flex flex-col flex-1 min-w-0">
          <label
            htmlFor="class-select"
            className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none"
          >
            Class
          </label>
          <div className="relative w-full">
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => onClassChange(e.target.value)}
              className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer transition-colors"
            >
              <option value="" disabled>Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          </div>
        </div>

        {/* Section Field */}
        <div className="flex flex-col flex-1 min-w-0">
          <label
            htmlFor="section-select"
            className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none"
          >
            Section
          </label>
          <div className="relative w-full">
            <select
              id="section-select"
              value={selectedSectionId}
              onChange={(e) => onSectionChange(e.target.value)}
              disabled={!selectedClassId || sections.length === 0}
              className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer disabled:opacity-50 transition-colors"
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          </div>
        </div>

        {/* Load Students Button */}
        <button
          type="button"
          onClick={onLoadStudents}
          disabled={isLoading}
          className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm rounded-full shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
          title="Load matching students from dropdown"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Users className="w-3.5 h-3.5" />
          )}
          <span>Load</span>
        </button>

      </div>
    </div>
  );
};
