import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { dashboardApi } from '@/features/dashboard/services/dashboardApi';
import type {
  DashboardTelemetryResponse,
  DashboardState,
  DeviceControlRequest,
  DeviceControlResponse,
  DeviceKey,
  SensorPoint,
  SensorTelemetryPayload,
  DeviceStatusResponse,
  EspStatusResponse,
} from '@/features/dashboard/types/dashboard.types';

const MAX_POINTS = 60;

const toPoint = (recordedAt: string, value: number): SensorPoint => ({
  recordedAt,
  time: new Date(recordedAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }),
  value,
});

const appendPoint = (points: SensorPoint[], recordedAt: string, value: number) => {
  if (points.at(-1)?.recordedAt === recordedAt) return points;
  return [...points, toPoint(recordedAt, value)].slice(-MAX_POINTS);
};

const initialState: DashboardState = {
  deviceState: {
    ledGreen: false,
    ledRed: false,
  },
  tempData: [],
  humidityData: [],
  lightData: [],
  currentTemp: null,
  currentHumidity: null,
  currentLight: null,
  isControllingDevice: false,
  pendingDeviceKey: null,
  espOnline: false,
  isLoadingTelemetry: false,
  telemetryConnection: 'disconnected',
};

export const toggleDeviceThunk = createAsyncThunk<
  DeviceControlResponse,
  DeviceControlRequest
>(
  'dashboard/toggleDevice',
  (command) => dashboardApi.controlDevice(command),
);

export const fetchDashboardTelemetryThunk = createAsyncThunk<
  DashboardTelemetryResponse,
  number
>('dashboard/fetchTelemetry', (limit) => dashboardApi.getTelemetryHistory(limit));

export const fetchDeviceStatusesThunk = createAsyncThunk<DeviceStatusResponse[]>(
  'dashboard/fetchDeviceStatuses',
  () => dashboardApi.getDeviceStatuses(),
);

export const fetchEspStatusThunk = createAsyncThunk<EspStatusResponse>(
  'dashboard/fetchEspStatus',
  () => dashboardApi.getEspStatus(),
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

    setTelemetryConnection: (state, action: PayloadAction<DashboardState['telemetryConnection']>) => {
      state.telemetryConnection = action.payload;
    },

    setDeviceStatus: (state, action: PayloadAction<DeviceStatusResponse>) => {
      const { deviceKey, on } = action.payload;
      state.deviceState[deviceKey] = on;
      if (state.pendingDeviceKey === deviceKey) state.pendingDeviceKey = null;
      state.isControllingDevice = state.pendingDeviceKey !== null;
    },

    setEspStatus: (state, action: PayloadAction<EspStatusResponse>) => {
      state.espOnline = action.payload.online;
    },

    clearPendingDevice: (state, action: PayloadAction<{ deviceKey: DeviceKey }>) => {
      if (state.pendingDeviceKey === action.payload.deviceKey) {
        state.pendingDeviceKey = null;
        state.isControllingDevice = false;
      }
    },

    // Thêm điểm cảm biến mới (hứng dữ liệu thời gian thực từ WebSocket hoặc stream)
    addSensorTelemetryPoint: (
      state,
      action: PayloadAction<SensorTelemetryPayload>
    ) => {
      const { recordedAt, temperature, humidity, light } = action.payload;

      // Cập nhật giá trị đo tức thời
      state.currentTemp = temperature;
      state.currentHumidity = humidity;
      state.currentLight = light;

      state.tempData = appendPoint(state.tempData, recordedAt, temperature);
      state.humidityData = appendPoint(state.humidityData, recordedAt, humidity);
      state.lightData = appendPoint(state.lightData, recordedAt, light);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardTelemetryThunk.pending, (state) => {
        state.isLoadingTelemetry = true;
      })
      .addCase(fetchDashboardTelemetryThunk.fulfilled, (state, action) => {
        const { temperature, humidity, light } = action.payload;
        state.isLoadingTelemetry = false;
        state.tempData = temperature.map((point) => toPoint(point.recordedAt, point.value));
        state.humidityData = humidity.map((point) => toPoint(point.recordedAt, point.value));
        state.lightData = light.map((point) => toPoint(point.recordedAt, point.value));
        state.currentTemp = state.tempData.at(-1)?.value ?? null;
        state.currentHumidity = state.humidityData.at(-1)?.value ?? null;
        state.currentLight = state.lightData.at(-1)?.value ?? null;
      })
      .addCase(fetchDashboardTelemetryThunk.rejected, (state) => {
        state.isLoadingTelemetry = false;
      })
      .addCase(fetchDeviceStatusesThunk.fulfilled, (state, action) => {
        action.payload.forEach((status) => { state.deviceState[status.deviceKey] = status.on; });
      })
      .addCase(fetchEspStatusThunk.fulfilled, (state, action) => {
        state.espOnline = action.payload.online;
      })
      .addCase(toggleDeviceThunk.pending, (state, action) => {
        state.isControllingDevice = true;
        state.pendingDeviceKey = action.meta.arg.deviceKey;
      })
      .addCase(toggleDeviceThunk.fulfilled, () => {
        // The switch changes only after an MQTT status acknowledgement from ESP8266.
      })
      .addCase(toggleDeviceThunk.rejected, (state, action) => {
        state.isControllingDevice = false;
        if (state.pendingDeviceKey === action.meta.arg.deviceKey) state.pendingDeviceKey = null;
      });
  },
});

export const {
  setDeviceStateDirect,
  setTelemetryConnection,
  setDeviceStatus,
  setEspStatus,
  clearPendingDevice,
  addSensorTelemetryPoint,
} = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
export default dashboardReducer;
