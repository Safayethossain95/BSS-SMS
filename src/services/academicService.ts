import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { ClassInfo } from '../types';

export const academicService = {
  async getClassesWithSections(): Promise<ClassInfo[]> {
    const response = await apiClient.get<ApiResponse<ClassInfo[]>>('/api/academic/classes-with-sections');
    return response.data.data;
  },
};
