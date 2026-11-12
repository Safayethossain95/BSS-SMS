import apiClient from './apiClient';
import type { ApiResponse, CreateTemplatePayload } from '../types/api';
import type { SmsTemplate } from '../types';

export const templateService = {
  async getTemplates(): Promise<SmsTemplate[]> {
    const response = await apiClient.get<ApiResponse<SmsTemplate[]>>('/api/templates');
    return response.data.data;
  },

  async createTemplate(payload: CreateTemplatePayload): Promise<SmsTemplate> {
    const response = await apiClient.post<ApiResponse<SmsTemplate>>('/api/templates', payload);
    return response.data.data;
  },

  async deleteTemplate(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/templates/${id}`);
    return response.data.data;
  },
};
