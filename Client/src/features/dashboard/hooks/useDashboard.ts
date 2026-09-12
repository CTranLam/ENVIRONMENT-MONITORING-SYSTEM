import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { DeviceControlState } from '../types/dashboard.types';
import {
  toggleDeviceThunk,
  addSensorTelemetryPoint,
} from '../slices/dashboardSlice';

export const useDashboard = () => {
  const dispatch = useAppDispatch();

  // Đọc toàn bộ state tập trung từ Redux Store qua useAppSelector
  const {
    deviceState,
    tempData,
    humidityData,
    lightData,
    currentTemp,
    currentHumidity,
    currentLight,
    isControllingDevice,
    error,
  } = useAppSelector((state) => state.dashboard);

  // Xử lý bật/tắt thiết bị: dispatch async thunk của Redux
  const handleToggleDevice = (deviceKey: keyof DeviceControlState) => {
    const targetState = !deviceState[deviceKey];
    dispatch(toggleDeviceThunk({ deviceKey, targetState }));
  };

  // Mô phỏng dòng dữ liệu thời gian thực (dispatch action addSensorTelemetryPoint vào Redux)
  // Sau này khi tích hợp WebSocket, chỉ cần lắng nghe event socket và dispatch action tương tự
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      // Tạo dao động nhẹ tự nhiên quanh giá trị đo hiện tại
      const temperature = +(35 + Math.sin(now.getTime() / 4000) * 3).toFixed(1);
      const humidity = +(40 + Math.cos(now.getTime() / 5000) * 15).toFixed(0);
      const light = +(30 + Math.sin(now.getTime() / 3000) * 10).toFixed(0);

      // Đẩy điểm mới vào Redux Store
      dispatch(
        addSensorTelemetryPoint({
          time: timeStr,
          temperature,
          humidity,
          light,
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return {
    deviceState,
    handleToggleDevice,
    tempData,
    humidityData,
    lightData,
    currentTemp,
    currentHumidity,
    currentLight,
    isControllingDevice,
    error,
  };
};

export default useDashboard;
