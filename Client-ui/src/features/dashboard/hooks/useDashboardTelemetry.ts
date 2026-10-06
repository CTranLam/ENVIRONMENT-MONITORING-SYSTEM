import { useEffect } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { connectTelemetryWebSocket } from '@/features/dashboard/services/dashboardWebSocket';
import {
  addSensorTelemetryPoint,
  fetchDashboardTelemetryThunk,
  fetchDeviceStatusesThunk,
  fetchEspStatusThunk,
  setDeviceStatus,
  setEspStatus,
  setTelemetryConnection,
} from '@/features/dashboard/slices/dashboardSlice';

/**
 * Container hook that owns the realtime telemetry connection.
 *
 * It is mounted once for the whole shell (`MainLayout`) and once more by the
 * Dashboard page. `connectTelemetryWebSocket` keeps a single shared socket, so the
 * duplicated mount is intentional and cheap: the ESP8266 heartbeat keeps flowing on
 * every route, which is what lets the global "device offline" popup fire even when
 * the user is not looking at the Dashboard.
 */
export const useDashboardTelemetry = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isCurrentConnection = true;
    void dispatch(fetchDashboardTelemetryThunk(60));
    void dispatch(fetchDeviceStatusesThunk());
    void dispatch(fetchEspStatusThunk());

    const accessToken = sessionStorage.getItem('ems.accessToken');
    if (!accessToken) {
      dispatch(setTelemetryConnection('disconnected'));
      return;
    }

    const disconnect = connectTelemetryWebSocket(
      accessToken,
      (message) => {
        if (isCurrentConnection) dispatch(addSensorTelemetryPoint(message));
      },
      (state) => {
        if (isCurrentConnection) dispatch(setTelemetryConnection(state));
      },
      (status) => {
        if (isCurrentConnection) dispatch(setDeviceStatus(status));
      },
      (status) => {
        if (isCurrentConnection) dispatch(setEspStatus(status));
      },
    );
    return () => {
      isCurrentConnection = false;
      disconnect();
    };
  }, [dispatch]);
};
