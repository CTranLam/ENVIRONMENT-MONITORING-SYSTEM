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
  // LDR ADC after inversion: 0 = darkest, 1023 = brightest.
  lightMin: 200,
  lightMax: 900,
};

export interface AlertsState {
  /** Browser/network reachability, driven by `navigator.onLine`. */
  isSystemOnline: boolean;
  /** Heartbeat of the ESP8266 board, driven by the backend WebSocket. */
  espOnline: boolean;
  currentPopupAlert: AlertItem | null;
  alertQueue: AlertItem[];
  alertHistory: AlertItem[];
  thresholds: AlertThresholds;
  isLoading: boolean;
  isUpdating: boolean;
  isInitialized: boolean;
}
import type { DeviceKey } from '@/features/dashboard';
