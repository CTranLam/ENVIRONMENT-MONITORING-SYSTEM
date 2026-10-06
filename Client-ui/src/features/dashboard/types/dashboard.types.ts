export type SensorMetric = 'temperature' | 'humidity' | 'light';

export interface SensorPoint {
  recordedAt: string;
  time: string;
  value: number;
}

export type DeviceKey = 'ledGreen' | 'ledRed';
export type DeviceControlState = Record<DeviceKey, boolean>;

export interface DeviceControlRequest {
  deviceKey: DeviceKey;
  targetState: boolean;
}

export type DeviceControlResponse = DeviceStatusResponse;

export interface DeviceStatusResponse {
  deviceKey: DeviceKey;
  on: boolean;
  status: 'ON' | 'OFF' | 'UNKNOWN' | 'PENDING';
}

export interface EspStatusResponse {
  online: boolean;
  lastSeenAt: string | null;
}

export interface SensorTelemetryPayload {
  recordedAt: string;
  temperature: number;
  humidity: number;
  light: number;
}

export interface MetricPointResponse {
  recordedAt: string;
  value: number;
}

export interface DashboardTelemetryResponse {
  temperature: MetricPointResponse[];
  humidity: MetricPointResponse[];
  light: MetricPointResponse[];
}

export type TelemetryConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface DashboardState {
  deviceState: DeviceControlState;
  tempData: SensorPoint[];
  humidityData: SensorPoint[];
  lightData: SensorPoint[];
  currentTemp: number | null;
  currentHumidity: number | null;
  currentLight: number | null;
  isControllingDevice: boolean;
  pendingDeviceKey: DeviceKey | null;
  espOnline: boolean;
  isLoadingTelemetry: boolean;
  telemetryConnection: TelemetryConnectionState;
}
