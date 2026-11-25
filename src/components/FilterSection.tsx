import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Users, Check } from 'lucide-react';
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
  const currentSection = sections.find((s) => s.id === selectedSectionId);

  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(false);

  const classDropdownRef = useRef<HTMLDivElement>(null);
  const sectionDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target as Node)) {
        setIsClassOpen(false);
      }
      if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(e.target as Node)) {
        setIsSectionOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsClassOpen(false);
        setIsSectionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="card p-4! sm:p-5! border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card transition-colors relative z-20">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full">

        {/* Class Field with 260px fixed height scrollable dropdown */}
        <div ref={classDropdownRef} className="flex flex-col flex-1 min-w-0 relative">
          <label
            htmlFor="class-select"
            className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none"
          >
            Class
          </label>
          <div className="relative w-full">
            <button
              id="class-select"
              type="button"
              onClick={() => {
                setIsClassOpen(!isClassOpen);
                setIsSectionOpen(false);
              }}
              className={`w-full bg-surface-2 border text-ink text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none flex items-center justify-between cursor-pointer transition-colors shadow-2xs select-none ${
                isClassOpen
                  ? 'border-[#1b1e42] dark:border-accent ring-1 ring-[#1b1e42]/20 dark:ring-accent/20'
                  : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
              }`}
              aria-haspopup="listbox"
              aria-expanded={isClassOpen}
            >
              <span className={currentClass ? 'text-ink font-semibold truncate' : 'text-ink-muted truncate'}>
                {currentClass ? currentClass.name : 'Select Class'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-ink-muted transition-transform duration-200 shrink-0 ml-2 ${
                  isClassOpen ? 'rotate-180 text-ink' : ''
                }`}
              />
            </button>

            {/* 260px fixed height scrollable dropdown menu */}
            {isClassOpen && (
              <div
                role="listbox"
                className="absolute top-full left-0 right-0 mt-1.5 h-[260px] bg-surface border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl p-1.5 overflow-y-auto space-y-0.5 z-50 group-shifter-box"
              >
                {classes.length === 0 ? (
                  <div className="text-xs text-ink-muted text-center py-10 italic">
                    No classes available
                  </div>
                ) : (
                  classes.map((c) => {
                    const isSelected = c.id === selectedClassId;
                    return (
                      <div
                        key={c.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onClassChange(c.id);
                          setIsClassOpen(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-colors select-none flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1b1e42] dark:bg-accent text-white font-semibold shadow-2xs'
                            : 'text-ink hover:bg-surface-2'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section Field */}
        <div ref={sectionDropdownRef} className="flex flex-col flex-1 min-w-0 relative">
          <label
            htmlFor="section-select"
            className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none"
          >
            Section
          </label>
          <div className="relative w-full">
            <button
              id="section-select"
              type="button"
              disabled={!selectedClassId || sections.length === 0}
              onClick={() => {
                if (!selectedClassId || sections.length === 0) return;
                setIsSectionOpen(!isSectionOpen);
                setIsClassOpen(false);
              }}
              className={`w-full bg-surface-2 border text-ink text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none flex items-center justify-between cursor-pointer transition-colors shadow-2xs select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                isSectionOpen
                  ? 'border-[#1b1e42] dark:border-accent ring-1 ring-[#1b1e42]/20 dark:ring-accent/20'
                  : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
              }`}
              aria-haspopup="listbox"
              aria-expanded={isSectionOpen}
            >
              <span className={currentSection ? 'text-ink font-semibold truncate' : 'text-ink-muted truncate'}>
                {currentSection ? currentSection.name : 'Select Section'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-ink-muted transition-transform duration-200 shrink-0 ml-2 ${
                  isSectionOpen ? 'rotate-180 text-ink' : ''
                }`}
              />
            </button>

            {/* Scrollable dropdown menu for sections */}
            {isSectionOpen && (
              <div
                role="listbox"
                className="absolute top-full left-0 right-0 mt-1.5 max-h-[260px] bg-surface border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl p-1.5 overflow-y-auto space-y-0.5 z-50 group-shifter-box"
              >
                {sections.length === 0 ? (
                  <div className="text-xs text-ink-muted text-center py-6 italic">
                    No sections available
                  </div>
                ) : (
                  sections.map((s) => {
                    const isSelected = s.id === selectedSectionId;
                    return (
                      <div
                        key={s.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onSectionChange(s.id);
                          setIsSectionOpen(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-colors select-none flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1b1e42] dark:bg-accent text-white font-semibold shadow-2xs'
                            : 'text-ink hover:bg-surface-2'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
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
