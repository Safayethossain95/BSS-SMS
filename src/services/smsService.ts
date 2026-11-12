import apiClient from './apiClient';
import type { 
  ApiResponse, 
  SmsBalanceInfo, 
  BroadcastSubmissionResult, 
  BroadcastSmsPayload, 
  TestSmsPayload 
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
