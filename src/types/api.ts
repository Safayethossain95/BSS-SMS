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
  templateText?: string;
  message?: string;
  targetGroupSummary?: string;
  recipients: Student[];
}

export interface ScheduledBroadcastItem {
  jobId: string;
  message: string;
  targetGroupSummary: string;
  totalRecipients: number;
  recipients: Student[];
  scheduledFor: string;
  createdAt: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  userId?: number;
}

export interface ScheduleBroadcastPayload {
  message: string;
  targetGroupSummary?: string;
  recipients: Student[];
  scheduledFor: string;
  userId?: number;
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

export interface SmsGateway {
  setupId: number;
  gatewayType: number;
  gatewayTypeName: string;
  providerName: string;
  url: string;
  userId?: string;
  password?: string;
  apiToken?: string;
  senderId?: string;
  isActive: boolean;
  maskType: number;
  httpMethod: 'GET' | 'POST';
  requestTemplate?: string;
  balanceUrl?: string;
  lastUpdateDate?: string;
}

export interface SaveSmsGatewayPayload {
  setupId?: number;
  gatewayType: number;
  providerName: string;
  url: string;
  userId?: string;
  password?: string;
  apiToken?: string;
  senderId?: string;
  isActive: boolean;
  maskType?: number;
  httpMethod: string;
  requestTemplate?: string;
  balanceUrl?: string;
}

export interface GatewayPreset {
  id: string;
  name: string;
  description: string;
  defaultGatewayType: number;
  defaultUrl: string;
  defaultHttpMethod: string;
  defaultTemplate?: string;
  defaultBalanceUrl?: string;
  requiresUserId: boolean;
  requiresPassword: boolean;
  requiresApiToken: boolean;
  requiresSenderId: boolean;
}

export interface TestConnectivityPayload {
  setupId?: number;
  gatewayType?: number;
  url?: string;
  userId?: string;
  password?: string;
  apiToken?: string;
  senderId?: string;
  httpMethod?: string;
  customTemplate?: string;
  testPhoneNumber?: string;
}

export interface GatewayConnectivityResult {
  success: boolean;
  statusCode: number;
  latencyMs: number;
  statusMessage: string;
  rawResponse: string;
  detectedBalance?: string;
  checkedAt: string;
}

