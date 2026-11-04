import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { SmsTemplate } from '../types';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: SmsTemplate[];
  onAddTemplate: (newTpl: SmsTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onApplyTemplate: (tpl: SmsTemplate) => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  templates,
  onAddTemplate,
  onDeleteTemplate,
  onApplyTemplate,
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

    onAddTemplate(newTemplate);
    setTitle('');
    setBody('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="relative bg-slate-100 border border-slate-300 rounded-2xl p-5 max-w-xl w-full shadow-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">SMS Templates</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {/* Add form */}
          <form onSubmit={handleCreate} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-[#1b1e42]" /> Add New Template
            </span>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Template Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-2 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1b1e42]"
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SmsTemplate['category'])}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
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
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-[#1b1e42]"
              required
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#1b1e42] hover:bg-[#d91920] text-white font-medium text-xs rounded-lg transition cursor-pointer shadow-xs active:scale-95"
              >
                Save
              </button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-2">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start justify-between gap-2"
              >
                <div>
                  <span className="font-semibold text-xs text-slate-900 block">{tpl.title}</span>
                  <p className="text-xs text-slate-600 font-mono mt-0.5 whitespace-pre-wrap">{tpl.body}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onApplyTemplate(tpl);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-[#1b1e42] text-xs font-medium cursor-pointer"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTemplate(tpl.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
