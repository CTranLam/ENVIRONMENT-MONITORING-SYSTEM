export type SensorType = 'temperature' | 'humidity' | 'light';
export type SensorFilterType = 'all' | SensorType;

export type SortField = 'id' | 'name' | 'value' | 'timestamp';

export type SortOrder = 'asc' | 'desc';
export type SensorSortKey = `${SortField}_${SortOrder}`;

export interface SensorDataRecord {
  id: string;
  name: string;
  type: SensorType;
  value: number;
  unit: string;
  timestamp: string;
}

export interface SensorDataFilters {
  search: string;
  type: SensorFilterType;
  sortBy: SortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface PaginatedSensorDataResponse {
  items: SensorDataRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SensorDataState {
  items: SensorDataRecord[];
  total: number;
  isLoading: boolean;
  filters: SensorDataFilters;
}
