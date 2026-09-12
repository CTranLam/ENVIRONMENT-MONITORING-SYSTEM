import apiClient from '@/services/apiClient';
import type {
  SensorDataRecord,
  SensorDataFilters,
  PaginatedSensorDataResponse,
  SensorType,
} from '../types/sensor-data.types';

/**
 * Tạo chuỗi UUID v7 tuân thủ chuẩn RFC 9562 (Time-ordered UUID).
 * Cấu trúc: 48-bit timestamp + 4-bit ver 7 + 12-bit rand + 2-bit var (10xx) + 62-bit rand.
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

// 100 bản ghi mock cố định
const MOCK_RECORDS = createInitialMockData();

export const sensorDataApi = {
  /**
   * Truy vấn danh sách lịch sử cảm biến:
   * Ưu tiên gọi HTTP Backend API (`/sensors/history`).
   * Tự động fallback sang Mock Data Engine nếu BE chưa sẵn sàng.
   */
  async getSensorData(filters: SensorDataFilters): Promise<PaginatedSensorDataResponse> {
    try {
      const response = await apiClient.get<PaginatedSensorDataResponse>('/sensors/history', {
        params: filters,
        timeout: 2500,
      });

      // Kiểm tra tính hợp lệ của response từ Backend (tránh trường hợp Vite trả index.html hoặc dữ liệu sai định dạng)
      if (response.data && Array.isArray(response.data.items)) {
        return response.data;
      }
      throw new Error('Dữ liệu API không đúng định dạng PaginatedSensorDataResponse');
    } catch {
      // Fallback sang Mock Data Engine cục bộ
      let filtered = [...MOCK_RECORDS];

      // 1. Lọc theo search (name hoặc id)
      if (filters.search && filters.search.trim()) {
        const query = filters.search.trim().toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query)
        );
      }

      // 2. Lọc theo sensor type
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter((item) => item.type === filters.type);
      }

      // 3. Sắp xếp
      filtered.sort((a, b) => {
        let cmp = 0;
        if (filters.sortBy === 'id') {
          cmp = a.id.localeCompare(b.id);
        } else if (filters.sortBy === 'name') {
          cmp = a.name.localeCompare(b.name);
        } else if (filters.sortBy === 'value') {
          cmp = a.value - b.value;
        } else if (filters.sortBy === 'timestamp') {
          cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        return filters.sortOrder === 'asc' ? cmp : -cmp;
      });

      // 4. Phân trang
      const total = filtered.length;
      const page = typeof filters.page === 'number' && filters.page > 0 ? filters.page : 1;
      const pageSize = typeof filters.pageSize === 'number' && filters.pageSize > 0 ? filters.pageSize : 10;
      const startIndex = (page - 1) * pageSize;
      const items = filtered.slice(startIndex, startIndex + pageSize);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      // Giả lập network delay ngắn (100ms)
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
