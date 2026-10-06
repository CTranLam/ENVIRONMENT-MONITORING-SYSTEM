import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleDeviceThunk } from '@/features/dashboard';
import {
  dismissCurrentPopup,
  fetchAlertConfigurationThunk,
  setEspOnline,
  setSystemOnline,
  triggerAlert,
  updateAlertThresholdsThunk,
} from '@/features/alerts/slices/alertsSlice';
import type {
  AlertItem,
  AlertType,
  UpdateAlertThresholdsRequest,
} from '@/features/alerts/types/alerts.types';

const COOLDOWN_MS = 60_000;

interface UseAlertsOptions {
  initialize?: boolean;
  monitorTelemetry?: boolean;
}

const getCurrentTime = (): string => new Date().toLocaleTimeString('vi-VN');

export const useAlerts = ({
  initialize = false,
  monitorTelemetry = false,
}: UseAlertsOptions = {}) => {
  const dispatch = useAppDispatch();
  const {
    isSystemOnline,
    espOnline,
    currentPopupAlert,
    alertHistory,
    thresholds,
    isLoading,
    isUpdating,
    isInitialized,
  } = useAppSelector((state) => state.alerts);
  const { currentTemp, currentHumidity, currentLight } = useAppSelector(
    (state) => state.dashboard,
  );
  const lastAlertTimeRef = useRef<Partial<Record<AlertType, number>>>({});
  const isExceededRef = useRef<Partial<Record<AlertType, boolean>>>({});

  useEffect(() => {
    if (initialize && !isInitialized && !isLoading) {
      dispatch(fetchAlertConfigurationThunk());
    }
  }, [dispatch, initialize, isInitialized, isLoading]);

  useEffect(() => {
    if (!initialize) {
      return;
    }

    const updateNetworkStatus = (isOnline: boolean) => {
      dispatch(setSystemOnline({ isOnline, timestamp: getCurrentTime() }));
    };
    const handleOnline = () => updateNetworkStatus(true);
    const handleOffline = () => updateNetworkStatus(false);

    updateNetworkStatus(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, initialize]);

  /**
   * Đồng bộ heartbeat của ESP8266 (nhận qua WebSocket STOMP `/topic/system-status`)
   * vào tầng cảnh báo. Nhờ vậy khi board mất kết nối WiFi/MQTT trong lúc trình duyệt
   * vẫn online, popup `SYSTEM_OFFLINE` vẫn được bật lên.
   */
  useEffect(() => {
    if (!initialize) {
      return;
    }

    dispatch(setEspOnline({ isOnline: espOnline, timestamp: getCurrentTime() }));
  }, [dispatch, espOnline, initialize]);

  useEffect(() => {
    if (
      !monitorTelemetry ||
      !isSystemOnline ||
      currentTemp === null ||
      currentHumidity === null ||
      currentLight === null
    ) {
      return;
    }

    const now = Date.now();
    const timestamp = getCurrentTime();
    const evaluateMetric = (
      type: AlertType,
      condition: boolean,
      createAlert: () => AlertItem,
    ) => {
      const lastAlertTime = lastAlertTimeRef.current[type] ?? 0;
      const wasExceeded = isExceededRef.current[type] ?? false;

      if (condition) {
        if (!wasExceeded || now - lastAlertTime >= COOLDOWN_MS) {
          isExceededRef.current[type] = true;
          lastAlertTimeRef.current[type] = now;
          dispatch(triggerAlert(createAlert()));
        }
        return;
      }

      isExceededRef.current[type] = false;
    };

    evaluateMetric('TEMPERATURE_HIGH', currentTemp > thresholds.tempMax, () => ({
      id: `temperature-high-${now}`,
      type: 'TEMPERATURE_HIGH',
      severity: 'critical',
      title: 'Cảnh báo: Nhiệt độ vượt ngưỡng an toàn!',
      message: `Nhiệt độ hiện tại là ${currentTemp}°C, vượt ngưỡng tối đa ${thresholds.tempMax}°C.`,
      currentValue: currentTemp,
      thresholdValue: thresholds.tempMax,
      unit: '°C',
      timestamp,
      action: {
        deviceKey: 'ledGreen',
        targetState: true,
        label: 'Bật LED xanh',
      },
    }));
    evaluateMetric('TEMPERATURE_LOW', currentTemp < thresholds.tempMin, () => ({
      id: `temperature-low-${now}`,
      type: 'TEMPERATURE_LOW',
      severity: 'warning',
      title: 'Cảnh báo: Nhiệt độ môi trường quá thấp!',
      message: `Nhiệt độ hiện tại là ${currentTemp}°C, thấp hơn ngưỡng tối thiểu ${thresholds.tempMin}°C.`,
      currentValue: currentTemp,
      thresholdValue: thresholds.tempMin,
      unit: '°C',
      timestamp,
    }));
    evaluateMetric('HUMIDITY_HIGH', currentHumidity > thresholds.humidityMax, () => ({
      id: `humidity-high-${now}`,
      type: 'HUMIDITY_HIGH',
      severity: 'warning',
      title: 'Cảnh báo: Độ ẩm không khí quá cao!',
      message: `Độ ẩm hiện tại là ${currentHumidity}%, vượt ngưỡng ${thresholds.humidityMax}%.`,
      currentValue: currentHumidity,
      thresholdValue: thresholds.humidityMax,
      unit: '%',
      timestamp,
      action: {
        deviceKey: 'ledRed',
        targetState: true,
        label: 'Bật LED đỏ',
      },
    }));
    evaluateMetric('HUMIDITY_LOW', currentHumidity < thresholds.humidityMin, () => ({
      id: `humidity-low-${now}`,
      type: 'HUMIDITY_LOW',
      severity: 'warning',
      title: 'Cảnh báo: Độ ẩm không khí quá thấp!',
      message: `Độ ẩm hiện tại là ${currentHumidity}%, thấp hơn ngưỡng ${thresholds.humidityMin}%.`,
      currentValue: currentHumidity,
      thresholdValue: thresholds.humidityMin,
      unit: '%',
      timestamp,
      action: {
        deviceKey: 'ledGreen',
        targetState: true,
        label: 'Bật LED xanh',
      },
    }));
    evaluateMetric('LIGHT_HIGH', currentLight > thresholds.lightMax, () => ({
      id: `light-high-${now}`,
      type: 'LIGHT_HIGH',
      severity: 'warning',
      title: 'Cảnh báo: Cường độ ánh sáng vượt ngưỡng!',
      message: `Cường độ ánh sáng hiện tại là ${currentLight} Lux, vượt ngưỡng ${thresholds.lightMax} Lux.`,
      currentValue: currentLight,
      thresholdValue: thresholds.lightMax,
      unit: 'Lux',
      timestamp,
      action: {
        deviceKey: 'ledGreen',
        targetState: false,
        label: 'Tắt LED xanh',
      },
    }));
    evaluateMetric('LIGHT_LOW', currentLight < thresholds.lightMin, () => ({
      id: `light-low-${now}`,
      type: 'LIGHT_LOW',
      severity: 'warning',
      title: 'Cảnh báo: Môi trường thiếu sáng!',
      message: `Cường độ ánh sáng hiện tại là ${currentLight} Lux, thấp hơn ngưỡng ${thresholds.lightMin} Lux.`,
      currentValue: currentLight,
      thresholdValue: thresholds.lightMin,
      unit: 'Lux',
      timestamp,
      action: {
        deviceKey: 'ledGreen',
        targetState: true,
        label: 'Bật LED xanh',
      },
    }));
  }, [
    currentHumidity,
    currentLight,
    currentTemp,
    dispatch,
    isSystemOnline,
    monitorTelemetry,
    thresholds,
  ]);

  const dismissAlert = useCallback(() => {
    dispatch(dismissCurrentPopup());
  }, [dispatch]);

  const handleAlertAction = useCallback(
    (alert: AlertItem) => {
      if (alert.action) {
        dispatch(toggleDeviceThunk(alert.action));
      }
      dispatch(dismissCurrentPopup());
    },
    [dispatch],
  );

  const retryConnection = useCallback(() => {
    if (navigator.onLine) {
      dispatch(setSystemOnline({ isOnline: true, timestamp: getCurrentTime() }));
      dispatch(dismissCurrentPopup());
      return;
    }

    window.location.reload();
  }, [dispatch]);

  const setThresholdValues = useCallback(
    (patch: UpdateAlertThresholdsRequest) => dispatch(updateAlertThresholdsThunk(patch)),
    [dispatch],
  );

  return {
    isSystemOnline,
    currentPopupAlert,
    alertHistory,
    thresholds,
    isLoading,
    isUpdating,
    dismissAlert,
    handleAlertAction,
    retryConnection,
    setThresholdValues,
  };
};

export default useAlerts;
