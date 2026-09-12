export type DeviceType = 'coolingFan' | 'light';

export type DeviceAction = 'ON' | 'OFF';

export type ActionStatus = 'SUCCESS' | 'FAILED';

export type ActionSortField = 'deviceId' | 'device' | 'action' | 'status' | 'timestamp';

export type ActionSortOrder = 'asc' | 'desc';

export interface ActionHistoryRecord {
  /** Record UUID v7 identifier */
  id: string;
  /** Device UUID v7 identifier */
  deviceId: string;
  /** Display name of the device, e.g. 'Cooling Fan' */
  device: string;
  /** Key identifying the device type */
  deviceKey: DeviceType;
  /** Command action performed */
  action: DeviceAction;
  /** Execution status of the action */
  status: ActionStatus;
  /** Formatted timestamp string, e.g. '2026-09-12 15:30:22' */
  timestamp: string;
}

export interface ActionHistoryFilters {
  /** Search term matching device name or deviceId */
  search: string;
  /** Filter by device type */
  device: 'all' | DeviceType;
  /** Filter by action type */
  action: 'all' | DeviceAction;
  /** Current column being sorted */
  sortBy: ActionSortField;
  /** Sort order */
  sortOrder: ActionSortOrder;
  /** Current page index */
  page: number;
  /** Number of items per page (default: 10) */
  pageSize: number;
}

export interface PaginatedActionHistoryResponse {
  items: ActionHistoryRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

