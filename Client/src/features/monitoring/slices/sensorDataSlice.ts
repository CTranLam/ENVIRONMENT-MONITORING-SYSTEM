import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { sensorDataApi } from '@/features/monitoring/services/sensorDataApi';
import type {
  SensorDataFilters,
  PaginatedSensorDataResponse,
  SensorDataState,
  SortField,
  SortOrder,
  SensorFilterType,
} from '@/features/monitoring/types/sensor-data.types';

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
  isLoading: false,
  filters: initialFilters,
};

export const fetchSensorDataThunk = createAsyncThunk<
  PaginatedSensorDataResponse,
  SensorDataFilters
>('sensorData/fetch', (filters) => sensorDataApi.getHistory(filters));

export const sensorDataSlice = createSlice({
  name: 'sensorData',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.page = 1; // Reset về trang 1 khi tìm kiếm
    },
    setTypeFilter: (state, action: PayloadAction<SensorFilterType>) => {
      state.filters.type = action.payload;
      state.filters.page = 1; // Reset về trang 1 khi lọc loại
    },
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: SortField; sortOrder: SortOrder }>
    ) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
      state.filters.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = Number.isInteger(action.payload)
        ? Math.max(1, action.payload)
        : 1;
    },
    resetFilters: (state) => {
      state.filters = { ...initialFilters };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSensorDataThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSensorDataThunk.fulfilled, (state, action: PayloadAction<PaginatedSensorDataResponse>) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.filters.page = action.payload.page;
        state.filters.pageSize = action.payload.pageSize;
      })
      .addCase(fetchSensorDataThunk.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setSearch, setTypeFilter, setSorting, setPage, resetFilters } =
  sensorDataSlice.actions;

export const sensorDataReducer = sensorDataSlice.reducer;
