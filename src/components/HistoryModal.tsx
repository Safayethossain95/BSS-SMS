import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Search,
  RefreshCw
} from 'lucide-react';
import type { SentBroadcastRecord } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SentBroadcastRecord[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onRefresh,
  isLoading = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredRecords = records.filter(
    (r) =>
      (r.className && r.className.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (r.section && r.section.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (r.message && r.message.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const exportToCSV = (record: SentBroadcastRecord) => {
    const recipientsList = record.recipients || [];
    const rows = [
      ['Student Name', 'Mobile', 'Status', 'Timestamp'],
      ...recipientsList.map((r) => [r.name, r.mobile, r.status, record.timestamp]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `sms-report-${record.className || 'batch'}-${Date.now()}.csv`
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
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">SMS Delivery Logs</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              MESSAGE_ALERT_MASTER
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1.5 text-slate-500 hover:text-[#1b1e42] rounded-lg hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
                title="Refresh logs from SQL Server"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="my-3 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search logs by class, group or message content..."
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
              const recCount = record.recipients?.length || record.totalRecipients || 0;
              return (
                <div
                  key={record.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden text-xs"
                >
                  <div 
                    onClick={() => toggleExpand(record.id)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {record.className || 'General Broadcast'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-mono text-[11px]">{record.timestamp}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{record.section || `${recCount} Recipients`}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 font-mono text-[11px]">
                        {record.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        record.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : record.status === 'Processing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {record.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-200 p-3 bg-white space-y-2.5">
                      <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-slate-700 whitespace-pre-wrap text-[11px]">
                        {record.message}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Total SMS Units: {record.totalSmsUnits || 1}</span>
                        {record.recipients && record.recipients.length > 0 && (
                          <button
                            type="button"
                            onClick={() => exportToCSV(record)}
                            className="flex items-center gap-1 text-[#1b1e42] hover:text-[#d91920] font-medium cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export CSV</span>
                          </button>
                        )}
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
