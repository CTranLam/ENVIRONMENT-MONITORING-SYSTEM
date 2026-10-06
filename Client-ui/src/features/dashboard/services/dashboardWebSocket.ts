import { Client } from '@stomp/stompjs';
import type {
  DeviceStatusResponse,
  EspStatusResponse,
  SensorTelemetryPayload,
  TelemetryConnectionState,
} from '@/features/dashboard/types/dashboard.types';

interface TelemetryMessage extends SensorTelemetryPayload {}

const websocketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

/** Callbacks registered by every hook instance that consumes the realtime feed. */
interface TelemetryListener {
  onMessage: (message: TelemetryMessage) => void;
  onStateChange: (state: TelemetryConnectionState) => void;
  onDeviceStatus: (status: DeviceStatusResponse) => void;
  onEspStatus: (status: EspStatusResponse) => void;
}

/**
 * Shared STOMP client.
 *
 * The realtime feed carries telemetry, device status and the ESP8266 heartbeat, so
 * several parts of the app (dashboard charts, global offline popup, footer status)
 * need it simultaneously. A single reference-counted connection with a listener
 * registry avoids opening duplicate sockets while the Dashboard is mounted inside
 * `MainLayout`.
 */
let sharedClient: Client | null = null;
let lastConnectionState: TelemetryConnectionState = 'disconnected';
const listeners = new Set<TelemetryListener>();

const notifyState = (state: TelemetryConnectionState) => {
  lastConnectionState = state;
  listeners.forEach((listener) => listener.onStateChange(state));
};

const createClient = (accessToken: string): Client => {
  const client = new Client({
    brokerURL: websocketUrl,
    connectHeaders: { Authorization: `Bearer ${accessToken}` },
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      notifyState('connected');
      client.subscribe('/topic/telemetry', (frame) => {
        try {
          const message = JSON.parse(frame.body) as TelemetryMessage;
          if (
            typeof message.recordedAt === 'string' &&
            typeof message.temperature === 'number' &&
            typeof message.humidity === 'number' &&
            typeof message.light === 'number'
          ) {
            listeners.forEach((listener) => listener.onMessage(message));
          }
        } catch {
          // Ignore an invalid realtime frame and keep the connection alive.
        }
      });
      client.subscribe('/topic/device-status', (frame) => {
        try {
          const status = JSON.parse(frame.body) as DeviceStatusResponse;
          listeners.forEach((listener) => listener.onDeviceStatus(status));
        } catch { /* ignore invalid frames */ }
      });
      client.subscribe('/topic/system-status', (frame) => {
        try {
          const status = JSON.parse(frame.body) as EspStatusResponse;
          listeners.forEach((listener) => listener.onEspStatus(status));
        } catch { /* ignore invalid frames */ }
      });
    },
    onWebSocketClose: () => notifyState('disconnected'),
    onWebSocketError: () => notifyState('error'),
    onStompError: () => notifyState('error'),
  });

  notifyState('connecting');
  client.activate();
  return client;
};

const teardownSharedClient = () => {
  if (!sharedClient) return;
  const client = sharedClient;
  sharedClient = null;
  lastConnectionState = 'disconnected';
  void client.deactivate();
};

export const connectTelemetryWebSocket = (
  accessToken: string,
  onMessage: (message: TelemetryMessage) => void,
  onStateChange: (state: TelemetryConnectionState) => void,
  onDeviceStatus: (status: DeviceStatusResponse) => void,
  onEspStatus: (status: EspStatusResponse) => void,
) => {
  const listener: TelemetryListener = { onMessage, onStateChange, onDeviceStatus, onEspStatus };
  listeners.add(listener);

  if (!sharedClient) {
    sharedClient = createClient(accessToken);
  } else {
    // A connection already exists, so this consumer never sees the original
    // connecting/connected transition. Replay the current state.
    onStateChange(lastConnectionState);
  }

  let released = false;

  return () => {
    if (released) return;
    released = true;
    listeners.delete(listener);
    if (listeners.size === 0) {
      teardownSharedClient();
    }
  };
};
