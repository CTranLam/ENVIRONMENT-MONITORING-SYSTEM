import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import type { DeviceControlState, SensorPoint } from '../types/dashboard.types';
import { dashboardApi } from '../services/dashboardApi';

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
  error: string | null;
}

const initialTemperaturePoints: SensorPoint[] = [
  { time: '12:00:00', value: 10 },
  { time: '12:00:02', value: 9 },
  { time: '12:00:04', value: 12 },
  { time: '12:00:06', value: 35 },
  { time: '12:00:08', value: 34 },
  { time: '12:00:10', value: 36 },
  { time: '12:00:12', value: 35 },
  { time: '12:00:14', value: 37 },
  { time: '12:00:16', value: 36 },
];

const initialHumidityPoints: SensorPoint[] = [
  { time: '12:00:00', value: 20 },
  { time: '12:00:02', value: 21 },
  { time: '12:00:04', value: 16 },
  { time: '12:00:06', value: 68 },
  { time: '12:00:08', value: 62 },
  { time: '12:00:10', value: 50 },
  { time: '12:00:12', value: 75 },
  { time: '12:00:14', value: 82 },
  { time: '12:00:16', value: 85 },
];

const initialLightPoints: SensorPoint[] = [
  { time: '12:00:00', value: 5 },
  { time: '12:00:02', value: 6 },
  { time: '12:00:04', value: 8 },
  { time: '12:00:06', value: 28 },
  { time: '12:00:08', value: 25 },
  { time: '12:00:10', value: 32 },
  { time: '12:00:12', value: 34 },
  { time: '12:00:14', value: 38 },
  { time: '12:00:16', value: 40 },
];

const initialState: DashboardState = {
  deviceState: {
    coolingFan: true,
    mistingSystem: true,
    ventilationFan: true,
    light: true,
  },
  tempData: initialTemperaturePoints,
  humidityData: initialHumidityPoints,
  lightData: initialLightPoints,
  currentTemp: 36,
  currentHumidity: 32,
  currentLight: 1000,
  isControllingDevice: false,
  error: null,
};

// Async thunk để điều khiển thiết bị: gửi lệnh xuống BE -> MQTT -> ESP8266
export const toggleDeviceThunk = createAsyncThunk(
  'dashboard/toggleDevice',
  async (
    { deviceKey, targetState }: { deviceKey: keyof DeviceControlState; targetState: boolean },
    { rejectWithValue }
  ) => {
    try {
      await dashboardApi.controlDevice(deviceKey, targetState);
      const deviceNames: Record<keyof DeviceControlState, string> = {
        coolingFan: 'Quạt làm mát (Cooling Fan)',
        mistingSystem: 'Hệ thống phun sương (Misting System)',
        ventilationFan: 'Quạt thông gió (Ventilation Fan)',
        light: 'Đèn chiếu sáng (Light)',
      };
      message.success(
        `${deviceNames[deviceKey]} đã chuyển sang: ${targetState ? 'BẬT' : 'TẮT'}`
      );
      return { deviceKey, targetState };
    } catch (err: any) {
      message.error(`Không thể điều khiển thiết bị: ${err.message || 'Lỗi kết nối'}`);
      return rejectWithValue(err.message || 'Lỗi điều khiển thiết bị');
    }
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Cập nhật trạng thái thiết bị trực tiếp (dùng khi nhận phản hồi ack qua WebSocket từ ESP8266)
    setDeviceStateDirect: (
      state,
      action: PayloadAction<{ deviceKey: keyof DeviceControlState; newState: boolean }>
    ) => {
      state.deviceState[action.payload.deviceKey] = action.payload.newState;
    },

    // Thêm điểm cảm biến mới (hứng dữ liệu thời gian thực từ WebSocket hoặc stream)
    addSensorTelemetryPoint: (
      state,
      action: PayloadAction<SensorTelemetryPayload>
    ) => {
      const { time, temperature, humidity, light } = action.payload;

      // Cập nhật giá trị đo tức thời
      state.currentTemp = temperature;
      state.currentHumidity = humidity;
      state.currentLight = Math.round(light * 25);

      // Thêm điểm mới vào mảng và trượt mảng giữ tối đa 10 điểm
      state.tempData = [...state.tempData.slice(1), { time, value: temperature }];
      state.humidityData = [...state.humidityData.slice(1), { time, value: humidity }];
      state.lightData = [...state.lightData.slice(1), { time, value: light }];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleDeviceThunk.pending, (state, action) => {
        state.isControllingDevice = true;
        // Cập nhật lạc quan (optimistic update) trên giao diện ngay lập tức
        const { deviceKey, targetState } = action.meta.arg;
        state.deviceState[deviceKey] = targetState;
      })
      .addCase(toggleDeviceThunk.fulfilled, (state) => {
        state.isControllingDevice = false;
        state.error = null;
      })
      .addCase(toggleDeviceThunk.rejected, (state, action) => {
        state.isControllingDevice = false;
        state.error = action.payload as string;
        // Hoàn tác lại trạng thái nếu thất bại
        const { deviceKey, targetState } = action.meta.arg;
        state.deviceState[deviceKey] = !targetState;
      });
  },
});

export const { setDeviceStateDirect, addSensorTelemetryPoint } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
export default dashboardReducer;

