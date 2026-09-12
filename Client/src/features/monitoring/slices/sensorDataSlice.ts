import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  SensorDataRecord,
  SensorDataFilters,
  PaginatedSensorDataResponse,
  SortField,
  SortOrder,
  SensorType,
} from '../types/sensor-data.types';
import { sensorDataApi } from '../services/sensorDataApi';

export interface SensorDataState {
  items: SensorDataRecord[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: SensorDataFilters;
}

const initialFilters: SensorDataFilters = {
  search: '',
  type: 'all',
  sortBy: 'timestamp',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
};

const initialState: SensorDataState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  filters: initialFilters,
};

/**
 * Async thunk truy vấn dữ liệu cảm biến
 */
export const fetchSensorDataThunk = createAsyncThunk<
  PaginatedSensorDataResponse,
  Partial<SensorDataFilters> | undefined,
  { state: { sensorData: SensorDataState } }
>('sensorData/fetchSensorData', async (overrideFilters, { getState, rejectWithValue }) => {
  try {
    const currentFilters = getState().sensorData.filters;
    const mergedFilters: SensorDataFilters = {
      ...currentFilters,
      ...overrideFilters,
    };
    const response = await sensorDataApi.getSensorData(mergedFilters);
    return response;
  } catch (error: unknown) {
    const err = error as Error;
    return rejectWithValue(err.message || 'Không thể tải dữ liệu cảm biến');
  }
});

export const sensorDataSlice = createSlice({
  name: 'sensorData',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.page = 1; // Reset về trang 1 khi tìm kiếm
    },
    setTypeFilter: (state, action: PayloadAction<'all' | SensorType>) => {
      state.filters.type = action.payload;
      state.filters.page = 1; // Reset về trang 1 khi lọc loại
    },
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: SortField; sortOrder: SortOrder }>
    ) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSensorDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSensorDataThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
          state.total = typeof action.payload.total === 'number' ? action.payload.total : action.payload.items.length;
          state.filters.page = action.payload.page || 1;
          state.filters.pageSize = action.payload.pageSize || 10;
        } else {
          state.items = [];
          state.total = 0;
        }
      })
      .addCase(fetchSensorDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Lỗi tải dữ liệu';
      });
  },
});

export const { setSearch, setTypeFilter, setSorting, setPage, resetFilters } =
  sensorDataSlice.actions;

export const sensorDataReducer = sensorDataSlice.reducer;
