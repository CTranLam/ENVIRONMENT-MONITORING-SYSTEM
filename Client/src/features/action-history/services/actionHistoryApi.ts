import apiClient from '@/services/apiClient';
import type {
  ActionHistoryRecord,
  ActionHistoryFilters,
  PaginatedActionHistoryResponse,
  DeviceType,
  DeviceAction,
  ActionStatus,
} from '../types/action-history.types';

/**
 * Tạo chuỗi UUID v7 chuẩn RFC 9562
 */
function generateUuidV7(timestampMs: number = Date.now()): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  const ts = BigInt(timestampMs);
  bytes[0] = Number((ts >> 40n) & 0xffn);
  bytes[1] = Number((ts >> 32n) & 0xffn);
  bytes[2] = Number((ts >> 24n) & 0xffn);
  bytes[3] = Number((ts >> 16n) & 0xffn);
  bytes[4] = Number((ts >> 8n) & 0xffn);
  bytes[5] = Number(ts & 0xffn);

  bytes[6] = 0x70 | (bytes[6] & 0x0f);
  bytes[8] = 0x80 | (bytes[8] & 0x3f);

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Format timestamp sang 'YYYY-MM-DD HH:mm:ss'
 */
function formatTimestamp(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const DEVICE_CONFIGS: { key: DeviceType; name: string; deviceId: string }[] = [
  { key: 'coolingFan', name: 'Cooling Fan', deviceId: '0191e4a0-7112-7801-b12a-000000000001' },
  { key: 'mistingSystem', name: 'Misting System', deviceId: '0191e4a0-7112-7801-b12a-000000000002' },
  { key: 'ventilationFan', name: 'Ventilation Fan', deviceId: '0191e4a0-7112-7801-b12a-000000000003' },
  { key: 'light', name: 'Light', deviceId: '0191e4a0-7112-7801-b12a-000000000004' },
];

/**
 * Khởi tạo 100 bản ghi lịch sử điều khiển mẫu
 */
function createInitialMockHistory(): ActionHistoryRecord[] {
  const records: ActionHistoryRecord[] = [];
  const now = Date.now();

  for (let i = 0; i < 100; i++) {
    // Mỗi thao tác cách nhau 4-8 phút lùi dần về quá khứ
    const timeOffset = i * 6 * 60 * 1000 + Math.floor(Math.random() * 60000);
    const recordTime = now - timeOffset;
    const dev = DEVICE_CONFIGS[i % DEVICE_CONFIGS.length];
    const action: DeviceAction = (i % 2 === 0) ? 'ON' : 'OFF';
    // 92% thành công, 8% lỗi mô phỏng mất kết nối phần cứng
    const status: ActionStatus = (i % 13 === 0) ? 'FAILED' : 'SUCCESS';

    records.push({
      id: generateUuidV7(recordTime),
      deviceId: dev.deviceId,
      device: dev.name,
      deviceKey: dev.key,
      action,
      status,
      timestamp: formatTimestamp(new Date(recordTime)),
    });
  }

  return records;
}

const MOCK_ACTION_HISTORY = createInitialMockHistory();

const isActionHistoryRecord = (value: unknown): value is ActionHistoryRecord => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.deviceId === 'string' &&
    typeof candidate.device === 'string' &&
    (candidate.deviceKey === 'coolingFan' ||
      candidate.deviceKey === 'mistingSystem' ||
      candidate.deviceKey === 'ventilationFan' ||
      candidate.deviceKey === 'light') &&
    (candidate.action === 'ON' || candidate.action === 'OFF') &&
    (candidate.status === 'SUCCESS' || candidate.status === 'FAILED') &&
    typeof candidate.timestamp === 'string'
  );
};

const isPaginatedActionHistoryResponse = (
  value: unknown,
): value is PaginatedActionHistoryResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.items) &&
    candidate.items.every(isActionHistoryRecord) &&
    typeof candidate.total === 'number' &&
    Number.isFinite(candidate.total) &&
    typeof candidate.page === 'number' &&
    Number.isInteger(candidate.page) &&
    candidate.page > 0 &&
    typeof candidate.pageSize === 'number' &&
    Number.isInteger(candidate.pageSize) &&
    candidate.pageSize > 0 &&
    typeof candidate.totalPages === 'number' &&
    Number.isInteger(candidate.totalPages) &&
    candidate.totalPages > 0
  );
};

const getMockHistory = (
  filters: ActionHistoryFilters,
): PaginatedActionHistoryResponse => {
  let filtered = [...MOCK_ACTION_HISTORY];

  if (filters.search.trim()) {
    const query = filters.search.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.device.toLowerCase().includes(query) ||
        item.deviceId.toLowerCase().includes(query),
    );
  }

  if (filters.device !== 'all') {
    filtered = filtered.filter((item) => item.deviceKey === filters.device);
  }

  if (filters.action !== 'all') {
    filtered = filtered.filter((item) => item.action === filters.action);
  }

  filtered.sort((first, second) => {
    let comparison = 0;
    if (filters.sortBy === 'deviceId') {
      comparison = first.deviceId.localeCompare(second.deviceId);
    } else if (filters.sortBy === 'device') {
      comparison = first.device.localeCompare(second.device);
    } else if (filters.sortBy === 'action') {
      comparison = first.action.localeCompare(second.action);
    } else if (filters.sortBy === 'status') {
      comparison = first.status.localeCompare(second.status);
    } else {
      comparison = first.timestamp.localeCompare(second.timestamp);
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const startIndex = (page - 1) * filters.pageSize;

  return {
    items: filtered.slice(startIndex, startIndex + filters.pageSize),
    total,
    page,
    pageSize: filters.pageSize,
    totalPages,
  };
};

export const actionHistoryApi = {
  /**
   * Truy vấn lịch sử hành động điều khiển thiết bị:
   * Ưu tiên gọi HTTP Backend API (`/actions/history`).
   * Tự động fallback sang Mock Data Engine nếu BE chưa sẵn sàng.
   */
  async getHistory(filters: ActionHistoryFilters): Promise<PaginatedActionHistoryResponse> {
    try {
      const response = await apiClient.get<unknown>('/actions/history', {
        params: filters,
        timeout: 2500,
      });

      if (isPaginatedActionHistoryResponse(response.data)) {
        return response.data;
      }
    } catch {
      // Backend chưa sẵn sàng hoặc response sai: dùng dữ liệu mock.
    }

    return getMockHistory(filters);
  },
};
