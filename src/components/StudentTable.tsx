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
    <div className="bg-[#fafafa] border border-gray-300 rounded-xl shadow-xs overflow-hidden">
      
      {/* Top Filter Bar: Select All + Search */}
      <div className="p-3 border-b border-gray-300 bg-[#f3f4f6] flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-800">
          <input
            type="checkbox"
            ref={selectAllRef}
            checked={isAllSelected}
            onChange={onToggleSelectAll}
            disabled={students.length === 0}
            className="w-4 h-4 rounded text-gray-600 focus:ring-gray-300 border-gray-300 cursor-pointer accent-gray-500"
          />
          <span>Select All</span>
          <span className="text-gray-500 font-normal">
            ({selectedStudentIds.size}/{students.length})
          </span>
        </label>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search students..."
            className="w-full bg-white border border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-200/90 text-[11px] font-semibold text-gray-700 uppercase">
              <th scope="col" className="w-12 px-3 py-2.5 text-center">
                Select
              </th>
              <th scope="col" className="px-3 py-2.5">
                HEADERID
              </th>
              <th scope="col" className="px-3 py-2.5">
                ID
              </th>
              <th scope="col" className="px-3 py-2.5">
                NAME
              </th>
              <th scope="col" className="px-3 py-2.5">
                MOBILE
              </th>
              <th scope="col" className="px-3 py-2.5">
                SECTION
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-xs bg-white">
                  No students loaded. Shift a group to Destination or select a class &amp; section above and click "Load".
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                const isSelected = selectedStudentIds.has(student.id);
                return (
                  <tr
                    key={student.id}
                    onClick={() => onToggleStudent(student.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-gray-200/80 hover:bg-gray-200'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-gray-100/70'
                        : 'bg-[#fcfcfc] hover:bg-gray-100/70'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleStudent(student.id)}
                        className="w-4 h-4 rounded text-gray-600 focus:ring-gray-300 border-gray-300 cursor-pointer accent-gray-500"
                      />
                    </td>

                    {/* HEADERID */}
                    <td className="px-3 py-2 font-mono text-gray-600">
                      {student.headerId}
                    </td>

                    {/* ID */}
                    <td className="px-3 py-2 font-mono font-medium text-gray-900">
                      <div className="flex items-center gap-1">
                        <span>{student.id}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(student.id, `id-${student.id}`);
                          }}
                          className="p-0.5 text-gray-400 hover:text-gray-600"
                          title="Copy ID"
                        >
                          {copiedId === `id-${student.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* NAME */}
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {student.name}
                    </td>

                    {/* MOBILE */}
                    <td className="px-3 py-2 font-mono text-gray-800">
                      <div className="flex items-center gap-1">
                        <span>{formatPhoneNumber(student.mobile)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(student.mobile, `phone-${student.id}`);
                          }}
                          className="p-0.5 text-gray-400 hover:text-gray-600"
                          title="Copy Mobile"
                        >
                          {copiedId === `phone-${student.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* SECTION */}
                    <td className="px-3 py-2 text-gray-600">
                      {student.section}
                    </td>

                    {/* Action */}
                    <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onQuickSendSingle(student)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-[11px] font-medium transition cursor-pointer shadow-2xs border border-gray-300"
                        title="Send SMS to this student"
                      >
                        <Send className="w-2.5 h-2.5 text-gray-600" />
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

    </div>
  );
};
