import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { dashboardApi } from '@/features/dashboard/services/dashboardApi';
import type {
  DashboardState,
  DeviceControlRequest,
  DeviceControlResponse,
  DeviceKey,
  SensorPoint,
  SensorTelemetryPayload,
} from '@/features/dashboard/types/dashboard.types';

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
  { time: '12:00:00', value: 125 },
  { time: '12:00:02', value: 150 },
  { time: '12:00:04', value: 200 },
  { time: '12:00:06', value: 700 },
  { time: '12:00:08', value: 625 },
  { time: '12:00:10', value: 800 },
  { time: '12:00:12', value: 850 },
  { time: '12:00:14', value: 950 },
  { time: '12:00:16', value: 1000 },
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
};

export const toggleDeviceThunk = createAsyncThunk<
  DeviceControlResponse,
  DeviceControlRequest
>(
  'dashboard/toggleDevice',
  (command) => dashboardApi.controlDevice(command),
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Cập nhật trạng thái thiết bị trực tiếp (dùng khi nhận phản hồi ack qua WebSocket từ ESP8266)
    setDeviceStateDirect: (
      state,
      action: PayloadAction<{ deviceKey: DeviceKey; newState: boolean }>
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
      state.currentLight = light;

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
      })
      .addCase(toggleDeviceThunk.rejected, (state, action) => {
        state.isControllingDevice = false;
        // Chỉ xảy ra với lỗi nội bộ bất thường; API bình thường luôn fallback về mock data.
        const { deviceKey, targetState } = action.meta.arg;
        state.deviceState[deviceKey] = !targetState;
      });
  },
});

export const { setDeviceStateDirect, addSensorTelemetryPoint } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
export default dashboardReducer;
