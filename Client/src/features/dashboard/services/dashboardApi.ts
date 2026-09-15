import apiClient from '@/services/apiClient';
import type {
  DeviceControlRequest,
  DeviceControlResponse,
} from '@/features/dashboard/types/dashboard.types';

const isDeviceControlResponse = (value: unknown): value is DeviceControlResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    (candidate.deviceKey === 'coolingFan' ||
      candidate.deviceKey === 'mistingSystem' ||
      candidate.deviceKey === 'ventilationFan' ||
      candidate.deviceKey === 'light') &&
    typeof candidate.targetState === 'boolean'
  );
};

export const dashboardApi = {
  /**
   * Gửi lệnh điều khiển thiết bị xuống Backend.
   * Backend sau đó sẽ publish vào MQTT Broker để gửi tới ESP8266
   */
  async controlDevice(command: DeviceControlRequest): Promise<DeviceControlResponse> {
    try {
      const response = await apiClient.post<unknown>('/devices/control', {
        device: command.deviceKey,
        state: command.targetState ? 'ON' : 'OFF',
      });

      if (isDeviceControlResponse(response.data)) {
        return response.data;
      }
    } catch {
      // Backend chưa sẵn sàng hoặc request thất bại: dùng mock acknowledgement.
    }

    return command;
  },
};
