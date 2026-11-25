import type { ToastItem, ToastType } from '../types/toast';
import { systemMessageService } from './systemMessageService';

type ToastListener = (toasts: ToastItem[]) => void;

class ToastService {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private defaultDuration = 4500;

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const copy = [...this.toasts];
    this.listeners.forEach((l) => l(copy));
  }

  /**
   * Dispatches a toast using a configured database/settings message key
   */
  showKey(
    key: string,
    variables?: Record<string, string | number>,
    overrideType?: ToastType,
    durationMs?: number
  ): string {
    const resolved = systemMessageService.resolve(key, variables);
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const item: ToastItem = {
      id,
      key,
      type: overrideType || resolved.type,
      title: resolved.title,
      message: resolved.message,
      durationMs: durationMs || this.defaultDuration,
      createdAt: Date.now(),
    };

    this.toasts = [item, ...this.toasts].slice(0, 5); // Max 5 toasts visible
    this.notify();

    setTimeout(() => {
      this.dismiss(id);
    }, (item.durationMs || this.defaultDuration) + 600);

    return id;
  }

  custom(
    title: string,
    message: string,
    type: ToastType = 'info',
    durationMs?: number
  ): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const item: ToastItem = {
      id,
      key: '',
      type,
      title,
      message,
      durationMs: durationMs || this.defaultDuration,
      createdAt: Date.now(),
    };

    this.toasts = [item, ...this.toasts].slice(0, 5);
    this.notify();

    setTimeout(() => {
      this.dismiss(id);
    }, (item.durationMs || this.defaultDuration) + 600);

    return id;
  }

  success(keyOrText: string, variables?: Record<string, string | number>, durationMs?: number): string {
    return this.showKey(keyOrText, variables, 'success', durationMs);
  }

  error(keyOrText: string, variables?: Record<string, string | number>, durationMs?: number): string {
    return this.showKey(keyOrText, variables, 'error', durationMs);
  }

  warning(keyOrText: string, variables?: Record<string, string | number>, durationMs?: number): string {
    return this.showKey(keyOrText, variables, 'warning', durationMs);
  }

  info(keyOrText: string, variables?: Record<string, string | number>, durationMs?: number): string {
    return this.showKey(keyOrText, variables, 'info', durationMs);
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clearAll() {
    this.toasts = [];
    this.notify();
  }
}

export const toastService = new ToastService();
export const toast = toastService;
