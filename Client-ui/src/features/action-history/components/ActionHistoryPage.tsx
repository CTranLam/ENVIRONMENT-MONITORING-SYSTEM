import React from 'react';
import { Alert } from 'antd';
import { ActionHistoryFilterBar } from '@/features/action-history/components/ActionHistoryFilterBar';
import { ActionHistoryPagination } from '@/features/action-history/components/ActionHistoryPagination';
import { ActionHistoryTable } from '@/features/action-history/components/ActionHistoryTable';
import { useActionHistory } from '@/features/action-history/hooks/useActionHistory';

export const ActionHistoryPage: React.FC = () => {
  const {
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
    handleSearchChange,
    handleDeviceChange,
    handleActionChange,
    handleStatusChange,
    handleTimeRangeChange,
    handleSortSelect,
    handleColumnSort,
    handlePageChange,
    handlePageSizeChange,
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
        selectedStatus={filters.status}
        onStatusChange={handleStatusChange}
        startTime={filters.startTime}
        endTime={filters.endTime}
        onTimeRangeChange={handleTimeRangeChange}
        selectedSortKey={currentSortKey}
        onSortSelect={handleSortSelect}
      />

      {/* Cảnh báo khi không tải được dữ liệu thật từ Backend */}
      {error && (
        <Alert
          type="error"
          showIcon
          message="Không tải được lịch sử điều khiển"
          description={error}
          className="!mb-4 !rounded-xl"
        />
      )}

      {/* 2. Bảng dữ liệu lịch sử điều khiển 5 cột (Dark Navy Header, UUID v7, Badges, Column Sort) */}
      <ActionHistoryTable
        records={items}
        loading={isLoading}
        startEntry={startEntry}
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
        pageSize={filters.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default ActionHistoryPage;
