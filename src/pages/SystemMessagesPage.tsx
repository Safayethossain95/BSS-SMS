import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bell,
  Search,
  Edit2,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Save,
  X,
  RotateCcw,
  Database,
  ArrowLeft
} from 'lucide-react';
import type { AppPage } from '../types';
import type { SystemMessage, ToastType } from '../types/toast';
import { systemMessageService } from '../services/systemMessageService';
import { toast } from '../services/toastService';

interface SystemMessagesPageProps {
  onNavigate: (page: AppPage) => void;
}

export const SystemMessagesPage: React.FC<SystemMessagesPageProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<SystemMessage[]>(() => systemMessageService.getMessages());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Edit Modal State
  const [editingMessage, setEditingMessage] = useState<SystemMessage | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editText, setEditText] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editActive, setEditActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await systemMessageService.fetchMessages();
      setMessages(list);
    } catch {
      setMessages(systemMessageService.getMessages());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    void systemMessageService.fetchMessages()
      .then((list) => {
        if (isMounted) setMessages(list);
      })
      .catch(() => {
        if (isMounted) setMessages(systemMessageService.getMessages());
      });

    const handleUpdate = () => {
      setMessages(systemMessageService.getMessages());
    };
    window.addEventListener('bss_system_messages_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('bss_system_messages_updated', handleUpdate);
    };
  }, []);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (selectedType !== 'all' && m.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.key.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.messageText.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [messages, selectedCategory, selectedType, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (msg: SystemMessage) => {
    setEditingMessage(msg);
    setEditTitle(msg.title);
    setEditText(msg.messageText);
    setEditDesc(msg.description || '');
    setEditActive(msg.isActive);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage) return;

    setIsSaving(true);
    try {
      await systemMessageService.updateMessage(editingMessage.key, {
        title: editTitle.trim(),
        messageText: editText.trim(),
        description: editDesc.trim(),
        isActive: editActive,
      });

      setEditingMessage(null);
      await loadData();
      toast.showKey('SUCCESS_SETTINGS_SAVED');
    } catch (err) {
      console.error('Failed to update message:', err);
      toast.error('ERR_SCHEDULER_EXECUTION', { Details: 'Could not save message template.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Sample Toast
  const handleTestToast = (msg: SystemMessage) => {
    const sampleVars: Record<string, string | number> = {
      StudentName: 'JULAYBIB MUHAMMAD',
      Count: 3,
      Details: 'API Gateway connection timeout',
      Balance: '4,520',
      Mobile: '8801749421005',
    };

    toast.showKey(msg.key, sampleVars, msg.type);
  };

  const getTypeBadge = (type: ToastType) => {
    const config = {
      success: {
        bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle2,
      },
      error: {
        bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        icon: XCircle,
      },
      warning: {
        bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: AlertTriangle,
      },
      info: {
        bg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        icon: Info,
      },
    }[type];

    const Icon = config.icon;

    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 w-fit uppercase tracking-wider ${config.bg}`}>
        <Icon className="w-3 h-3" />
        <span>{type}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('delivery')}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portal</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-ink-faint">
          <Database className="w-3.5 h-3.5 text-primary" />
          <span>Table: <strong className="text-ink font-mono">BSS_SYSTEM_MESSAGES</strong> in <strong className="text-ink font-mono">BSS-MVCTEST</strong></span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl p-6 bg-surface border border-border-default shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 via-purple-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight flex items-center gap-2">
              <span>System Messages &amp; Alert Templates</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Database Managed
              </span>
            </h1>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              No hardcoded error or alert strings. Manage message names/keys, custom titles, and message text with dynamic variables ({'{StudentName}'}, {'{Count}'}, {'{Details}'}).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadData()}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink text-xs font-semibold border border-border-default flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-primary ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload from Database</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl p-4 bg-surface border border-border-default shadow-xs flex flex-col gap-3">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface-2 w-fit">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-surface text-ink shadow-2xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            All Messages ({messages.length})
          </button>
          {['BIRTHDAY', 'SCHEDULER', 'VALIDATION', 'SMS_GATEWAY', 'GROUP'].map((cat) => {
            const count = messages.filter((m) => m.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-surface text-ink shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {cat === 'VALIDATION' ? 'Validation & Errors' : cat.replace('_', ' ')} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by key, title, or message text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border-default bg-surface text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-border-default bg-surface text-xs text-ink focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of System Messages */}
      <div className="rounded-2xl bg-surface border border-border-default shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-2 text-ink-muted border-b border-border-default">
                <th className="py-2.5 px-4 font-semibold">Message Key (Code)</th>
                <th className="py-2.5 px-4 font-semibold">Type</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Default Title</th>
                <th className="py-2.5 px-4 font-semibold">Message Text Template</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    No message templates found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg.key} className="hover:bg-surface-2/50 transition-colors">
                    {/* Key */}
                    <td className="py-3 px-4 font-mono font-bold text-ink">
                      <span>{msg.key}</span>
                      {msg.description && (
                        <div className="text-[10px] font-sans text-ink-faint mt-0.5 line-clamp-1">
                          {msg.description}
                        </div>
                      )}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4">{getTypeBadge(msg.type)}</td>

                    {/* Category */}
                    <td className="py-3 px-4 font-mono text-ink-muted">{msg.category}</td>

                    {/* Title */}
                    <td className="py-3 px-4 font-semibold text-ink">{msg.title}</td>

                    {/* Template Text */}
                    <td className="py-3 px-4 max-w-sm text-ink-muted leading-relaxed font-sans">
                      {msg.messageText}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTestToast(msg)}
                          className="px-2.5 py-1 rounded-lg border border-border-default hover:bg-surface-2 text-ink text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Preview live toast notification on screen"
                        >
                          <Play className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                          <span>Test</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(msg)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                          title="Edit message title and text template"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Message Modal */}
      {editingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-lg rounded-2xl bg-surface border border-border-default p-6 shadow-xl space-y-4 animate-scaleUp"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-primary" />
                <span>Edit Message Template</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingMessage(null)}
                className="text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Readonly Meta */}
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border-default flex items-center justify-between text-xs">
              <div>
                <span className="text-ink-faint">Message Key:</span>{' '}
                <strong className="font-mono text-ink">{editingMessage.key}</strong>
              </div>
              <div>{getTypeBadge(editingMessage.type)}</div>
            </div>

            {/* Title Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Toast Notification Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border-default bg-surface text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Message Text Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Message Content Template</label>
              <textarea
                rows={4}
                required
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border-default bg-surface text-xs text-ink font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-ink-faint">
                Supported dynamic tags: <code className="font-mono text-primary font-bold">{'{StudentName}'}</code>, <code className="font-mono text-primary font-bold">{'{Count}'}</code>, <code className="font-mono text-primary font-bold">{'{Details}'}</code>, <code className="font-mono text-primary font-bold">{'{Balance}'}</code>, <code className="font-mono text-primary font-bold">{'{Mobile}'}</code>.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Internal Description / Trigger Note</label>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Explains when this message triggers in the app..."
                className="w-full p-2 rounded-xl border border-border-default bg-surface text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Active Toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-ink font-medium">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span>Active (Enable this alert notification)</span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-default">
              <button
                type="button"
                onClick={() => setEditingMessage(null)}
                className="px-3.5 py-2 rounded-xl border border-border-default hover:bg-surface-2 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving to Database...' : 'Save to Database'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
