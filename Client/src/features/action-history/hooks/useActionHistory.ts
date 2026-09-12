import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchActionHistoryThunk,
  setSearch,
  setDeviceFilter,
  setActionFilter,
  setSorting,
  setPage,
} from '../slices/actionHistorySlice';
import type {
  ActionSortField,
  ActionSortOrder,
  DeviceType,
  DeviceAction,
} from '../types/action-history.types';

export const useActionHistory = () => {
  const dispatch = useAppDispatch();
  const { items, total, loading, error, filters } = useAppSelector(
    (state) => state.actionHistory
  );

  // Bảo vệ tính toàn vẹn dữ liệu
  const safeItems = Array.isArray(items) ? items : [];
  const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
  const safePage = typeof filters?.page === 'number' && !isNaN(filters.page) ? filters.page : 1;
  const safePageSize =
    typeof filters?.pageSize === 'number' && !isNaN(filters.pageSize) && filters.pageSize > 0
      ? filters.pageSize
      : 10;

  // Local state cho search input phản hồi gõ tức thì
  const [searchInput, setSearchInput] = useState(filters?.search || '');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    [dispatch]
  );

  // Lọc theo thiết bị
  const handleDeviceChange = useCallback(
    (value: string) => {
      dispatch(setDeviceFilter(value as 'all' | DeviceType));
    },
    [dispatch]
  );

  // Lọc theo hành động (ON/OFF)
  const handleActionChange = useCallback(
    (value: string) => {
      dispatch(setActionFilter(value as 'all' | DeviceAction));
    },
    [dispatch]
  );

  // Chọn sắp xếp từ dropdown Sort
  const handleSortSelect = useCallback(
    (sortKey: string) => {
      const [field, order] = sortKey.split('_') as [ActionSortField, ActionSortOrder];
      if (field && order) {
        dispatch(setSorting({ sortBy: field, sortOrder: order }));
      }
    },
    [dispatch]
  );

  // Click trực tiếp vào tiêu đề cột để đảo chiều sort
  const handleColumnSort = useCallback(
    (field: ActionSortField) => {
      if (filters?.sortBy === field) {
        const newOrder: ActionSortOrder = filters?.sortOrder === 'asc' ? 'desc' : 'asc';
        dispatch(setSorting({ sortBy: field, sortOrder: newOrder }));
      } else {
        const defaultOrder: ActionSortOrder =
          field === 'device' || field === 'deviceId' ? 'asc' : 'desc';
        dispatch(setSorting({ sortBy: field, sortOrder: defaultOrder }));
      }
    },
    [dispatch, filters?.sortBy, filters?.sortOrder]
  );

  // Chuyển trang
  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  // Fetch dữ liệu mỗi khi filters thay đổi
  useEffect(() => {
    dispatch(fetchActionHistoryThunk());
  }, [
    dispatch,
    filters?.search,
    filters?.device,
    filters?.action,
    filters?.sortBy,
    filters?.sortOrder,
    filters?.page,
    filters?.pageSize,
  ]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Tính toán hiển thị phân trang an toàn
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const startEntry = safeTotal === 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const endEntry = Math.min(safePage * safePageSize, safeTotal);

  const currentSortKey = `${filters?.sortBy || 'timestamp'}_${filters?.sortOrder || 'desc'}`;

  return {
    items: safeItems,
    total: safeTotal,
    loading: Boolean(loading),
    error,
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

