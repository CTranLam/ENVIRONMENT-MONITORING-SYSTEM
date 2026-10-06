import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { DeviceKey } from '@/features/dashboard/types/dashboard.types';
import {
  clearPendingDevice,
  toggleDeviceThunk,
} from '@/features/dashboard/slices/dashboardSlice';
import { useDashboardTelemetry } from '@/features/dashboard/hooks/useDashboardTelemetry';

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  useDashboardTelemetry();

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
    pendingDeviceKey,
    espOnline,
    telemetryConnection,
    isLoadingTelemetry,
  } = useAppSelector((state) => state.dashboard);

  const handleToggleDevice = useCallback(
    (deviceKey: DeviceKey) => {
      dispatch(toggleDeviceThunk({ deviceKey, targetState: !deviceState[deviceKey] }));
      setTimeout(() => {
        dispatch(clearPendingDevice({ deviceKey }));
      }, 6000);
    },
    [deviceState, dispatch],
  );

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
    pendingDeviceKey,
    espOnline,
    telemetryConnection,
    isLoadingTelemetry,
  };
};

export default useDashboard;
