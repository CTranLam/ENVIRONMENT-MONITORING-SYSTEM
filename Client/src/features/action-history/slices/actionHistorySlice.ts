import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  ActionHistoryRecord,
  ActionHistoryFilters,
  PaginatedActionHistoryResponse,
  ActionSortField,
  ActionSortOrder,
  DeviceType,
  DeviceAction,
} from '../types/action-history.types';
import { actionHistoryApi } from '../services/actionHistoryApi';

export interface ActionHistoryState {
  items: ActionHistoryRecord[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: ActionHistoryFilters;
}

const initialFilters: ActionHistoryFilters = {
  search: '',
  device: 'all',
  action: 'all',
  sortBy: 'timestamp',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
};

const initialState: ActionHistoryState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  filters: initialFilters,
};

/**
 * Async thunk truy vấn lịch sử điều khiển thiết bị
 */
export const fetchActionHistoryThunk = createAsyncThunk<
  PaginatedActionHistoryResponse,
  Partial<ActionHistoryFilters> | undefined,
  { state: { actionHistory: ActionHistoryState } }
>('actionHistory/fetchActionHistory', async (overrideFilters, { getState, rejectWithValue }) => {
  try {
    const currentFilters = getState().actionHistory.filters;
    const mergedFilters: ActionHistoryFilters = {
      ...currentFilters,
      ...overrideFilters,
    };
    const response = await actionHistoryApi.getActionHistory(mergedFilters);
    return response;
  } catch (error: unknown) {
    const err = error as Error;
    return rejectWithValue(err.message || 'Không thể tải lịch sử điều khiển');
  }
});

export const actionHistorySlice = createSlice({
  name: 'actionHistory',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setDeviceFilter: (state, action: PayloadAction<'all' | DeviceType>) => {
      state.filters.device = action.payload;
      state.filters.page = 1;
    },
    setActionFilter: (state, action: PayloadAction<'all' | DeviceAction>) => {
      state.filters.action = action.payload;
      state.filters.page = 1;
    },
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: ActionSortField; sortOrder: ActionSortOrder }>
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
      .addCase(fetchActionHistoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActionHistoryThunk.fulfilled, (state, action) => {
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
      .addCase(fetchActionHistoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Lỗi tải lịch sử';
      });
  },
});

export const {
  setSearch,
  setDeviceFilter,
  setActionFilter,
  setSorting,
  setPage,
  resetFilters,
} = actionHistorySlice.actions;

export const actionHistoryReducer = actionHistorySlice.reducer;

