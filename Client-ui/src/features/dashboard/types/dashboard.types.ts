export type SensorMetric = 'temperature' | 'humidity' | 'light';

export interface SensorPoint {
  time: string;
  value: number;
}

export interface DeviceControlState {
  coolingFan: boolean;
  mistingSystem: boolean;
  ventilationFan: boolean;
  light: boolean;
}

export type DeviceKey = keyof DeviceControlState;

export interface DeviceControlRequest {
  deviceKey: DeviceKey;
  targetState: boolean;
}

export type DeviceControlResponse = DeviceControlRequest;

export interface SensorTelemetryPayload {
  time: string;
  temperature: number;
  humidity: number;
  light: number;
}

export interface DashboardState {
  deviceState: DeviceControlState;
  tempData: SensorPoint[];
  humidityData: SensorPoint[];
  lightData: SensorPoint[];
  currentTemp: number;
  currentHumidity: number;
  currentLight: number;
  isControllingDevice: boolean;
}
