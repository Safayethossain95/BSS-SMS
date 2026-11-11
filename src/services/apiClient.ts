import axios, { type AxiosError } from 'axios';
import type { ApiResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5252';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    let errorMessage = 'An unexpected network or server error occurred.';

    if (error.response?.data) {
      const apiResp = error.response.data;
      if (apiResp.message) {
        errorMessage = apiResp.message;
      }
      if (apiResp.errors && apiResp.errors.length > 0) {
        errorMessage += ' ' + apiResp.errors.join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error(`[API Error] ${error.config?.url}:`, errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
