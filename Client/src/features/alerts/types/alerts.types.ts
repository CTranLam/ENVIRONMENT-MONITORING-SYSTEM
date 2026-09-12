export type AlertType =
  | 'SYSTEM_OFFLINE'
  | 'TEMPERATURE_HIGH'
  | 'TEMPERATURE_LOW'
  | 'HUMIDITY_HIGH'
  | 'HUMIDITY_LOW'
  | 'LIGHT_HIGH'
  | 'LIGHT_LOW';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertItem {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  currentValue?: number | string;
  thresholdValue?: number;
  unit?: string;
  timestamp: string;
  actionDevice?: 'coolingFan' | 'mistingSystem' | 'ventilationFan' | 'light';
  actionTargetState?: boolean;
  actionButtonText?: string;
}

export interface AlertThresholds {
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  lightMin: number;
  lightMax: number;
}

export interface AlertsState {
  isSystemOnline: boolean;
  currentPopupAlert: AlertItem | null;
  alertQueue: AlertItem[];
  alertHistory: AlertItem[];
  thresholds: AlertThresholds;
}

