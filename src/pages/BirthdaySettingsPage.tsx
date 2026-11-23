import React, { useState } from 'react';
import {
  Sliders,
  Clock,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  ArrowLeft,
  Info,
  Radio,
  RotateCcw,
  Save,
  Check
} from 'lucide-react';
import type { AppPage } from '../types';
import type { BirthdaySchedulerSettings } from '../types/birthday';
import { birthdayService, DEFAULT_BIRTHDAY_SETTINGS } from '../services/birthdayService';
import { calculateSmsMetrics } from '../utils/smsCalculator';
import { toast } from '../services/toastService';

interface BirthdaySettingsPageProps {
  onNavigate: (page: AppPage) => void;
  onRefreshBalance?: () => void;
}

export const BirthdaySettingsPage: React.FC<BirthdaySettingsPageProps> = ({
  onNavigate,
  onRefreshBalance,
}) => {
  const [settings, setSettings] = useState<BirthdaySchedulerSettings>(() =>
    birthdayService.getSettings()
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleChange = <K extends keyof BirthdaySchedulerSettings>(
    key: K,
    value: BirthdaySchedulerSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = birthdayService.saveSettings(settings);
    setSettings(updated);
    setSaveSuccess(true);
    toast.showKey('SUCCESS_SETTINGS_SAVED');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset birthday scheduler settings back to standard defaults?')) {
      const reset = birthdayService.saveSettings(DEFAULT_BIRTHDAY_SETTINGS);
      setSettings(reset);
      setSaveSuccess(true);
      toast.showKey('SUCCESS_SETTINGS_SAVED');
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleInsertTag = (tag: string) => {
    handleChange('wishTemplate', (settings.wishTemplate || '') + ' ' + tag);
  };

  const handleRunNow = async () => {
    setIsExecuting(true);
    setTestResult(null);
    try {
      const res = await birthdayService.checkAndExecuteScheduler(new Date());
      setSettings(birthdayService.getSettings());
      if (onRefreshBalance) onRefreshBalance();
      if (res.dispatchedCount > 0) {
        toast.showKey('SUCCESS_AUTO_WISH_BATCH', { Count: res.dispatchedCount });
      } else {
        toast.showKey('INFO_SCHEDULER_NO_DUE');
      }
    } catch (err: unknown) {
      console.error('Failed to trigger scheduler:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.showKey('ERR_SCHEDULER_EXECUTION', { Details: msg });
    } finally {
      setIsExecuting(false);
    }
  };

  // Preview Message
  const previewStudent = {
    name: 'JULAYBIB MUHAMMAD',
    id: '2606093807',
    className: 'Play Group',
    section: 'Starter',
    roll: '01',
    age: 9,
  };

  const samplePreviewMessage = (settings.wishTemplate || '')
    .replace(/{StudentName}/gi, previewStudent.name)
    .replace(/{StudentID}/gi, previewStudent.id)
    .replace(/{Class}/gi, previewStudent.className)
    .replace(/{Section}/gi, previewStudent.section)
    .replace(/{Roll}/gi, previewStudent.roll)
    .replace(/{Age}/gi, String(previewStudent.age))
    .replace(/{SchoolName}/gi, 'British Standard School');

  const metrics = calculateSmsMetrics(samplePreviewMessage, 1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('birthdays')}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Birthday Portal</span>
        </button>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="text-xs text-ink-faint hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="rounded-2xl p-6 bg-surface border border-border-default shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">
              Birthday Scheduler
            </h1>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Control the scheduler execution frequency (n days), the countdown trigger threshold window (n days),
              and the exact time automated birthday wishes are dispatched to students.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={() => handleSave()}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
            saveSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-[#1b1e42] hover:bg-[#20224A]/90 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-[#1b1e42]'
          }`}
        >
          {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Settings Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Info className="w-4 h-4 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scheduler Timing & Automation Parameters */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Scheduler Run Interval & Countdown Threshold (N Days) */}
          <div className="rounded-2xl p-5 sm:p-6 bg-surface border border-border-default shadow-xs space-y-5">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Scheduler Timing &amp; Countdown Windows (N)</span>
            </h3>

            {/* Parameter 1: Scheduler Run Time / Interval N Days */}
            <div className="space-y-2 p-4 rounded-xl bg-surface-2/60 dark:bg-surface-2/30 border border-border-default/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink">
                  Birthday Scheduler Run Interval (<span className="text-primary font-mono font-bold">n</span> days)
                </label>
                <span className="text-xs font-mono font-bold text-ink px-2 py-0.5 rounded bg-surface border border-border-default">
                  Every {settings.schedulerIntervalDays} {settings.schedulerIntervalDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Defines how often the automated background scheduler executes to scan student records and prepare birthday queues.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={settings.schedulerIntervalDays}
                  onChange={(e) => handleChange('schedulerIntervalDays', Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.schedulerIntervalDays}
                  onChange={(e) => handleChange('schedulerIntervalDays', Math.max(1, Number(e.target.value)))}
                  className="w-16 p-1.5 rounded-lg border border-border-default bg-surface text-center font-mono text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-1.5 text-[10.5px] text-ink-faint">
                <span>Presets:</span>
                {[1, 2, 3, 7, 14].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleChange('schedulerIntervalDays', n)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      settings.schedulerIntervalDays === n
                        ? 'bg-[#1b1e42] dark:bg-accent text-white font-semibold'
                        : 'bg-surface hover:bg-surface-3 text-ink-muted border border-border-default/40'
                    }`}
                  >
                    {n}d
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter 2: Countdown Lookahead Threshold N Days */}
            <div className="space-y-2 p-4 rounded-xl bg-surface-2/60 dark:bg-surface-2/30 border border-border-default/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink">
                  Countdown Trigger Window (<span className="text-indigo-600 font-mono font-bold">n</span> days)
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-surface border border-border-default">
                  Within {settings.lookaheadDays} {settings.lookaheadDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                When a student&apos;s birthday is within <strong className="text-ink">n days</strong>, the live countdown timer automatically starts and displays on their birthday card.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={settings.lookaheadDays}
                  onChange={(e) => handleChange('lookaheadDays', Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.lookaheadDays}
                  onChange={(e) => handleChange('lookaheadDays', Math.max(1, Number(e.target.value)))}
                  className="w-16 p-1.5 rounded-lg border border-border-default bg-surface text-center font-mono text-xs text-ink focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div className="flex items-center gap-1.5 text-[10.5px] text-ink-faint">
                <span>Presets:</span>
                {[1, 2, 3, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleChange('lookaheadDays', n)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      settings.lookaheadDays === n
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-surface hover:bg-surface-3 text-ink-muted border border-border-default/40'
                    }`}
                  >
                    {n}d
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter 3: Exact Send Time on Birthday */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Exact Birthday Dispatch Time</span>
                </label>
                <input
                  type="time"
                  value={settings.exactWishTime}
                  onChange={(e) => handleChange('exactWishTime', e.target.value)}
                  className="w-full p-2 rounded-xl border border-border-default bg-surface font-mono text-sm font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10.5px] text-ink-faint">
                  e.g. 00:00 (Midnight) or 08:00 (Morning) on their birthday.
                </p>
              </div>

              {/* Master Auto-Send Switch */}
              <div className="space-y-1.5 flex flex-col justify-between">
                <label className="text-xs font-semibold text-ink">
                  Automatic SMS Dispatch
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded-xl border border-border-default bg-surface-2/40 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.isAutoSendEnabled}
                    onChange={(e) => handleChange('isAutoSendEnabled', e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs font-medium text-ink">
                    {settings.isAutoSendEnabled ? 'Auto-send enabled' : 'Manual approval only'}
                  </span>
                </label>
                <p className="text-[10.5px] text-ink-faint">
                  Automatically dispatches SMS when countdown reaches zero.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: SMS Template & Personalization Tags */}
          <div className="rounded-2xl p-5 sm:p-6 bg-surface border border-border-default shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Birthday Wish SMS Template</span>
            </h3>

            <p className="text-xs text-ink-muted">
              Compose the greeting message. Use dynamic placeholders to personalize for each student.
            </p>

            {/* Clickable Tag Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-ink-faint mr-1">Insert Tag:</span>
              {[
                { tag: '{StudentName}', label: 'Student Name' },
                { tag: '{Age}', label: 'Age (Turning)' },
                { tag: '{Class}', label: 'Class' },
                { tag: '{Section}', label: 'Section' },
                { tag: '{Roll}', label: 'Roll' },
                { tag: '{SchoolName}', label: 'School Name' },
              ].map(({ tag, label }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-2 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border-default/60 text-[11px] font-mono font-medium text-ink transition-colors cursor-pointer"
                  title={`Insert ${tag}`}
                >
                  +{label}
                </button>
              ))}
            </div>

            {/* Template Textarea */}
            <div className="space-y-1.5">
              <textarea
                rows={4}
                value={settings.wishTemplate}
                onChange={(e) => handleChange('wishTemplate', e.target.value)}
                className="w-full p-3 rounded-xl border border-border-default bg-surface text-xs text-ink font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter greeting template..."
              />

              <div className="flex items-center justify-between text-[11px] text-ink-faint">
                <span>
                  Length: <strong className="text-ink font-mono">{samplePreviewMessage.length}</strong> chars ({metrics.segments} SMS segment{metrics.segments > 1 ? 's' : ''})
                </span>
                <span>Encoding: {metrics.isUnicode ? 'Unicode (Bengali/Emoji)' : 'GSM-7 (Standard)'}</span>
              </div>
            </div>

            {/* Channel Selection & Effects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-default/60">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-ink-muted" />
                  <span>SMS Gateway Channel</span>
                </label>
                <select
                  value={settings.channel}
                  onChange={(e) => handleChange('channel', e.target.value as 'Masking' | 'Non-Masking')}
                  className="w-full p-2 rounded-xl border border-border-default bg-surface text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="Masking">Masking (BSS Sender ID)</option>
                  <option value="Non-Masking">Non-Masking (Standard)</option>
                </select>
              </div>

              {/* Effects Switches */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink">Interactive Celebrations</label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableConfetti}
                      onChange={(e) => handleChange('enableConfetti', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-ink-muted flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Confetti
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSound}
                      onChange={(e) => handleChange('enableSound', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-ink-muted flex items-center gap-1">
                      {settings.enableSound ? (
                        <Volume2 className="w-3 h-3 text-primary" />
                      ) : (
                        <VolumeX className="w-3 h-3 text-ink-faint" />
                      )}
                      Chime Sound
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Phone Mockup & Diagnostic Status */}
        <div className="lg:col-span-5 space-y-6">
          {/* Phone SMS Mockup */}
          <div className="rounded-2xl p-5 bg-surface border border-border-default shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Live Phone Delivery Mockup</span>
            </h3>

            {/* Mobile Handset Graphic */}
            <div className="rounded-2xl border-4 border-slate-700 bg-slate-900 p-3 shadow-md max-w-xs mx-auto text-white">
              {/* Phone Speaker & Camera Notch */}
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <div className="w-10 h-1 rounded-full bg-slate-700" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>

              {/* Message Header */}
              <div className="text-center pb-2 border-b border-slate-800">
                <div className="text-[11px] font-bold text-amber-400">BSS SCHOOL</div>
                <div className="text-[9px] text-slate-400 font-mono">Today at {settings.exactWishTime}</div>
              </div>

              {/* Message Bubble */}
              <div className="my-4 p-3 rounded-2xl bg-indigo-600/90 text-white text-[11px] leading-relaxed shadow-inner">
                {samplePreviewMessage}
              </div>

              <div className="text-center text-[9px] text-slate-500 pt-1">
                Delivered via {settings.channel} Gateway
              </div>
            </div>
          </div>

          {/* Scheduler Diagnostics Card */}
          <div className="rounded-2xl p-5 bg-surface border border-border-default shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Scheduler Status &amp; Execution</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border-default/40">
                <span className="text-ink-muted">State:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active (Auto-Monitoring)
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border-default/40">
                <span className="text-ink-muted">Last Checked:</span>
                <span className="font-mono text-ink text-[11px]">
                  {settings.lastRunTimestamp
                    ? new Date(settings.lastRunTimestamp).toLocaleString()
                    : 'Not recorded yet'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border-default/40">
                <span className="text-ink-muted">Next Scheduled Check:</span>
                <span className="font-mono text-ink text-[11px]">
                  {settings.nextRunTimestamp
                    ? new Date(settings.nextRunTimestamp).toLocaleString()
                    : 'Pending initial save'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunNow}
              disabled={isExecuting}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink text-xs font-semibold border border-border-default flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'Executing Scheduler...' : 'Run Scheduler Now'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
