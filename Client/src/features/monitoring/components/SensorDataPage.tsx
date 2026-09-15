import React from 'react';
import { SensorDataFilterBar } from '@/features/monitoring/components/SensorDataFilterBar';
import { SensorDataPagination } from '@/features/monitoring/components/SensorDataPagination';
import { SensorDataTable } from '@/features/monitoring/components/SensorDataTable';
import { useSensorData } from '@/features/monitoring/hooks/useSensorData';

export const SensorDataPage: React.FC = () => {
  const {
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
  } = useSensorData();

  return (
    <div className="w-full mx-auto p-0 box-border flex flex-col my-auto">
      {/* 1. Bộ lọc: Search Bar & Type/Sort Selectors */}
      <SensorDataFilterBar
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        selectedType={filters.type}
        onTypeChange={handleTypeChange}
        selectedSortKey={currentSortKey}
        onSortSelect={handleSortSelect}
      />

      {/* 2. Bảng dữ liệu cảm biến (Dark Navy Header, UUID v7, Column Sort Buttons) */}
      <SensorDataTable
        records={items}
        loading={isLoading}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onColumnSort={handleColumnSort}
      />

      {/* 3. Thanh phân trang (Showing X to Y of Z & Page Buttons) */}
      <SensorDataPagination
        currentPage={filters.page}
        totalPages={totalPages}
        totalEntries={total}
        startEntry={startEntry}
        endEntry={endEntry}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default SensorDataPage;
