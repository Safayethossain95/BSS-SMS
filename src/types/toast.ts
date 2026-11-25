export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface SystemMessage {
  id: number;
  key: string;
  category: string; // e.g. 'BIRTHDAY', 'SCHEDULER', 'SMS_GATEWAY', 'SYSTEM'
  type: ToastType;
  title: string;
  messageText: string;
  description?: string;
  isActive: boolean;
  lastUpdated?: string;
}

export interface ToastItem {
  id: string;
  key?: string;
  type: ToastType;
  title: string;
  message: string;
  durationMs?: number;
  createdAt: number;
}
