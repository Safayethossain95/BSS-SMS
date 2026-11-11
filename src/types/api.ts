import type { Student } from './index';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errors?: string[];
}

export interface SmsBalanceInfo {
  currentBalance: number;
  activeGatewayName: string;
  isMasking: boolean;
  isSafeTestMode: boolean;
  safeTestPhoneNumber: string;
}

export interface BroadcastSubmissionResult {
  jobId: string;
  totalRecipients: number;
  batchCount: number;
  isPersonalized: boolean;
  enqueuedAt: string;
  message: string;
}

export interface BroadcastSmsPayload {
  templateText: string;
  recipients: Student[];
}

export interface TestSmsPayload {
  phoneNumber: string;
  message: string;
}

export interface CreateTemplatePayload {
  title: string;
  body: string;
  category?: string;
}

export interface ResolveRecipientsPayload {
  groupNames: string[];
}

export interface HealthCheckInfo {
  status: string;
  service: string;
  architecture: string;
  database: {
    status: string;
    latencyMs: number;
  };
  backgroundQueue: {
    status: string;
    engine: string;
  };
  safetyGuard: {
    enabled: boolean;
    interceptPhoneNumber: string;
  };
  serverDiagnostics: {
    memoryWorkingSetMB: number;
    totalRequestDurationMs: number;
    timestamp: string;
  };
}
