import React from 'react';
import { useActionHistory } from '../hooks/useActionHistory';
import { ActionHistoryFilterBar } from './ActionHistoryFilterBar';
import { ActionHistoryTable } from './ActionHistoryTable';
import { ActionHistoryPagination } from './ActionHistoryPagination';

export const ActionHistoryPage: React.FC = () => {
  const {
    items,
    total,
    loading,
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
  } = useActionHistory();

  return (
    <div className="w-full mx-auto p-0 box-border flex flex-col my-auto">
      {/* 1. Bộ lọc: Search Bar & Device/Action/Sort Selectors */}
      <ActionHistoryFilterBar
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        selectedDevice={filters.device}
        onDeviceChange={handleDeviceChange}
        selectedAction={filters.action}
        onActionChange={handleActionChange}
        selectedSortKey={currentSortKey}
        onSortSelect={handleSortSelect}
      />

      {/* 2. Bảng dữ liệu lịch sử điều khiển 5 cột (Dark Navy Header, UUID v7, Badges, Column Sort) */}
      <ActionHistoryTable
        records={items}
        loading={loading}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onColumnSort={handleColumnSort}
      />

      {/* 3. Thanh phân trang (Showing X to Y of Z & Page Buttons) */}
      <ActionHistoryPagination
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

export default ActionHistoryPage;

