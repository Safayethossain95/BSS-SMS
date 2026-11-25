import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
} from 'lucide-react';
import type { ToastItem } from '../types/toast';
import { toastService } from '../services/toastService';

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe((list) => {
      setToasts(list);
    });
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => toastService.dismiss(item.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  item: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ item, onDismiss }) => {
  const { type, title, message, durationMs = 4500 } = item;
  const [isExiting, setIsExiting] = useState(false);

  const triggerDismiss = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 320);
  }, [isExiting, onDismiss]);

  useEffect(() => {
    const exitDelay = Math.max(durationMs - 340, 500);
    const timer = setTimeout(() => {
      triggerDismiss();
    }, exitDelay);

    return () => clearTimeout(timer);
  }, [durationMs, triggerDismiss]);

  const config = {
    success: {
      border: 'border-emerald-300 dark:border-emerald-800',
      bg: 'bg-white dark:bg-zinc-900',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      progressBg: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    error: {
      border: 'border-rose-300 dark:border-rose-800',
      bg: 'bg-white dark:bg-zinc-900',
      iconBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      progressBg: 'bg-rose-500',
      icon: XCircle,
    },
    warning: {
      border: 'border-amber-300 dark:border-amber-800',
      bg: 'bg-white dark:bg-zinc-900',
      iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      progressBg: 'bg-amber-500',
      icon: AlertTriangle,
    },
    info: {
      border: 'border-indigo-300 dark:border-indigo-800',
      bg: 'bg-white dark:bg-zinc-900',
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      progressBg: 'bg-indigo-500',
      icon: Info,
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`relative overflow-hidden pointer-events-auto rounded-2xl border ${config.border} ${config.bg} shadow-xl p-3.5 flex items-start gap-3 transition-all ${
        isExiting ? 'toast-sweep-out' : 'toast-sweep-in'
      }`}
    >
      {/* Luminous Sweep Shimmer */}
      <div className="toast-shimmer" />

      {/* Icon */}
      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${config.iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Message Info */}
      <div className="flex-1 min-w-0 pr-1">
        <h5 className="text-xs font-bold text-ink leading-tight truncate">{title}</h5>
        <p className="text-xs text-ink-muted mt-0.5 leading-relaxed break-words">{message}</p>
        {item.key && (
          <span className="inline-block mt-1 text-[9.5px] font-mono text-ink-faint">
            Key: {item.key}
          </span>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={triggerDismiss}
        className="p-1 rounded-lg text-ink-faint hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Auto-Dismiss Animated Progress Bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${config.progressBg}`}
        style={{
          width: '100%',
          animation: `shrinkWidth ${durationMs}ms linear forwards`,
        }}
      />
    </div>
  );
};
