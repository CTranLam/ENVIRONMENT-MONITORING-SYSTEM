import apiClient from '@/services/apiClient';
import type {
  DashboardTelemetryResponse,
  DeviceControlRequest,
  DeviceControlResponse,
  DeviceStatusResponse,
  EspStatusResponse,
} from '@/features/dashboard/types/dashboard.types';

const isDeviceControlResponse = (value: unknown): value is DeviceControlResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    (candidate.deviceKey === 'ledGreen' || candidate.deviceKey === 'ledRed') &&
    (typeof candidate.on === 'boolean' || typeof candidate.targetState === 'boolean')
  );
};

export const dashboardApi = {
  async getTelemetryHistory(limit = 60): Promise<DashboardTelemetryResponse> {
    const response = await apiClient.get<DashboardTelemetryResponse>('/telemetry/dashboard', {
      params: { limit },
    });
    return response.data;
  },

  async getDeviceStatuses(): Promise<DeviceStatusResponse[]> {
    const response = await apiClient.get<DeviceStatusResponse[]>('/devices/status');
    return response.data;
  },

  async getEspStatus(): Promise<EspStatusResponse> {
    const response = await apiClient.get<EspStatusResponse>('/devices/esp-status');
    return response.data;
  },

  /**
   * Gửi lệnh điều khiển thiết bị xuống Backend.
   * Backend sau đó sẽ publish vào MQTT Broker để gửi tới ESP8266
   */
  async controlDevice(command: DeviceControlRequest): Promise<DeviceControlResponse> {
    const response = await apiClient.post<unknown>('/devices/control', command);
    if (!isDeviceControlResponse(response.data)) throw new Error('Invalid device control response.');
    return response.data;
  },
};
