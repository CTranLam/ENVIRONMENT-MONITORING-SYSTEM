import dayjs from 'dayjs';
import apiClient from '@/services/apiClient';
import type {
  PaginatedSensorDataResponse,
  SensorDataFilters,
  SensorDataRecord,
  SensorType,
} from '@/features/monitoring/types/sensor-data.types';

/** Raw row shape returned by `GET /api/sensors/history`. */
interface SensorDataRecordResponse {
  id: string;
  sensorName: string;
  sensorType: string;
  value: number;
  unit: string;
  recordedAt: string;
}

interface PaginatedSensorDataResponseDto {
  items: SensorDataRecordResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const SENSOR_TYPE_KEYS: Record<string, SensorType> = {
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  LIGHT: 'light',
};

const toSensorType = (sensorType: string): SensorType | null =>
  SENSOR_TYPE_KEYS[sensorType.toUpperCase()] ?? null;

/** Backend sends ISO-8601 UTC; the table and date pickers use `YYYY-MM-DD HH:mm:ss` local time. */
const toDisplayTimestamp = (recordedAt: string): string =>
  dayjs(recordedAt).format('YYYY-MM-DD HH:mm:ss');

/**
 * The date pickers work with local wall-clock strings, but the API compares absolute
 * instants, so the range is converted to UTC ISO-8601 before it leaves the browser.
 * Without this a machine in UTC+7 would ask for a window 7 hours off the server clock.
 */
const toInstantParam = (localTimestamp: string | null): string | null =>
  localTimestamp ? dayjs(localTimestamp).toISOString() : null;

const toRecord = (item: SensorDataRecordResponse): SensorDataRecord | null => {
  const type = toSensorType(item.sensorType);
  if (!type || typeof item.value !== 'number' || !Number.isFinite(item.value)) {
    return null;
  }

  return {
    id: item.id,
    name: item.sensorName,
    type,
    value: item.value,
    unit: item.unit,
    timestamp: toDisplayTimestamp(item.recordedAt),
  };
};

const isSensorDataRecordResponse = (value: unknown): value is SensorDataRecordResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.sensorName === 'string' &&
    typeof candidate.sensorType === 'string' &&
    typeof candidate.value === 'number' &&
    Number.isFinite(candidate.value) &&
    typeof candidate.unit === 'string' &&
    typeof candidate.recordedAt === 'string'
  );
};

const isPaginatedSensorDataResponse = (
  value: unknown,
): value is PaginatedSensorDataResponseDto => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.items) &&
    candidate.items.every(isSensorDataRecordResponse) &&
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

export const sensorDataApi = {
  /**
   * Truy vấn lịch sử cảm biến từ Backend (`GET /api/sensors/history`).
   *
   * <p>Toàn bộ filter (search, type, khoảng thời gian), sort và phân trang được đẩy
   * xuống server; không còn dữ liệu mock ở client.</p>
   */
  async getHistory(filters: SensorDataFilters): Promise<PaginatedSensorDataResponse> {
    const response = await apiClient.get<unknown>('/sensors/history', {
      params: {
        search: filters.search,
        type: filters.type,
        startTime: toInstantParam(filters.startTime),
        endTime: toInstantParam(filters.endTime),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page,
        pageSize: filters.pageSize,
      },
    });

    if (!isPaginatedSensorDataResponse(response.data)) {
      throw new Error('Dữ liệu cảm biến trả về không đúng định dạng.');
    }

    return {
      items: response.data.items
        .map(toRecord)
        .filter((record): record is SensorDataRecord => record !== null),
      total: response.data.total,
      page: response.data.page,
      pageSize: response.data.pageSize,
      totalPages: response.data.totalPages,
    };
  },
};
