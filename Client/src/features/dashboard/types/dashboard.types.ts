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

export interface SensorMetricConfig {
  type: 'temperature' | 'humidity' | 'light';
  title: string;
  unit: string;
  currentValue: number;
  color: string;
  threshold: number;
  yMin: number;
  yMax: number;
  yTicks: number[];
  data: SensorPoint[];
}

