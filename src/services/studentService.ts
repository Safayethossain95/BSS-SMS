import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { Student } from '../types';

export const studentService = {
  async getStudentsByClassAndSection(classId: string, sectionId?: string): Promise<Student[]> {
    const params: Record<string, string> = { classId };
    if (sectionId) {
      params.sectionId = sectionId;
    }
    const response = await apiClient.get<ApiResponse<Student[]>>('/api/student/by-class-section', { params });
    return response.data.data;
  },

  async searchStudents(query: string): Promise<Student[]> {
    const response = await apiClient.get<ApiResponse<Student[]>>('/api/student/search', {
      params: { q: query },
    });
    return response.data.data;
  },
};
