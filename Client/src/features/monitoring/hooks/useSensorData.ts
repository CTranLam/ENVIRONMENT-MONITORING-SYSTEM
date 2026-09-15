import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchSensorDataThunk,
  setSearch,
  setTypeFilter,
  setSorting,
  setPage,
} from '@/features/monitoring/slices/sensorDataSlice';
import type {
  SensorFilterType,
  SensorSortKey,
  SortField,
  SortOrder,
} from '@/features/monitoring/types/sensor-data.types';

export const useSensorData = () => {
  const dispatch = useAppDispatch();
  const { items, total, isLoading, filters } = useAppSelector(
    (state) => state.sensorData
  );

  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

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
    (value: SensorFilterType) => {
      dispatch(setTypeFilter(value));
    },
    [dispatch]
  );

  // Xử lý đổi tiêu chí sắp xếp từ Sort dropdown
  const handleSortSelect = useCallback(
    (sortKey: SensorSortKey) => {
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
      if (filters.sortBy === field) {
        const newOrder: SortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
        dispatch(setSorting({ sortBy: field, sortOrder: newOrder }));
      } else {
        const defaultOrder: SortOrder = field === 'name' || field === 'id' ? 'asc' : 'desc';
        dispatch(setSorting({ sortBy: field, sortOrder: defaultOrder }));
      }
    },
    [dispatch, filters.sortBy, filters.sortOrder]
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
    dispatch(fetchSensorDataThunk(filters));
  }, [
    dispatch,
    filters,
  ]);

  // Clean timer khi unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const startEntry = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const endEntry = Math.min(filters.page * filters.pageSize, total);

  // Chuỗi key cho Sort dropdown hiện tại
  const currentSortKey: SensorSortKey = `${filters.sortBy}_${filters.sortOrder}`;

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
    handleTypeChange,
    handleSortSelect,
    handleColumnSort,
    handlePageChange,
  };
};
