import React from 'react';
import { ChevronDown, Users, FolderPlus } from 'lucide-react';
import type { ClassInfo, SectionInfo } from '../types';

interface FilterSectionProps {
  classes: ClassInfo[];
  selectedClassId: string;
  selectedSectionId: string;
  onClassChange: (classId: string) => void;
  onSectionChange: (sectionId: string) => void;
  onLoadStudents: () => void;
  onAddToCustomGroup: () => void;
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
  onAddToCustomGroup,
  alertSentToText: _alertSentToText,
  totalLoadedStudents: _totalLoadedStudents,
  isLoading,
}) => {
  const currentClass = classes.find((c) => c.id === selectedClassId);
  const sections: SectionInfo[] = currentClass ? currentClass.sections : [];

  return (
    <div className="card !p-4 sm:!p-5 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card transition-colors">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">

        {/* Dropdowns & Action Buttons */}
        <div className="flex flex-wrap items-end gap-3 flex-1">

          {/* Class Field */}
          <div className="flex flex-col min-w-[140px] flex-1 sm:flex-initial">
            <label
              htmlFor="class-select"
              className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none"
            >
              Class
            </label>
            <div className="relative">
              <select
                id="class-select"
                value={selectedClassId}
                onChange={(e) => onClassChange(e.target.value)}
                className="w-full sm:w-44 bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer transition-colors"
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
          <div className="flex flex-col min-w-[140px] flex-1 sm:flex-initial">
            <label
              htmlFor="section-select"
              className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none"
            >
              Section
            </label>
            <div className="relative">
              <select
                id="section-select"
                value={selectedSectionId}
                onChange={(e) => onSectionChange(e.target.value)}
                disabled={!selectedClassId || sections.length === 0}
                className="w-full sm:w-40 bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 outline-none appearance-none cursor-pointer disabled:opacity-50 transition-colors"
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
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm rounded-full shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            title="Load matching students from dropdown"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Users className="w-3.5 h-3.5" />
            )}
            <span>Load</span>
          </button>

          {/* Add to Custom Group Button */}
          <button
            type="button"
            onClick={onAddToCustomGroup}
            disabled={!selectedClassId}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface-2 hover:bg-surface-3 text-ink font-semibold text-xs sm:text-sm rounded-full border border-gray-200 dark:border-zinc-800 shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            title="Create or append this Class & Section to a Custom Group"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#1b1e42] dark:text-accent" />
            <span>Add to Custom Group</span>
          </button>

        </div>


      </div>
    </div>
  );
};
