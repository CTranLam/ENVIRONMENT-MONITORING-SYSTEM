import dayjs from 'dayjs';
import apiClient from '@/services/apiClient';
import type {
  ActionHistoryFilters,
  ActionHistoryRecord,
  ActionStatus,
  DeviceAction,
  DeviceType,
  PaginatedActionHistoryResponse,
} from '@/features/action-history/types/action-history.types';

/** Raw row shape returned by `GET /api/actions/history`. */
interface ActionHistoryRecordResponse {
  id: string;
  deviceId: string;
  device: string;
  deviceKey: string;
  action: string;
  status: string;
  triggerBy: string;
  sentBy: string;
  timestamp: string;
}

interface PaginatedActionHistoryResponseDto {
  items: ActionHistoryRecordResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEVICE_KEYS: Record<string, DeviceType> = {
  ledGreen: 'ledGreen',
  ledRed: 'ledRed',
};

const ACTION_VALUES: Record<string, DeviceAction> = { ON: 'ON', OFF: 'OFF' };

const STATUS_VALUES: Record<string, ActionStatus> = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

/** Backend sends ISO-8601 UTC; the table and date pickers use `YYYY-MM-DD HH:mm:ss` local time. */
const toDisplayTimestamp = (timestamp: string): string =>
  dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');

/**
 * The date pickers work with local wall-clock strings, but the API compares absolute
 * instants, so the range is converted to UTC ISO-8601 before it leaves the browser.
 */
const toInstantParam = (localTimestamp: string | null): string | null =>
  localTimestamp ? dayjs(localTimestamp).toISOString() : null;

const toRecord = (item: ActionHistoryRecordResponse): ActionHistoryRecord | null => {
  const deviceKey = DEVICE_KEYS[item.deviceKey];
  const action = ACTION_VALUES[item.action?.toUpperCase()];
  const status = STATUS_VALUES[item.status?.toUpperCase()];
  if (!deviceKey || !action || !status) {
    return null;
  }

  return {
    id: item.id,
    deviceId: item.deviceId,
    device: item.device,
    deviceKey,
    action,
    status,
    sentBy: item.sentBy || 'System',
    timestamp: toDisplayTimestamp(item.timestamp),
  };
};

const isActionHistoryRecordResponse = (value: unknown): value is ActionHistoryRecordResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.deviceId === 'string' &&
    typeof candidate.device === 'string' &&
    typeof candidate.deviceKey === 'string' &&
    typeof candidate.action === 'string' &&
    typeof candidate.status === 'string' &&
    typeof candidate.sentBy === 'string' &&
    typeof candidate.timestamp === 'string'
  );
};

const isPaginatedActionHistoryResponse = (
  value: unknown,
): value is PaginatedActionHistoryResponseDto => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.items) &&
    candidate.items.every(isActionHistoryRecordResponse) &&
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

export const actionHistoryApi = {
  /**
   * Truy vấn lịch sử điều khiển thiết bị từ Backend (`GET /api/actions/history`).
   *
   * <p>Toàn bộ filter (search, device, action, status, khoảng thời gian), sort và phân
   * trang được đẩy xuống server; không còn dữ liệu mock ở client.</p>
   */
  async getHistory(filters: ActionHistoryFilters): Promise<PaginatedActionHistoryResponse> {
    const response = await apiClient.get<unknown>('/actions/history', {
      params: {
        search: filters.search,
        device: filters.device,
        action: filters.action,
        status: filters.status,
        startTime: toInstantParam(filters.startTime),
        endTime: toInstantParam(filters.endTime),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page,
        pageSize: filters.pageSize,
      },
    });

    if (!isPaginatedActionHistoryResponse(response.data)) {
      throw new Error('Dữ liệu lịch sử điều khiển trả về không đúng định dạng.');
    }

    return {
      items: response.data.items
        .map(toRecord)
        .filter((record): record is ActionHistoryRecord => record !== null),
      total: response.data.total,
      page: response.data.page,
      pageSize: response.data.pageSize,
      totalPages: response.data.totalPages,
    };
  },
};
