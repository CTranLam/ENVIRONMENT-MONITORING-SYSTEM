import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { alertsApi } from '@/features/alerts/services/alertsApi';
import type {
  AlertConfiguration,
  AlertItem,
  AlertsState,
  SystemStatusUpdate,
  UpdateAlertThresholdsRequest,
} from '@/features/alerts/types/alerts.types';
import { DEFAULT_ALERT_THRESHOLDS } from '@/features/alerts/types/alerts.types';

const initialState: AlertsState = {
  isSystemOnline: true,
  currentPopupAlert: null,
  alertQueue: [],
  alertHistory: [],
  thresholds: { ...DEFAULT_ALERT_THRESHOLDS },
  isLoading: false,
  isUpdating: false,
  isInitialized: false,
};

export const fetchAlertConfigurationThunk = createAsyncThunk<AlertConfiguration>(
  'alerts/fetchConfiguration',
  () => alertsApi.getConfiguration(),
);

export const updateAlertThresholdsThunk = createAsyncThunk<
  AlertConfiguration,
  UpdateAlertThresholdsRequest
>('alerts/updateThresholds', (patch) => alertsApi.updateThresholds(patch));

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    // Kích hoạt một cảnh báo mới
    triggerAlert: (state, action: PayloadAction<AlertItem>) => {
      const newAlert = action.payload;

      if (
        state.currentPopupAlert?.type === newAlert.type ||
        state.alertQueue.some((alert) => alert.type === newAlert.type)
      ) {
        return;
      }

      // Lưu vào lịch sử cảnh báo (tối đa 50 mục)
      state.alertHistory = [newAlert, ...state.alertHistory.slice(0, 49)];

      // Nếu chưa có popup nào đang hiển thị, hiển thị ngay lập tức
      if (!state.currentPopupAlert) {
        state.currentPopupAlert = newAlert;
      } else {
        // Nếu đã có popup khác, kiểm tra độ ưu tiên ('critical' > 'warning')
        if (newAlert.severity === 'critical' && state.currentPopupAlert.severity !== 'critical') {
          // Đẩy popup hiện tại vào hàng đợi và hiển thị cảnh báo nguy cấp trước
          state.alertQueue.unshift(state.currentPopupAlert);
          state.currentPopupAlert = newAlert;
        } else {
          // Thêm vào hàng đợi chờ nếu chưa có trong hàng đợi
          const existsInQueue = state.alertQueue.some((a) => a.type === newAlert.type);
          if (!existsInQueue) {
            state.alertQueue.push(newAlert);
          }
        }
      }
    },

    // Đóng popup hiện tại và hiển thị cảnh báo tiếp theo trong hàng đợi (nếu có)
    dismissCurrentPopup: (state) => {
      if (state.alertQueue.length > 0) {
        state.currentPopupAlert = state.alertQueue.shift() || null;
      } else {
        state.currentPopupAlert = null;
      }
    },

    // Cập nhật trạng thái kết nối mạng của hệ thống
    setSystemOnline: (state, action: PayloadAction<SystemStatusUpdate>) => {
      const { isOnline, timestamp } = action.payload;
      if (state.isSystemOnline === isOnline) {
        return;
      }

      state.isSystemOnline = isOnline;

      if (!isOnline) {
        // Khi mất kết nối: Tạo cảnh báo nguy cấp ngay
        const offlineAlert: AlertItem = {
          id: `sys-offline-${timestamp}`,
          type: 'SYSTEM_OFFLINE',
          severity: 'critical',
          title: 'Hệ thống mất kết nối (System Disconnected)',
          message:
            'Không thể thiết lập kết nối tới thiết bị IoT hoặc máy chủ. Vui lòng kiểm tra lại đường truyền mạng, bộ định tuyến WiFi hoặc nguồn cấp thiết bị!',
          timestamp,
        };

        // Ưu tiên hiển thị ngay lập tức
        if (state.currentPopupAlert?.type !== 'SYSTEM_OFFLINE') {
          if (state.currentPopupAlert) {
            state.alertQueue.unshift(state.currentPopupAlert);
          }
          state.currentPopupAlert = offlineAlert;
          state.alertHistory = [offlineAlert, ...state.alertHistory.slice(0, 49)];
        }
      } else {
        // Khi có kết nối lại: Tự động đóng cảnh báo mất kết nối nếu đang mở
        if (state.currentPopupAlert?.type === 'SYSTEM_OFFLINE') {
          state.currentPopupAlert = state.alertQueue.shift() || null;
        }
        state.alertQueue = state.alertQueue.filter((a) => a.type !== 'SYSTEM_OFFLINE');
      }
    },

    clearAlertHistory: (state) => {
      state.alertHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlertConfigurationThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAlertConfigurationThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.thresholds = action.payload.thresholds;
      })
      .addCase(fetchAlertConfigurationThunk.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(updateAlertThresholdsThunk.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateAlertThresholdsThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.thresholds = action.payload.thresholds;
      })
      .addCase(updateAlertThresholdsThunk.rejected, (state) => {
        state.isUpdating = false;
      });
  },
});

export const {
  triggerAlert,
  dismissCurrentPopup,
  setSystemOnline,
  clearAlertHistory,
} = alertsSlice.actions;

export const alertsReducer = alertsSlice.reducer;
export default alertsReducer;
