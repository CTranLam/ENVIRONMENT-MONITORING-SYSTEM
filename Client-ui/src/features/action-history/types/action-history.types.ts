import type { DeviceKey } from '@/features/dashboard';

export type DeviceType = DeviceKey;
export type ActionHistoryDeviceFilter = 'all' | DeviceType;

export type DeviceAction = 'ON' | 'OFF';

export type ActionStatus = 'SUCCESS' | 'FAILED';
export type ActionHistoryStatusFilter = 'all' | ActionStatus;

export type ActionSortField = 'deviceId' | 'device' | 'action' | 'status' | 'timestamp';

export type ActionSortOrder = 'asc' | 'desc';
export type ActionHistorySortKey = `${ActionSortField}_${ActionSortOrder}`;

export interface ActionHistoryRecord {
  id: string;
  deviceId: string;
  device: string;
  deviceKey: DeviceType;
  action: DeviceAction;
  status: ActionStatus;
  sentBy: string;
  timestamp: string;
}

export interface ActionHistoryFilters {
  search: string;
  device: ActionHistoryDeviceFilter;
  action: ActionHistoryActionFilter;
  status: ActionHistoryStatusFilter;
  startTime: string | null;
  endTime: string | null;
  sortBy: ActionSortField;
  sortOrder: ActionSortOrder;
  page: number;
  pageSize: number;
}

export interface PaginatedActionHistoryResponse {
  items: ActionHistoryRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ActionHistoryActionFilter = 'all' | DeviceAction;

export interface ActionHistoryState {
  items: ActionHistoryRecord[];
  total: number;
  isLoading: boolean;
  filters: ActionHistoryFilters;
}
