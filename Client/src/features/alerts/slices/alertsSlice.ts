import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AlertItem, AlertsState, AlertThresholds } from '../types/alerts.types';

const defaultThresholds: AlertThresholds = {
  tempMin: 15,
  tempMax: 37,
  humidityMin: 35,
  humidityMax: 80,
  lightMin: 100,
  lightMax: 700, // Ngưỡng ánh sáng tối đa đặt 700 Lux theo yêu cầu
};

const initialState: AlertsState = {
  isSystemOnline: true, // Trạng thái mặc định Online (sau này call từ BE)
  currentPopupAlert: null,
  alertQueue: [],
  alertHistory: [],
  thresholds: defaultThresholds,
};

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    // Kích hoạt một cảnh báo mới
    triggerAlert: (state, action: PayloadAction<AlertItem>) => {
      const newAlert = action.payload;

      // Không thêm cảnh báo trùng loại nếu đang hiển thị
      if (state.currentPopupAlert?.type === newAlert.type) {
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
    setSystemOnline: (state, action: PayloadAction<boolean>) => {
      state.isSystemOnline = action.payload;

      if (!action.payload) {
        // Khi mất kết nối: Tạo cảnh báo nguy cấp ngay
        const offlineAlert: AlertItem = {
          id: `sys-offline-${Date.now()}`,
          type: 'SYSTEM_OFFLINE',
          severity: 'critical',
          title: 'Hệ thống mất kết nối (System Disconnected)',
          message:
            'Không thể thiết lập kết nối tới thiết bị IoT hoặc máy chủ. Vui lòng kiểm tra lại đường truyền mạng, bộ định tuyến WiFi hoặc nguồn cấp thiết bị!',
          timestamp: new Date().toLocaleTimeString('vi-VN'),
          actionButtonText: 'Kiểm tra kết nối',
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

    // Chuyển đổi qua lại giữa Online và Offline (hỗ trợ test & demo)
    toggleSystemOnline: (state) => {
      alertsSlice.caseReducers.setSystemOnline(state, {
        payload: !state.isSystemOnline,
        type: 'alerts/setSystemOnline',
      });
    },

    // Cập nhật cấu hình các ngưỡng đo
    updateThresholds: (state, action: PayloadAction<Partial<AlertThresholds>>) => {
      state.thresholds = { ...state.thresholds, ...action.payload };
    },

    // Xóa lịch sử cảnh báo
    clearAlertHistory: (state) => {
      state.alertHistory = [];
    },
  },
});

export const {
  triggerAlert,
  dismissCurrentPopup,
  setSystemOnline,
  toggleSystemOnline,
  updateThresholds,
  clearAlertHistory,
} = alertsSlice.actions;

export const alertsReducer = alertsSlice.reducer;
export default alertsReducer;

