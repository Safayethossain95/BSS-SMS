import React, { useRef } from 'react';
import { Smartphone } from 'lucide-react';
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
    <div className="bg-[#fafafa] border border-gray-300 rounded-xl p-3 shadow-xs h-full flex flex-col justify-between">

      {/* Top Controls: Template Selector & Tag Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-gray-700 mr-1">
            Message:
          </span>
          {['{StudentName}', '{StudentID}', '{Class}', '{Section}'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => insertTag(tag)}
              className="px-1.5 py-0.5 rounded bg-white hover:bg-red-50 hover:text-[#1b1e42] border border-gray-300 text-gray-700 text-[10px] font-mono cursor-pointer transition shadow-2xs"
            >
              +{tag.replace(/[{}]/g, '')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Template select dropdown */}
          <select
            id="template-select"
            value={selectedTemplateId}
            onChange={(e) => onSelectTemplate(e.target.value)}
            className="bg-white border border-gray-300 hover:border-gray-400 focus:border-[#1b1e42] rounded-lg px-2.5 py-1 text-xs text-gray-800 focus:outline-none cursor-pointer max-w-[200px] truncate shadow-2xs"
          >
            <option value="">-- Choose Template --</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.title}
              </option>
            ))}
          </select>

          {/* Phone preview trigger */}
          <button
            type="button"
            onClick={onOpenPhonePreview}
            className="p-1 text-gray-600 hover:text-[#1b1e42] rounded hover:bg-white border border-transparent hover:border-gray-300 transition cursor-pointer"
            title="Preview on mobile device"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Textarea (Fills space to match GroupShifter height) */}
      <div className="relative flex-1 my-2 flex flex-col min-h-0">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => onChangeMessage(e.target.value)}
          placeholder="Write your SMS message here..."
          className="w-full flex-1 min-h-[105px] bg-white border border-gray-300 focus:border-[#1b1e42] rounded-lg p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none resize-none leading-relaxed font-sans shadow-2xs"
        />

        {metrics.isUnicode && (
          <div className="text-[10px] text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded mt-1 inline-block self-start font-medium">
            Unicode detected (70 chars / SMS segment)
          </div>
        )}
      </div>

      {/* Compact Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between pt-1.5 border-t border-gray-200 text-[11px] text-gray-600 gap-2">
        <div className="flex items-center gap-3">
          <div>
            Length: <strong className="text-gray-900">{metrics.charCount}</strong>
          </div>
          <div>
            Remain: <strong className={metrics.charRemain < 10 ? 'text-amber-700' : 'text-emerald-700'}>{metrics.charRemain}</strong>
          </div>
          <div>
            SMS: <strong className="text-gray-900">{metrics.segments}</strong>
          </div>
          <div>
            Recipients: <strong className="text-gray-900">{totalRecipients}</strong>
          </div>
        </div>

        <div className="text-xs">
          Units: <strong className="text-[#1b1e42] font-bold">{metrics.totalSmsCost} Credits</strong>
        </div>
      </div>

    </div>
  );
};
