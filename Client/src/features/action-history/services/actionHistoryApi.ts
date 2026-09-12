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
export function generateUuidV7(timestampMs: number = Date.now()): string {
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
  { key: 'light', name: 'Light', deviceId: '0191e4a0-7112-7801-b12a-000000000002' },
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

export const actionHistoryApi = {
  /**
   * Truy vấn lịch sử hành động điều khiển thiết bị:
   * Ưu tiên gọi HTTP Backend API (`/actions/history`).
   * Tự động fallback sang Mock Data Engine nếu BE chưa sẵn sàng.
   */
  async getActionHistory(filters: ActionHistoryFilters): Promise<PaginatedActionHistoryResponse> {
    try {
      const response = await apiClient.get<PaginatedActionHistoryResponse>('/actions/history', {
        params: filters,
        timeout: 2500,
      });

      if (response.data && Array.isArray(response.data.items)) {
        return response.data;
      }
      throw new Error('Dữ liệu API không đúng định dạng');
    } catch {
      let filtered = [...MOCK_ACTION_HISTORY];

      // 1. Tìm kiếm theo tên thiết bị hoặc deviceId
      if (filters.search && filters.search.trim()) {
        const query = filters.search.trim().toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.device.toLowerCase().includes(query) ||
            item.deviceId.toLowerCase().includes(query)
        );
      }

      // 2. Lọc theo thiết bị
      if (filters.device && filters.device !== 'all') {
        filtered = filtered.filter((item) => item.deviceKey === filters.device);
      }

      // 3. Lọc theo hành động (ON/OFF)
      if (filters.action && filters.action !== 'all') {
        filtered = filtered.filter((item) => item.action === filters.action);
      }

      // 4. Sắp xếp
      filtered.sort((a, b) => {
        let cmp = 0;
        if (filters.sortBy === 'deviceId') {
          cmp = a.deviceId.localeCompare(b.deviceId);
        } else if (filters.sortBy === 'device') {
          cmp = a.device.localeCompare(b.device);
        } else if (filters.sortBy === 'action') {
          cmp = a.action.localeCompare(b.action);
        } else if (filters.sortBy === 'status') {
          cmp = a.status.localeCompare(b.status);
        } else if (filters.sortBy === 'timestamp') {
          cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        return filters.sortOrder === 'asc' ? cmp : -cmp;
      });

      // 5. Phân trang
      const total = filtered.length;
      const page = typeof filters.page === 'number' && filters.page > 0 ? filters.page : 1;
      const pageSize = typeof filters.pageSize === 'number' && filters.pageSize > 0 ? filters.pageSize : 10;
      const startIndex = (page - 1) * pageSize;
      const items = filtered.slice(startIndex, startIndex + pageSize);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      await new Promise((resolve) => setTimeout(resolve, 100));

      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
      };
    }
  },
};

