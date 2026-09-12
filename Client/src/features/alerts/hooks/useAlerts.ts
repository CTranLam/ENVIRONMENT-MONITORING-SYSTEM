import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { AlertItem, AlertType } from '../types/alerts.types';
import {
  triggerAlert,
  dismissCurrentPopup,
  setSystemOnline,
  updateThresholds,
} from '../slices/alertsSlice';

const COOLDOWN_MS = 60000; // 60 giây giữa các lần nhắc lại cùng một loại cảnh báo nếu chưa khắc phục

export const useAlerts = () => {
  const dispatch = useAppDispatch();
  const { isSystemOnline, currentPopupAlert, alertHistory, thresholds } = useAppSelector(
    (state) => state.alerts
  );
  const { currentTemp, currentHumidity, currentLight } = useAppSelector(
    (state) => state.dashboard
  );

  // Lưu mốc thời gian lần cuối cảnh báo xuất hiện
  const lastAlertTimeRef = useRef<Record<string, number>>({});
  // Lưu trạng thái có đang trong đợt vượt ngưỡng hay không (để phát hiện chuyển trạng thái)
  const isExceededRef = useRef<Record<string, boolean>>({});

  // 1. Lắng nghe trạng thái online / offline của trình duyệt
  useEffect(() => {
    const handleOnline = () => dispatch(setSystemOnline(true));
    const handleOffline = () => dispatch(setSystemOnline(false));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  // 2. Kiểm tra và kích hoạt cảnh báo thông số cảm biến
  useEffect(() => {
    // Nếu hệ thống đang offline thì không kiểm tra cảm biến
    if (!isSystemOnline) return;

    const now = Date.now();
    const timeStr = new Date().toLocaleTimeString('vi-VN');

    const checkMetric = (
      type: AlertType,
      condition: boolean,
      createAlert: () => AlertItem
    ) => {
      const lastTime = lastAlertTimeRef.current[type] || 0;
      const isAlreadyExceeded = isExceededRef.current[type] || false;

      if (condition) {
        // Kích hoạt khi: mới vượt ngưỡng LẦN ĐẦU hoặc đã qua thời gian COOLDOWN
        if (!isAlreadyExceeded || now - lastTime > COOLDOWN_MS) {
          isExceededRef.current[type] = true;
          lastAlertTimeRef.current[type] = now;
          dispatch(triggerAlert(createAlert()));
        }
      } else {
        // Giá trị đã trở về mức an toàn: reset cờ để lần sau vượt ngưỡng sẽ cảnh báo ngay
        isExceededRef.current[type] = false;
      }
    };

    // A. Kiểm tra Nhiệt độ (Thresholds: min 15°C, max 37°C)
    checkMetric(
      'TEMPERATURE_HIGH',
      currentTemp > thresholds.tempMax,
      () => ({
        id: `temp-high-${now}`,
        type: 'TEMPERATURE_HIGH',
        severity: 'critical',
        title: 'Cảnh báo: Nhiệt độ vượt ngưỡng an toàn!',
        message: `Nhiệt độ hiện tại đo được là ${currentTemp}°C, đã vượt quá ngưỡng tối đa cho phép (${thresholds.tempMax}°C). Khuyến nghị kích hoạt hệ thống làm mát ngay lập tức!`,
        currentValue: currentTemp,
        thresholdValue: thresholds.tempMax,
        unit: '°C',
        timestamp: timeStr,
        actionDevice: 'coolingFan',
        actionTargetState: true,
        actionButtonText: 'Bật quạt làm mát ngay',
      })
    );

    checkMetric(
      'TEMPERATURE_LOW',
      currentTemp < thresholds.tempMin,
      () => ({
        id: `temp-low-${now}`,
        type: 'TEMPERATURE_LOW',
        severity: 'warning',
        title: 'Cảnh báo: Nhiệt độ môi trường quá thấp!',
        message: `Nhiệt độ hiện tại đo được là ${currentTemp}°C, thấp hơn ngưỡng tối thiểu an toàn (${thresholds.tempMin}°C). Vui lòng kiểm tra môi trường giám sát!`,
        currentValue: currentTemp,
        thresholdValue: thresholds.tempMin,
        unit: '°C',
        timestamp: timeStr,
      })
    );

    // B. Kiểm tra Độ ẩm (Thresholds: min 35%, max 80%)
    checkMetric(
      'HUMIDITY_HIGH',
      currentHumidity > thresholds.humidityMax,
      () => ({
        id: `humidity-high-${now}`,
        type: 'HUMIDITY_HIGH',
        severity: 'warning',
        title: 'Cảnh báo: Độ ẩm không khí quá cao!',
        message: `Độ ẩm đo được đạt mức ${currentHumidity}%, vượt ngưỡng an toàn (${thresholds.humidityMax}%). Nguy cơ gây ẩm mốc và đọng nước vi mạch điện tử!`,
        currentValue: currentHumidity,
        thresholdValue: thresholds.humidityMax,
        unit: '%',
        timestamp: timeStr,
        actionDevice: 'ventilationFan',
        actionTargetState: true,
        actionButtonText: 'Bật thông gió',
      })
    );

    checkMetric(
      'HUMIDITY_LOW',
      currentHumidity < thresholds.humidityMin,
      () => ({
        id: `humidity-low-${now}`,
        type: 'HUMIDITY_LOW',
        severity: 'warning',
        title: 'Cảnh báo: Độ ẩm không khí quá thấp!',
        message: `Độ ẩm đo được chỉ còn ${currentHumidity}%, thấp hơn ngưỡng tối thiểu (${thresholds.humidityMin}%). Không khí quá khô, dễ gây hiện tượng phóng tĩnh điện!`,
        currentValue: currentHumidity,
        thresholdValue: thresholds.humidityMin,
        unit: '%',
        timestamp: timeStr,
        actionDevice: 'mistingSystem',
        actionTargetState: true,
        actionButtonText: 'Bật phun sương',
      })
    );

    // C. Kiểm tra Ánh sáng (Thresholds: min 100 Lux, max 700 Lux)
    checkMetric(
      'LIGHT_HIGH',
      currentLight > thresholds.lightMax,
      () => ({
        id: `light-high-${now}`,
        type: 'LIGHT_HIGH',
        severity: 'warning',
        title: 'Cảnh báo: Cường độ ánh sáng vượt ngưỡng!',
        message: `Cường độ ánh sáng đo được là ${currentLight} Lux, đã vượt mức tối đa quy định (${thresholds.lightMax} Lux). Khuyến nghị tắt bớt hệ thống đèn chiếu sáng!`,
        currentValue: currentLight,
        thresholdValue: thresholds.lightMax,
        unit: 'Lux',
        timestamp: timeStr,
        actionDevice: 'light',
        actionTargetState: false,
        actionButtonText: 'Tắt đèn chiếu sáng ngay',
      })
    );

    checkMetric(
      'LIGHT_LOW',
      currentLight < thresholds.lightMin,
      () => ({
        id: `light-low-${now}`,
        type: 'LIGHT_LOW',
        severity: 'warning',
        title: 'Cảnh báo: Môi trường thiếu sáng!',
        message: `Cường độ ánh sáng đo được chỉ đạt ${currentLight} Lux, thấp hơn ngưỡng tối thiểu (${thresholds.lightMin} Lux). Bạn có muốn bật đèn LED chiếu sáng không?`,
        currentValue: currentLight,
        thresholdValue: thresholds.lightMin,
        unit: 'Lux',
        timestamp: timeStr,
        actionDevice: 'light',
        actionTargetState: true,
        actionButtonText: 'Bật đèn chiếu sáng ngay',
      })
    );
  }, [currentTemp, currentHumidity, currentLight, thresholds, isSystemOnline, dispatch]);

  const dismissAlert = useCallback(() => {
    dispatch(dismissCurrentPopup());
  }, [dispatch]);

  const setThresholdValues = useCallback(
    (newThresholds: Parameters<typeof updateThresholds>[0]) => {
      dispatch(updateThresholds(newThresholds));
    },
    [dispatch]
  );

  return {
    isSystemOnline,
    currentPopupAlert,
    alertHistory,
    thresholds,
    dismissAlert,
    setThresholdValues,
  };
};

export default useAlerts;

