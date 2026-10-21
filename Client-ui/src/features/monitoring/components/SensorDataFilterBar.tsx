import React from 'react';
import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type {
  SensorSearchType,
  SensorSortKey,
} from '@/features/monitoring/types/sensor-data.types';

interface SensorDataFilterBarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  selectedType: SensorSearchType;
  onTypeChange: (value: SensorSearchType) => void;
  selectedSortKey: SensorSortKey;
  onSortSelect: (key: SensorSortKey) => void;
}

export const SensorDataFilterBar: React.FC<SensorDataFilterBarProps> = ({
  searchInput,
  onSearchChange,
  onSearchSubmit,
  selectedType,
  onTypeChange,
  selectedSortKey,
  onSortSelect,
}) => {
  return (
    <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-4 mb-5">
      {/* Search Bar bên trái: bo tròn mềm mại chuẩn theo wireframe, kích thước thoải mái */}
      <div className="w-full xl:max-w-[380px]">
        <Input
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          onPressEnter={onSearchSubmit}
          title={selectedType === 'time' ? 'Search by year, month, day, hour, minute, or second; e.g. 2026-10-21 13:40' : undefined}
          placeholder={selectedType === 'time' ? 'YYYY-MM-DD HH:mm:ss (or shorter), Enter...' : selectedType === 'all' ? 'Search name, UUID, or value, then press Enter...' : 'Enter sensor value, then press Enter...'}
          prefix={(
            <button
              type="button"
              onClick={onSearchSubmit}
              aria-label="Search sensor data"
              className="mr-2 flex cursor-pointer border-0 bg-transparent p-0 text-slate-400 hover:text-[#0099FF]"
            >
              <SearchOutlined className="text-lg" />
            </button>
          )}
          allowClear
          className="!rounded-full !py-2.5 !px-5 !border-solid !border-slate-300 hover:!border-[#0099FF] focus:!border-[#0099FF] shadow-xs text-[15px]"
        />
      </div>

      {/* Cụm Filter Type & Sort bên phải */}
      <div className="w-full xl:w-auto flex items-center justify-end gap-4 flex-wrap">
        {/* Type Filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-slate-800 text-[15px] font-semibold whitespace-nowrap">
            Type:
          </span>
          <Select
            value={selectedType}
            onChange={(value) => onTypeChange(value as SensorSearchType)}
            className="w-[155px] [&_.ant-select-selector]:!rounded-full [&_.ant-select-selector]:!border-solid [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!min-h-[40px] [&_.ant-select-selection-item]:!leading-[38px] text-[14.5px]"
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'temperature', label: 'Temperature' },
              { value: 'humidity', label: 'Humidity' },
              { value: 'light', label: 'Light' },
              { value: 'time', label: 'Time' },
            ]}
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2.5">
          <span className="text-slate-800 text-[15px] font-semibold whitespace-nowrap">
            Sort:
          </span>
          <Select
            value={selectedSortKey}
            onChange={(value) => onSortSelect(value as SensorSortKey)}
            className="w-[205px] [&_.ant-select-selector]:!rounded-full [&_.ant-select-selector]:!border-solid [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!min-h-[40px] [&_.ant-select-selection-item]:!leading-[38px] text-[14.5px]"
            options={[
              { value: 'timestamp_desc', label: 'Newest First' },
              { value: 'timestamp_asc', label: 'Oldest First' },
              { value: 'value_desc', label: 'Value (High to Low)' },
              { value: 'value_asc', label: 'Value (Low to High)' },
              { value: 'name_asc', label: 'Name (A to Z)' },
              { value: 'name_desc', label: 'Name (Z to A)' },
              { value: 'id_asc', label: 'UUID (Asc)' },
              { value: 'id_desc', label: 'UUID (Desc)' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
