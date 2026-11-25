import apiClient from './apiClient';
import type { 
  ApiResponse, 
  SmsBalanceInfo, 
  BroadcastSubmissionResult, 
  BroadcastSmsPayload, 
  TestSmsPayload,
  ScheduleBroadcastPayload,
  ScheduledBroadcastItem
} from '../types/api';
import type { SentBroadcastRecord } from '../types';

export const smsService = {
  async getBalance(): Promise<SmsBalanceInfo> {
    const response = await apiClient.get<ApiResponse<SmsBalanceInfo>>('/api/sms/balance');
    return response.data.data;
  },

  async sendBroadcast(payload: BroadcastSmsPayload): Promise<BroadcastSubmissionResult> {
    const response = await apiClient.post<ApiResponse<BroadcastSubmissionResult>>('/api/sms/send-broadcast', payload);
    return response.data.data;
  },

  async scheduleBroadcast(payload: ScheduleBroadcastPayload): Promise<ScheduledBroadcastItem> {
    const response = await apiClient.post<ApiResponse<ScheduledBroadcastItem>>('/api/sms/schedule', payload);
    return response.data.data;
  },

  async getScheduled(): Promise<ScheduledBroadcastItem[]> {
    const response = await apiClient.get<ApiResponse<ScheduledBroadcastItem[]>>('/api/sms/scheduled');
    return response.data.data;
  },

  async cancelScheduled(jobId: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/sms/scheduled/${jobId}`);
    return response.data.data;
  },

  async triggerScheduledNow(jobId: string): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>(`/api/sms/scheduled/${jobId}/send-now`);
    return response.data.data;
  },

  async sendTestSms(payload: TestSmsPayload): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>('/api/sms/send-test', payload);
    return response.data.data;
  },

  async getHistory(limit: number = 50): Promise<SentBroadcastRecord[]> {
    const response = await apiClient.get<ApiResponse<SentBroadcastRecord[]>>('/api/sms/history', {
      params: { limit },
    });
    return response.data.data;
  },
};
