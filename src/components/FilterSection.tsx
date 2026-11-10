import React from 'react';
import { ChevronRight, Users, FolderPlus } from 'lucide-react';
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
  alertSentToText,
  totalLoadedStudents,
  isLoading,
}) => {
  const currentClass = classes.find((c) => c.id === selectedClassId);
  const sections: SectionInfo[] = currentClass ? currentClass.sections : [];

  return (
    <div className="bg-[#fafafa] border border-gray-300 rounded-xl px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">

      {/* Dropdowns & Load Button */}
      <div className="flex flex-wrap items-center gap-2.5">

        {/* Class Select */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="class-select" className="text-xs font-semibold text-gray-700 whitespace-nowrap">
            Class:
          </label>
          <div className="relative">
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => onClassChange(e.target.value)}
              className="bg-white border border-gray-300 hover:border-gray-400 focus:border-[#1b1e42] rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-gray-800 appearance-none cursor-pointer focus:outline-none w-40 sm:w-44 shadow-2xs"
            >
              <option value="" disabled>Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 rotate-90 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Section Select */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="section-select" className="text-xs font-semibold text-gray-700 whitespace-nowrap">
            Section:
          </label>
          <div className="relative">
            <select
              id="section-select"
              value={selectedSectionId}
              onChange={(e) => onSectionChange(e.target.value)}
              disabled={!selectedClassId || sections.length === 0}
              className="bg-white border border-gray-300 hover:border-gray-400 focus:border-[#1b1e42] rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-gray-800 appearance-none cursor-pointer focus:outline-none w-36 sm:w-40 disabled:opacity-50 shadow-2xs"
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 rotate-90 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Load Students Button (#1b1e42) */}
        <button
          type="button"
          onClick={onLoadStudents}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1b1e42] hover:bg-[#d91920] text-white font-medium text-xs rounded-lg transition cursor-pointer disabled:opacity-50 ml-1 shadow-xs active:scale-95"
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-[#1b1e42] font-semibold text-xs rounded-lg border border-gray-300 transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
          title="Create or add this Class & Section to a Custom Group"
        >
          <FolderPlus className="w-3.5 h-3.5 text-[#1b1e42]" />
          <span>Add to Custom Group</span>
        </button>

      </div>

      {/* Target Status & Loaded Count */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-600 font-medium">Target:</span>
        <span className="font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-300 shadow-2xs">
          {alertSentToText || 'None'}
        </span>
        <span className="text-gray-400">&bull;</span>
        <span className="text-gray-600">
          <strong>{totalLoadedStudents}</strong> students
        </span>
      </div>

    </div>
  );
};
