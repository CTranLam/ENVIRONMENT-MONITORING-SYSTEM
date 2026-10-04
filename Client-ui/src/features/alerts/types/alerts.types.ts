export type AlertType =
  | 'SYSTEM_OFFLINE'
  | 'TEMPERATURE_HIGH'
  | 'TEMPERATURE_LOW'
  | 'HUMIDITY_HIGH'
  | 'HUMIDITY_LOW'
  | 'LIGHT_HIGH'
  | 'LIGHT_LOW';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertAction {
  deviceKey: DeviceKey;
  targetState: boolean;
  label: string;
}

export interface AlertItem {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  currentValue?: number;
  thresholdValue?: number;
  unit?: string;
  timestamp: string;
  action?: AlertAction;
}

export interface AlertThresholds {
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  lightMin: number;
  lightMax: number;
}

export type UpdateAlertThresholdsRequest = Partial<AlertThresholds>;

export interface AlertConfiguration {
  thresholds: AlertThresholds;
}

export interface SystemStatusUpdate {
  isOnline: boolean;
  timestamp: string;
}

export const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  tempMin: 15,
  tempMax: 37,
  humidityMin: 35,
  humidityMax: 80,
  lightMin: 100,
  lightMax: 700,
};

export interface AlertsState {
  isSystemOnline: boolean;
  currentPopupAlert: AlertItem | null;
  alertQueue: AlertItem[];
  alertHistory: AlertItem[];
  thresholds: AlertThresholds;
  isLoading: boolean;
  isUpdating: boolean;
  isInitialized: boolean;
}
import type { DeviceKey } from '@/features/dashboard';

