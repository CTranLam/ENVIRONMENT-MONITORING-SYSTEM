import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { actionHistoryApi } from '@/features/action-history/services/actionHistoryApi';
import type {
  ActionHistoryFilters,
  PaginatedActionHistoryResponse,
  ActionHistoryState,
  ActionSortField,
  ActionSortOrder,
  ActionHistoryActionFilter,
  ActionHistoryDeviceFilter,
} from '@/features/action-history/types/action-history.types';

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
  isLoading: false,
  filters: initialFilters,
};

export const fetchActionHistoryThunk = createAsyncThunk<
  PaginatedActionHistoryResponse,
  ActionHistoryFilters
>('actionHistory/fetch', (filters) => actionHistoryApi.getHistory(filters));

export const actionHistorySlice = createSlice({
  name: 'actionHistory',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setDeviceFilter: (state, action: PayloadAction<ActionHistoryDeviceFilter>) => {
      state.filters.device = action.payload;
      state.filters.page = 1;
    },
    setActionFilter: (state, action: PayloadAction<ActionHistoryActionFilter>) => {
      state.filters.action = action.payload;
      state.filters.page = 1;
    },
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: ActionSortField; sortOrder: ActionSortOrder }>
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
      .addCase(fetchActionHistoryThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchActionHistoryThunk.fulfilled, (state, action: PayloadAction<PaginatedActionHistoryResponse>) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.filters.page = action.payload.page;
        state.filters.pageSize = action.payload.pageSize;
      })
      .addCase(fetchActionHistoryThunk.rejected, (state) => {
        state.isLoading = false;
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
