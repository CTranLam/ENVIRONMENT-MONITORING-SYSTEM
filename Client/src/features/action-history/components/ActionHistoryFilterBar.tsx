import React from 'react';
import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type {
  ActionHistoryActionFilter,
  ActionHistoryDeviceFilter,
  ActionHistorySortKey,
} from '@/features/action-history/types/action-history.types';

interface ActionHistoryFilterBarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedDevice: ActionHistoryDeviceFilter;
  onDeviceChange: (value: ActionHistoryDeviceFilter) => void;
  selectedAction: ActionHistoryActionFilter;
  onActionChange: (value: ActionHistoryActionFilter) => void;
  selectedSortKey: ActionHistorySortKey;
  onSortSelect: (key: ActionHistorySortKey) => void;
}

export const ActionHistoryFilterBar: React.FC<ActionHistoryFilterBarProps> = ({
  searchInput,
  onSearchChange,
  selectedDevice,
  onDeviceChange,
  selectedAction,
  onActionChange,
  selectedSortKey,
  onSortSelect,
}) => {
  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4 mb-5">
      {/* Search Bar bên trái: bo tròn mềm mại */}
      <div className="w-full lg:max-w-[420px]">
        <Input
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by device name or UUID..."
          prefix={<SearchOutlined className="text-slate-400 text-lg mr-2" />}
          allowClear
          className="!rounded-full !py-2.5 !px-5 !border-solid !border-slate-300 hover:!border-[#0099FF] focus:!border-[#0099FF] shadow-xs text-[15px]"
        />
      </div>

      {/* Cụm Filter Device, Action & Sort bên phải */}
      <div className="w-full lg:w-auto flex items-center justify-end gap-5 flex-wrap">
        {/* Device Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-800 text-[15px] font-semibold whitespace-nowrap">
            Device:
          </span>
          <Select
            value={selectedDevice}
            onChange={(value) => onDeviceChange(value as ActionHistoryDeviceFilter)}
            className="w-[160px] [&_.ant-select-selector]:!rounded-full [&_.ant-select-selector]:!border-solid [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!min-h-[40px] [&_.ant-select-selection-item]:!leading-[38px] text-[14.5px]"
            options={[
              { value: 'all', label: 'All Devices' },
              { value: 'coolingFan', label: 'Cooling Fan' },
              { value: 'mistingSystem', label: 'Misting System' },
              { value: 'ventilationFan', label: 'Ventilation Fan' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-800 text-[15px] font-semibold whitespace-nowrap">
            Action:
          </span>
          <Select
            value={selectedAction}
            onChange={(value) => onActionChange(value as ActionHistoryActionFilter)}
            className="w-[125px] [&_.ant-select-selector]:!rounded-full [&_.ant-select-selector]:!border-solid [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!min-h-[40px] [&_.ant-select-selection-item]:!leading-[38px] text-[14.5px]"
            options={[
              { value: 'all', label: 'All' },
              { value: 'ON', label: 'ON' },
              { value: 'OFF', label: 'OFF' },
            ]}
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-slate-800 text-[15px] font-semibold whitespace-nowrap">
            Sort:
          </span>
          <Select
            value={selectedSortKey}
            onChange={(value) => onSortSelect(value as ActionHistorySortKey)}
            className="w-[195px] [&_.ant-select-selector]:!rounded-full [&_.ant-select-selector]:!border-solid [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!min-h-[40px] [&_.ant-select-selection-item]:!leading-[38px] text-[14.5px]"
            options={[
              { value: 'timestamp_desc', label: 'Newest First' },
              { value: 'timestamp_asc', label: 'Oldest First' },
              { value: 'device_asc', label: 'Device (A to Z)' },
              { value: 'device_desc', label: 'Device (Z to A)' },
              { value: 'action_asc', label: 'Action (Asc)' },
              { value: 'action_desc', label: 'Action (Desc)' },
              { value: 'status_asc', label: 'Status (Asc)' },
              { value: 'status_desc', label: 'Status (Desc)' },
              { value: 'deviceId_asc', label: 'UUID (Asc)' },
              { value: 'deviceId_desc', label: 'UUID (Desc)' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
