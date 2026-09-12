import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchSensorDataThunk,
  setSearch,
  setTypeFilter,
  setSorting,
  setPage,
} from '../slices/sensorDataSlice';
import type { SortField, SortOrder, SensorType } from '../types/sensor-data.types';

export const useSensorData = () => {
  const dispatch = useAppDispatch();
  const { items, total, loading, error, filters } = useAppSelector(
    (state) => state.sensorData
  );

  // An toàn dữ liệu
  const safeItems = Array.isArray(items) ? items : [];
  const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
  const safePage = typeof filters?.page === 'number' && !isNaN(filters.page) ? filters.page : 1;
  const safePageSize =
    typeof filters?.pageSize === 'number' && !isNaN(filters.pageSize) && filters.pageSize > 0
      ? filters.pageSize
      : 10;

  // Local state cho search input để phản hồi gõ tức thì
  const [searchInput, setSearchInput] = useState(filters?.search || '');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input sang Redux
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

  // Xử lý đổi filter loại cảm biến
  const handleTypeChange = useCallback(
    (value: string) => {
      dispatch(setTypeFilter(value as 'all' | SensorType));
    },
    [dispatch]
  );

  // Xử lý đổi tiêu chí sắp xếp từ Sort dropdown
  const handleSortSelect = useCallback(
    (sortKey: string) => {
      const [field, order] = sortKey.split('_') as [SortField, SortOrder];
      if (field && order) {
        dispatch(setSorting({ sortBy: field, sortOrder: order }));
      }
    },
    [dispatch]
  );

  // Xử lý click trực tiếp vào header của cột để đảo chiều sort
  const handleColumnSort = useCallback(
    (field: SortField) => {
      if (filters?.sortBy === field) {
        const newOrder: SortOrder = filters?.sortOrder === 'asc' ? 'desc' : 'asc';
        dispatch(setSorting({ sortBy: field, sortOrder: newOrder }));
      } else {
        const defaultOrder: SortOrder = field === 'name' || field === 'id' ? 'asc' : 'desc';
        dispatch(setSorting({ sortBy: field, sortOrder: defaultOrder }));
      }
    },
    [dispatch, filters?.sortBy, filters?.sortOrder]
  );

  // Xử lý chuyển trang
  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  // Fetch dữ liệu mỗi khi filter thay đổi
  useEffect(() => {
    dispatch(fetchSensorDataThunk());
  }, [
    dispatch,
    filters?.search,
    filters?.type,
    filters?.sortBy,
    filters?.sortOrder,
    filters?.page,
    filters?.pageSize,
  ]);

  // Clean timer khi unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Tính toán hiển thị phân trang an toàn, chống NaN tuyệt đối
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const startEntry = safeTotal === 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const endEntry = Math.min(safePage * safePageSize, safeTotal);

  // Chuỗi key cho Sort dropdown hiện tại
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
    handleTypeChange,
    handleSortSelect,
    handleColumnSort,
    handlePageChange,
  };
};
