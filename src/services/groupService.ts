import apiClient from './apiClient';
import type { ApiResponse, ResolveRecipientsPayload } from '../types/api';
import type { Student } from '../types';

export const groupService = {
  async getAvailableGroups(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/api/groups');
    return response.data.data;
  },

  async resolveRecipients(groupNames: string[]): Promise<Student[]> {
    const payload: ResolveRecipientsPayload = { groupNames };
    const response = await apiClient.post<ApiResponse<Student[]>>('/api/groups/resolve-recipients', payload);
    return response.data.data;
  },
};
