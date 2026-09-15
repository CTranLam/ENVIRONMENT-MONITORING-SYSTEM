import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchActionHistoryThunk,
  setActionFilter,
  setDeviceFilter,
  setPage,
  setSearch,
  setSorting,
} from '@/features/action-history/slices/actionHistorySlice';
import type {
  ActionHistoryActionFilter,
  ActionHistoryDeviceFilter,
  ActionHistorySortKey,
  ActionSortField,
  ActionSortOrder,
} from '@/features/action-history/types/action-history.types';

export const useActionHistory = () => {
  const dispatch = useAppDispatch();
  const { items, total, isLoading, filters } = useAppSelector(
    (state) => state.actionHistory,
  );
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        dispatch(setSearch(value));
      }, 300);
    },
    [dispatch],
  );

  const handleDeviceChange = useCallback(
    (value: ActionHistoryDeviceFilter) => {
      dispatch(setDeviceFilter(value));
    },
    [dispatch],
  );

  const handleActionChange = useCallback(
    (value: ActionHistoryActionFilter) => {
      dispatch(setActionFilter(value));
    },
    [dispatch],
  );

  const handleSortSelect = useCallback(
    (sortKey: ActionHistorySortKey) => {
      const [sortBy, sortOrder] = sortKey.split('_') as [
        ActionSortField,
        ActionSortOrder,
      ];
      dispatch(setSorting({ sortBy, sortOrder }));
    },
    [dispatch],
  );

  const handleColumnSort = useCallback(
    (sortBy: ActionSortField) => {
      const sortOrder: ActionSortOrder =
        filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' :
          filters.sortBy === sortBy ? 'asc' :
            sortBy === 'device' || sortBy === 'deviceId' ? 'asc' : 'desc';
      dispatch(setSorting({ sortBy, sortOrder }));
    },
    [dispatch, filters.sortBy, filters.sortOrder],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setPage(page));
    },
    [dispatch],
  );

  useEffect(() => {
    dispatch(fetchActionHistoryThunk(filters));
  }, [dispatch, filters]);

  useEffect(() => () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const startEntry = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const endEntry = Math.min(filters.page * filters.pageSize, total);
  const currentSortKey: ActionHistorySortKey = `${filters.sortBy}_${filters.sortOrder}`;

  return {
    items,
    total,
    isLoading,
    filters,
    searchInput,
    totalPages,
    startEntry,
    endEntry,
    currentSortKey,
    handleSearchChange,
    handleDeviceChange,
    handleActionChange,
    handleSortSelect,
    handleColumnSort,
    handlePageChange,
  };
};

export default useActionHistory;
