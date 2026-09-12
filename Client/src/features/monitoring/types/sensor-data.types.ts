export type SensorType = 'temperature' | 'humidity' | 'light';

export type SortField = 'id' | 'name' | 'value' | 'timestamp';

export type SortOrder = 'asc' | 'desc';

export interface SensorDataRecord {
  /** UUID v7 identifier (RFC 9562 time-ordered) */
  id: string;
  /** Sensor display name, e.g. 'DHT22 - Temperature' */
  name: string;
  /** Sensor metric type */
  type: SensorType;
  /** Measurement value */
  value: number;
  /** Measurement unit, e.g. '°C', '%', 'Lux' */
  unit: string;
  /** Formatted timestamp string, e.g. '2026-09-12 15:30:22' */
  timestamp: string;
}

export interface SensorDataFilters {
  /** Keyword to filter by name or id */
  search: string;
  /** Filter by sensor type: 'all' or specific type */
  type: 'all' | SensorType;
  /** Current column or field being sorted */
  sortBy: SortField;
  /** Sort order: ascending or descending */
  sortOrder: SortOrder;
  /** Current page index (1-based) */
  page: number;
  /** Number of items per page (default: 10) */
  pageSize: number;
}

export interface PaginatedSensorDataResponse {
  items: SensorDataRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

