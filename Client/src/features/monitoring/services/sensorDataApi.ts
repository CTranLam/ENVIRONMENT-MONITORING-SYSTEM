import apiClient from '@/services/apiClient';
import type {
  SensorDataRecord,
  SensorDataFilters,
  PaginatedSensorDataResponse,
  SensorType,
} from '@/features/monitoring/types/sensor-data.types';

/**
 * Tạo chuỗi UUID v7 tuân thủ chuẩn RFC 9562 (Time-ordered UUID).
 * Cấu trúc: 48-bit timestamp + 4-bit ver 7 + 12-bit rand + 2-bit var (10xx) + 62-bit rand.
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

  // Version 7 in byte 6 high nibble
  bytes[6] = 0x70 | (bytes[6] & 0x0f);
  // RFC variant 10xx in byte 8 high 2 bits
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

/**
 * Khởi tạo 100 bản ghi dữ liệu cảm biến mẫu với UUID v7 chuẩn
 */
function createInitialMockData(): SensorDataRecord[] {
  const records: SensorDataRecord[] = [];
  const now = Date.now();
  const types: { type: SensorType; name: string; unit: string }[] = [
    { type: 'temperature', name: 'DHT22 - Temperature', unit: '°C' },
    { type: 'humidity', name: 'DHT22 - Humidity', unit: '%' },
    { type: 'light', name: 'LDR - Light Intensity', unit: 'Lux' },
  ];

  for (let i = 0; i < 100; i++) {
    // Mỗi bản ghi cách nhau 3 phút ngược về quá khứ
    const timeOffset = i * 3 * 60 * 1000 + Math.floor(Math.random() * 30000);
    const recordTime = now - timeOffset;
    const config = types[i % types.length];

    let value = 0;
    if (config.type === 'temperature') {
      value = Number((25.0 + Math.sin(i * 0.3) * 6 + Math.random() * 4).toFixed(1));
    } else if (config.type === 'humidity') {
      value = Math.round(65 + Math.cos(i * 0.25) * 15 + Math.random() * 6);
    } else {
      value = Math.round(350 + Math.sin(i * 0.4) * 180 + Math.random() * 60);
    }

    records.push({
      id: generateUuidV7(recordTime),
      name: config.name,
      type: config.type,
      value,
      unit: config.unit,
      timestamp: formatTimestamp(new Date(recordTime)),
    });
  }

  return records;
}

// Giữ cố định trong phiên làm việc để dữ liệu mock không thay đổi giữa các lần lọc.
const MOCK_RECORDS = createInitialMockData();

const isSensorDataRecord = (value: unknown): value is SensorDataRecord => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    (candidate.type === 'temperature' ||
      candidate.type === 'humidity' ||
      candidate.type === 'light') &&
    typeof candidate.value === 'number' &&
    Number.isFinite(candidate.value) &&
    typeof candidate.unit === 'string' &&
    typeof candidate.timestamp === 'string'
  );
};

const isPaginatedSensorDataResponse = (
  value: unknown,
): value is PaginatedSensorDataResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.items) &&
    candidate.items.every(isSensorDataRecord) &&
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

const getMockSensorData = (filters: SensorDataFilters): PaginatedSensorDataResponse => {
  let filtered = [...MOCK_RECORDS];

  if (filters.search.trim()) {
    const query = filters.search.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query),
    );
  }

  if (filters.type !== 'all') {
    filtered = filtered.filter((item) => item.type === filters.type);
  }

  filtered.sort((first, second) => {
    let comparison = 0;
    if (filters.sortBy === 'id') {
      comparison = first.id.localeCompare(second.id);
    } else if (filters.sortBy === 'name') {
      comparison = first.name.localeCompare(second.name);
    } else if (filters.sortBy === 'value') {
      comparison = first.value - second.value;
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

export const sensorDataApi = {
  /**
   * Truy vấn danh sách lịch sử cảm biến:
   * Ưu tiên gọi HTTP Backend API (`/sensors/history`).
   * Tự động fallback sang Mock Data Engine nếu BE chưa sẵn sàng.
   */
  async getHistory(filters: SensorDataFilters): Promise<PaginatedSensorDataResponse> {
    try {
      const response = await apiClient.get<unknown>('/sensors/history', {
        params: filters,
        timeout: 2500,
      });

      if (isPaginatedSensorDataResponse(response.data)) {
        return response.data;
      }
    } catch {
      // Backend chưa sẵn sàng hoặc request thất bại: dùng dữ liệu mock.
    }

    return getMockSensorData(filters);
  },
};
