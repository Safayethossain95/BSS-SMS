import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Check,
  Search,
  Send,
  Sparkles,
  Copy
} from 'lucide-react';
import type { SmsTemplate, AppPage } from '../types';

interface TemplatesPageProps {
  templates: SmsTemplate[];
  onAddTemplate: (newTpl: SmsTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onApplyTemplate: (tpl: SmsTemplate) => void;
  onNavigate: (page: AppPage) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({
  templates,
  onAddTemplate,
  onDeleteTemplate,
  onApplyTemplate,
  onNavigate,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SmsTemplate['category']>('general');
  const [body, setBody] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: Array<{ id: SmsTemplate['category']; label: string }> = [
    { id: 'general', label: 'General' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'fee', label: 'Fee Reminder' },
    { id: 'exam', label: 'Exams & Results' },
    { id: 'emergency', label: 'Emergency Alert' },
  ];

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

  const handleInsertTag = (tag: string) => {
    setBody((prev) => `${prev} ${tag} `);
  };

  const handleCopyBody = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseTemplate = (tpl: SmsTemplate) => {
    onApplyTemplate(tpl);
    onNavigate('delivery');
  };

  const filteredTemplates = templates.filter((t) => {
    const matchCategory = selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Page Head Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight mb-0.5">
            SMS Templates Library
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Standardized message formats for rapid notices, fee reminders, exams, and broadcast dispatches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('delivery')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs transition cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Go to SMS Delivery</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form (Left) & Directory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Left Column: Create Template Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card !p-5 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card space-y-4">
            <div className="card-head !mb-1">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
                  <Plus className="w-4 h-4" />
                </span>
                <span>Create New Template</span>
              </h3>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                  Template Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Tuition Due Notice"
                  required
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SmsTemplate['category'])}
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink rounded-xl px-3 py-2 text-xs sm:text-sm font-medium outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint select-none block">
                    Message Body
                  </label>
                  <span className="text-[11px] text-ink-muted">
                    {body.length} characters
                  </span>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type standard message content here. You can insert student placeholders below..."
                  rows={4}
                  required
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl p-3 text-xs sm:text-sm outline-none transition-colors resize-none"
                />
              </div>

              {/* Helper Tag Pills */}
              <div className="p-3 bg-surface-2/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Insert Dynamic Variables</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '{StudentName}', label: 'Student Name' },
                    { tag: '{ID}', label: 'Student ID' },
                    { tag: '{Class}', label: 'Class' },
                    { tag: '{Date}', label: 'Date' },
                  ].map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertTag(item.tag)}
                      className="px-2.5 py-1 text-[11px] font-mono bg-surface hover:bg-surface-2 text-ink rounded-lg border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs"
                    >
                      +{item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!title.trim() || !body.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm shadow-sm active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Save Template</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Templates Directory */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card !p-5 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Template Records</h3>
                  <span className="text-xs text-ink-muted">
                    {filteredTemplates.length} available template{filteredTemplates.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-[#1b1e42] dark:bg-accent text-white shadow-2xs'
                    : 'bg-surface-2 text-ink hover:bg-surface border border-gray-200 dark:border-zinc-800'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(c.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    selectedCategoryFilter === c.id
                      ? 'bg-[#1b1e42] dark:bg-accent text-white shadow-2xs'
                      : 'bg-surface-2 text-ink hover:bg-surface border border-gray-200 dark:border-zinc-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Templates List */}
            {filteredTemplates.length === 0 ? (
              <div className="p-8 bg-surface-2/30 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl text-center text-xs text-ink-muted space-y-2">
                <FileText className="w-8 h-8 text-ink-faint mx-auto opacity-50" />
                <p className="font-semibold text-ink">No Templates Found</p>
                <p className="text-[11px] text-ink-faint max-w-sm mx-auto">
                  {searchQuery ? 'No templates match your search filters.' : 'Use the form on the left to add your first broadcast template.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 bg-surface border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-2xl transition shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-ink">{tpl.title}</h4>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink-muted">
                            {tpl.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-ink-faint">
                          {tpl.body.length} characters &bull; ~{Math.ceil(tpl.body.length / 160) || 1} SMS unit
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyBody(tpl.id, tpl.body)}
                          className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-2 rounded-lg transition cursor-pointer"
                          title="Copy message body"
                        >
                          {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTemplate(tpl.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                          title="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Message Preview Box */}
                    <p className="text-xs text-ink-muted p-3 bg-surface-2/60 border border-gray-200 dark:border-zinc-800 rounded-xl leading-relaxed whitespace-pre-wrap font-sans">
                      {tpl.body}
                    </p>

                    {/* Footer Apply CTA */}
                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleUseTemplate(tpl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white transition cursor-pointer shadow-2xs active:scale-95"
                      >
                        <Send className="w-3 h-3" />
                        <span>Use This in SMS Delivery</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
