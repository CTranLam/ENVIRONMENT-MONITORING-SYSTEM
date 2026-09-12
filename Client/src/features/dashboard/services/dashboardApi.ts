import apiClient from '@/services/apiClient';
import type { DeviceControlState } from '../types/dashboard.types';

export const dashboardApi = {
  /**
   * Gửi lệnh điều khiển thiết bị xuống Backend.
   * Backend sau đó sẽ publish vào MQTT Broker để gửi tới ESP8266
   */
  controlDevice: async (deviceKey: keyof DeviceControlState, state: boolean): Promise<boolean> => {
    try {
      await apiClient.post('/devices/control', {
        device: deviceKey,
        state: state ? 'ON' : 'OFF',
      });
      return true;
    } catch {
      // Khi backend chưa chạy, mô phỏng thành công
      return true;
    }
  },
};

