import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, Check, RotateCcw } from 'lucide-react';
import type { SmsTemplate } from '../types';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: SmsTemplate[];
  onAddTemplate?: (newTpl: SmsTemplate) => void;
  onDeleteTemplate?: (id: string) => void;
  onApplyTemplate: (tpl: SmsTemplate) => void;
  onRefreshTemplates?: () => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  templates,
  onAddTemplate,
  onDeleteTemplate,
  onApplyTemplate,
  onRefreshTemplates,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SmsTemplate['category']>('general');
  const [body, setBody] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const newTemplate: SmsTemplate = {
      id: `tpl-${Date.now()}`,
      title: title.trim(),
      category,
      body: body.trim(),
    };

    if (onAddTemplate) {
      onAddTemplate(newTemplate);
    }
    setTitle('');
    setBody('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative bg-surface border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 max-w-xl w-full shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">SMS Templates Manager</h3>
              <p className="text-xs text-ink-muted">Create and manage reusable SMS templates</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onRefreshTemplates && (
              <button
                type="button"
                onClick={onRefreshTemplates}
                className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition cursor-pointer"
                title="Refresh templates"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-2 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {/* Add form */}
          <form onSubmit={handleCreate} className="bg-surface-2/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1 select-none">
              <Plus className="w-3.5 h-3.5 text-[#1b1e42] dark:text-accent" /> Add New Template
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Template Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="sm:col-span-2 bg-surface border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-ink outline-none focus:border-[#1b1e42] dark:focus:border-accent"
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SmsTemplate['category'])}
                className="bg-surface border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-[#1b1e42] dark:focus:border-accent cursor-pointer"
              >
                <option value="general">General</option>
                <option value="fee">Fee</option>
                <option value="attendance">Attendance</option>
                <option value="exam">Exam</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <textarea
              rows={2}
              placeholder="Message body..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-surface border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-ink outline-none focus:border-[#1b1e42] dark:focus:border-accent"
              required
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs rounded-full transition shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Template</span>
              </button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint select-none block">
              Available Templates ({templates.length})
            </span>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 bg-surface border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-xl flex items-start justify-between gap-3 transition shadow-2xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-xs text-ink truncate">
                        {tpl.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink-muted">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted line-clamp-2">{tpl.body}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyTemplate(tpl);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-surface-2 hover:bg-surface-3 text-ink border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs"
                      title="Use this template in composer"
                    >
                      <Check className="w-3 h-3 text-[#1b1e42] dark:text-accent" />
                      <span>Apply</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTemplate && onDeleteTemplate(tpl.id)}
                      className="p-1.5 text-ink-faint hover:text-brand-red rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-full bg-surface-2 hover:bg-surface-3 text-ink transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
