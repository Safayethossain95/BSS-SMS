import React, { useRef } from 'react';
import { Smartphone, MessageSquareQuote, ChevronDown } from 'lucide-react';
import type { SmsTemplate, SmsMetrics } from '../types';

interface MessageComposerProps {
  message: string;
  onChangeMessage: (text: string) => void;
  templates: SmsTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  metrics: SmsMetrics;
  totalRecipients: number;
  sampleStudentName?: string;
  onOpenPhonePreview: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  message,
  onChangeMessage,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  metrics,
  totalRecipients,
  onOpenPhonePreview,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (tag: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = message.substring(0, start) + tag + message.substring(end);
    onChangeMessage(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  return (
    <div className="card p-5! border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card h-full flex flex-col justify-between">

      {/* Card Header & Controls */}
      <div className="card-head mb-2! flex-wrap">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
          <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
            <MessageSquareQuote className="w-4 h-4" />
          </span>
          Message Composer
        </h3>

        {/* Template Picker & Preview Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              id="template-select"
              value={selectedTemplateId}
              onChange={(e) => onSelectTemplate(e.target.value)}
              className="bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent rounded-xl pl-3 pr-7 py-1.5 text-xs text-ink font-medium outline-none appearance-none cursor-pointer max-w-52.5 truncate transition-colors"
            >
              <option value="">Template</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={onOpenPhonePreview}
            className="inline-flex items-center justify-center p-1.5 rounded-full bg-surface-2 hover:bg-surface text-ink-muted hover:text-ink border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs"
            title="Preview SMS on phone"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Tags Row */}
      <div className="flex flex-wrap items-center gap-1.5 py-1 mb-1">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-faint mr-1">
          Tags:
        </span>
        {['{StudentName}', '{StudentID}', '{Class}', '{Section}', '{Roll}'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => insertTag(tag)}
            className="px-2.5 py-0.5 rounded-full bg-surface-2 hover:bg-surface text-ink text-[11px] font-mono border border-gray-200 dark:border-zinc-800 hover:border-brand-navy transition cursor-pointer shadow-2xs"
            title={`Insert ${tag}`}
          >
            +{tag.replace(/[{}]/g, '')}
          </button>
        ))}
      </div>

      {/* Message Textarea */}
      <div className="relative flex-1 my-1 flex flex-col min-h-0">
        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1 select-none block">
          SMS Message Body
        </label>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => onChangeMessage(e.target.value)}
          placeholder="Type SMS message or pick a template above..."
          className="w-full flex-1 min-h-26.25 bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent rounded-md p-3 text-xs sm:text-sm text-ink placeholder:text-ink-faint outline-none resize-none leading-relaxed transition-colors font-sans shadow-2xs"
        />

        {metrics.isUnicode && (
          <div className="text-[10.5px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 px-2 py-0.5 rounded-md mt-1.5 inline-block self-start font-medium">
            Unicode detected (70 chars / message)
          </div>
        )}
      </div>

      {/* Live Metrics Pill Strip */}
      <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-gray-200 dark:border-zinc-800 mt-2 gap-x-2 gap-y-3.75 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink-muted text-[11.5px]">
            Length: <strong className="text-ink">{metrics.charCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink-muted text-[11.5px]">
            Remain: <strong className={metrics.charRemain < 10 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>{metrics.charRemain}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink-muted text-[11.5px]">
            Message Count: <strong className="text-ink">{metrics.messageCount ?? metrics.segments}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink-muted text-[11.5px]">
            Recipients: <strong className="text-ink">{totalRecipients}</strong>
          </span>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-bold text-xs">
            {metrics.totalSmsCost} Credits
          </span>
        </div>
      </div>

    </div>
  );
};
