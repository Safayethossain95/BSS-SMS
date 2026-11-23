import apiClient from './apiClient';
import type {
  ApiResponse,
  SmsGateway,
  GatewayPreset,
  SaveSmsGatewayPayload,
  TestConnectivityPayload,
  GatewayConnectivityResult,
} from '../types/api';

export const gatewayService = {
  async getGateways(): Promise<SmsGateway[]> {
    const response = await apiClient.get<ApiResponse<SmsGateway[]>>('/api/gateways');
    return response.data.data;
  },

  async getPresets(): Promise<GatewayPreset[]> {
    const response = await apiClient.get<ApiResponse<GatewayPreset[]>>('/api/gateways/presets');
    return response.data.data;
  },

  async getGatewayById(id: number): Promise<SmsGateway> {
    const response = await apiClient.get<ApiResponse<SmsGateway>>(`/api/gateways/${id}`);
    return response.data.data;
  },

  async saveGateway(payload: SaveSmsGatewayPayload): Promise<SmsGateway> {
    if (payload.setupId && payload.setupId > 0) {
      const response = await apiClient.put<ApiResponse<SmsGateway>>(`/api/gateways/${payload.setupId}`, payload);
      return response.data.data;
    } else {
      const response = await apiClient.post<ApiResponse<SmsGateway>>('/api/gateways', payload);
      return response.data.data;
    }
  },

  async activateGateway(id: number): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>(`/api/gateways/${id}/activate`);
    return response.data.data;
  },

  async deleteGateway(id: number): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/api/gateways/${id}`);
    return response.data.data;
  },

  async testConnectivity(payload: TestConnectivityPayload): Promise<GatewayConnectivityResult> {
    const response = await apiClient.post<ApiResponse<GatewayConnectivityResult>>(
      '/api/gateways/test-connectivity',
      payload
    );
    return response.data.data;
  },
};

export default gatewayService;
