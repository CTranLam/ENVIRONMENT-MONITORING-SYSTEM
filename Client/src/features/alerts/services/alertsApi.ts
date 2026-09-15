import apiClient from '@/services/apiClient';
import type {
  AlertConfiguration,
  AlertThresholds,
  UpdateAlertThresholdsRequest,
} from '@/features/alerts/types/alerts.types';
import { DEFAULT_ALERT_THRESHOLDS } from '@/features/alerts/types/alerts.types';

let currentConfiguration: AlertConfiguration = {
  thresholds: { ...DEFAULT_ALERT_THRESHOLDS },
};

const isAlertThresholds = (value: unknown): value is AlertThresholds => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.tempMin === 'number' &&
    Number.isFinite(candidate.tempMin) &&
    typeof candidate.tempMax === 'number' &&
    Number.isFinite(candidate.tempMax) &&
    typeof candidate.humidityMin === 'number' &&
    Number.isFinite(candidate.humidityMin) &&
    typeof candidate.humidityMax === 'number' &&
    Number.isFinite(candidate.humidityMax) &&
    typeof candidate.lightMin === 'number' &&
    Number.isFinite(candidate.lightMin) &&
    typeof candidate.lightMax === 'number' &&
    Number.isFinite(candidate.lightMax)
  );
};

const isAlertConfiguration = (value: unknown): value is AlertConfiguration => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return isAlertThresholds((value as Record<string, unknown>).thresholds);
};

export const alertsApi = {
  async getConfiguration(): Promise<AlertConfiguration> {
    try {
      const response = await apiClient.get<unknown>('/alerts/configuration');
      if (isAlertConfiguration(response.data)) {
        currentConfiguration = response.data;
        return currentConfiguration;
      }
    } catch {
      // Backend chưa sẵn sàng hoặc response sai: dùng cấu hình mock.
    }

    return currentConfiguration;
  },

  async updateThresholds(
    patch: UpdateAlertThresholdsRequest,
  ): Promise<AlertConfiguration> {
    try {
      const response = await apiClient.put<unknown>('/alerts/configuration', patch);
      if (isAlertConfiguration(response.data)) {
        currentConfiguration = response.data;
        return currentConfiguration;
      }
    } catch {
      // Backend chưa sẵn sàng hoặc response sai: cập nhật mock trong phiên hiện tại.
    }

    currentConfiguration = {
      thresholds: { ...currentConfiguration.thresholds, ...patch },
    };
    return currentConfiguration;
  },
};
