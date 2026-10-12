import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  applySearch,
  fetchSensorDataThunk,
  setSorting,
  setPage,
  setPageSize,
} from '@/features/monitoring/slices/sensorDataSlice';
import type {
  SensorSearchType,
  SensorSortKey,
  SortField,
  SortOrder,
} from '@/features/monitoring/types/sensor-data.types';

export const useSensorData = () => {
  const dispatch = useAppDispatch();
  const { items, total, isLoading, error, filters } = useAppSelector(
    (state) => state.sensorData
  );

  const [searchInput, setSearchInput] = useState(filters.search);
  const [selectedSearchType, setSelectedSearchType] = useState<SensorSearchType>(filters.type);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Keep draft search text local. The server query starts only when the user submits it.
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
    },
    []
  );

  const handleSearchSubmit = useCallback(() => {
    dispatch(applySearch({
      search: searchInput,
      type: selectedSearchType === 'time' ? 'all' : selectedSearchType,
    }));
  }, [dispatch, searchInput, selectedSearchType]);

  // Changing the dropdown updates the draft only; it does not reload the table.
  const handleTypeChange = useCallback(
    (value: SensorSearchType) => {
      setSelectedSearchType(value);
    },
    []
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

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      dispatch(setPageSize(pageSize));
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

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const startEntry = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const endEntry = Math.min(filters.page * filters.pageSize, total);

  // Chuỗi key cho Sort dropdown hiện tại
  const currentSortKey: SensorSortKey = `${filters.sortBy}_${filters.sortOrder}`;

  return {
    items,
    total,
    isLoading,
    error,
    filters,
    searchInput,
    totalPages,
    startEntry,
    endEntry,
    currentSortKey,
    selectedSearchType,
    handleSearchChange,
    handleSearchSubmit,
    handleTypeChange,
    handleSortSelect,
    handleColumnSort,
    handlePageChange,
    handlePageSizeChange,
  };
};
