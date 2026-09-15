import React from 'react';
import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type {
  SensorFilterType,
  SensorSortKey,
} from '@/features/monitoring/types/sensor-data.types';

interface SensorDataFilterBarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedType: SensorFilterType;
  onTypeChange: (value: SensorFilterType) => void;
  selectedSortKey: SensorSortKey;
  onSortSelect: (key: SensorSortKey) => void;
}

export const SensorDataFilterBar: React.FC<SensorDataFilterBarProps> = ({
  searchInput,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedSortKey,
  onSortSelect,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-5">
      {/* Search Bar bên trái: bo tròn mềm mại chuẩn theo wireframe, kích thước thoải mái */}
      <div className="w-full md:max-w-[480px]">
        <Input
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by sensor name or UUID..."
          prefix={<SearchOutlined className="text-slate-400 text-lg mr-2" />}
          allowClear
          className="!rounded-full !py-2.5 !px-5 !border-solid !border-slate-300 hover:!border-[#0099FF] focus:!border-[#0099FF] shadow-xs text-[15px]"
        />
      </div>

      {/* Cụm Filter Type & Sort bên phải */}
      <div className="w-full md:w-auto flex items-center justify-end gap-6 flex-wrap">
        {/* Type Filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-slate-800 text-[15px] font-semibold whitespace-nowrap">
            Type:
          </span>
          <Select
            value={selectedType}
            onChange={(value) => onTypeChange(value as SensorFilterType)}
            className="w-[155px] [&_.ant-select-selector]:!rounded-full [&_.ant-select-selector]:!border-solid [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!min-h-[40px] [&_.ant-select-selection-item]:!leading-[38px] text-[14.5px]"
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'temperature', label: 'Temperature' },
              { value: 'humidity', label: 'Humidity' },
              { value: 'light', label: 'Light' },
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
