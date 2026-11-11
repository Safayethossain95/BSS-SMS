import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Send
} from 'lucide-react';
import type { Student } from '../types';
import { formatPhoneNumber } from '../utils/smsCalculator';

interface StudentTableProps {
  students: Student[];
  selectedStudentIds: Set<string>;
  onToggleStudent: (id: string) => void;
  onToggleSelectAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onQuickSendSingle: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectedStudentIds,
  onToggleStudent,
  onToggleSelectAll,
  searchQuery,
  onSearchChange,
  onQuickSendSingle,
}) => {
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const isAllSelected = students.length > 0 && students.every((s) => selectedStudentIds.has(s.id));
  const isSomeSelected = students.some((s) => selectedStudentIds.has(s.id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <div id="students-table-section" className="card !p-0 overflow-hidden border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card transition-colors">
      
      {/* Top Filter Bar: Select All + Live Search */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-surface-2/50 flex flex-wrap items-center justify-between gap-3">
        
        {/* Select All Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-ink px-3 py-1.5 rounded-full bg-surface border border-gray-200 dark:border-zinc-800 shadow-2xs">
          <input
            type="checkbox"
            ref={selectAllRef}
            checked={isAllSelected}
            onChange={onToggleSelectAll}
            disabled={students.length === 0}
            className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#1b1e42] dark:text-accent focus:ring-accent cursor-pointer"
          />
          <span>Select All</span>
          <span className="text-ink-muted font-mono font-normal">
            ({selectedStudentIds.size}/{students.length})
          </span>
        </label>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            id="table-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search loaded students..."
            className="w-full bg-surface text-ink text-xs sm:text-sm font-medium rounded-xl pl-9 pr-3.5 py-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent outline-none shadow-2xs transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-dashed border-gray-200 dark:border-zinc-800 text-ink font-semibold bg-surface-2/60">
              <th scope="col" className="w-12 py-3 px-3.5 text-center border-r border-dashed border-gray-200 dark:border-zinc-800">
                Select
              </th>
              <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800">
                HEADER ID
              </th>
              <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800">
                STUDENT ID
              </th>
              <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800">
                STUDENT NAME
              </th>
              <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800">
                MOBILE PHONE
              </th>
              <th scope="col" className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800">
                SECTION
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center text-ink-muted text-xs bg-surface">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="font-semibold text-sm text-ink">No students currently loaded</span>
                    <span className="text-xs text-ink-muted">
                      Shift a group from Available to Destination, or select Class &amp; Section above and click &quot;Load&quot;.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                const isSelected = selectedStudentIds.has(student.id);
                return (
                  <tr
                    key={student.id}
                    onClick={() => onToggleStudent(student.id)}
                    className={`border-b border-dashed border-gray-200 dark:border-zinc-800 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-surface-2/80 font-medium'
                        : idx % 2 === 0
                        ? 'bg-surface hover:bg-surface-2/40'
                        : 'bg-surface-2/20 hover:bg-surface-2/50'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3.5 text-center border-r border-dashed border-gray-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleStudent(student.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#1b1e42] dark:text-accent focus:ring-accent cursor-pointer"
                      />
                    </td>

                    {/* HEADER ID */}
                    <td className="py-3 px-4 font-mono text-ink-muted border-r border-dashed border-gray-200 dark:border-zinc-800">
                      {student.headerId}
                    </td>

                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-medium text-ink border-r border-dashed border-gray-200 dark:border-zinc-800">
                      <div className="flex items-center gap-1">
                        <span>{student.id}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(student.id, `id-${student.id}`);
                          }}
                          className="p-1 text-ink-faint hover:text-ink rounded transition"
                          title="Copy ID"
                        >
                          {copiedId === `id-${student.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* NAME */}
                    <td className="py-3 px-4 font-medium text-ink border-r border-dashed border-gray-200 dark:border-zinc-800">
                      <div>{student.name}</div>
                      {student.guardianName && (
                        <div className="text-[11px] text-ink-faint">{student.guardianName}</div>
                      )}
                    </td>

                    {/* MOBILE */}
                    <td className="py-3 px-4 font-mono text-ink border-r border-dashed border-gray-200 dark:border-zinc-800">
                      <div className="flex items-center gap-1">
                        <span>{formatPhoneNumber(student.mobile)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(student.mobile, `phone-${student.id}`);
                          }}
                          className="p-1 text-ink-faint hover:text-ink rounded transition"
                          title="Copy Mobile"
                        >
                          {copiedId === `phone-${student.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* SECTION */}
                    <td className="py-3 px-4 border-r border-dashed border-gray-200 dark:border-zinc-800">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink">
                        {student.section}
                      </span>
                    </td>

                    {/* Action Send */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onQuickSendSingle(student)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 text-ink font-semibold text-xs border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs active:scale-[0.98]"
                        title="Send SMS to this student"
                      >
                        <Send className="w-3 h-3 text-[#1b1e42] dark:text-accent" />
                        <span>Send</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-gray-200 dark:border-zinc-800 bg-surface-2/30 flex items-center justify-between text-xs text-ink-muted">
        <div>
          Showing <strong className="text-ink">{students.length}</strong> loaded student{students.length === 1 ? '' : 's'}
        </div>
        <div className="text-ink-faint">
          Bona Fide School &bull; SMS Portal
        </div>
      </div>

    </div>
  );
};
