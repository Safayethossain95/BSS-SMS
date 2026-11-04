import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Search
} from 'lucide-react';
import type { SentBroadcastRecord } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SentBroadcastRecord[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  records,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredRecords = records.filter(
    (r) =>
      r.className.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.section.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.message.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const exportToCSV = (record: SentBroadcastRecord) => {
    const rows = [
      ['Student Name', 'Mobile', 'Status', 'Timestamp'],
      ...record.recipients.map((r) => [r.name, r.mobile, r.status, record.timestamp]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `sms-report-${record.className}-${record.section}-${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="relative bg-slate-100 border border-slate-300 rounded-2xl p-5 max-w-2xl w-full shadow-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">SMS Delivery Logs</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="my-3 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No broadcast records found.
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isExpanded = expandedId === record.id;
              return (
                <div
                  key={record.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden text-xs"
                >
                  <div
                    onClick={() => toggleExpand(record.id)}
                    className="p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-100/70 transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{record.className} &bull; {record.section}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                          {record.status}
                        </span>
                      </div>
                      <div className="text-slate-500 truncate max-w-sm mt-0.5 font-mono text-[11px]">
                        "{record.message}"
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right text-[11px] text-slate-500">
                        <div>{record.totalRecipients} recipients</div>
                        <div className="text-[10px] text-slate-400">{record.timestamp}</div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="p-3 border-t border-slate-200 bg-white space-y-2.5">
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
                        {record.message}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-semibold text-slate-700 text-xs">
                          Recipients ({record.recipients.length}):
                        </span>
                        <button
                          type="button"
                          onClick={() => exportToCSV(record)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export CSV</span>
                        </button>
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1">
                        {record.recipients.map((rec, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 border border-slate-100 text-[11px]"
                          >
                            <span className="font-medium text-slate-800">{rec.name}</span>
                            <span className="font-mono text-slate-500">{rec.mobile}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
