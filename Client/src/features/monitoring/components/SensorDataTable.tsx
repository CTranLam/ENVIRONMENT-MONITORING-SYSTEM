import React from 'react';
import { Spin, Empty, Tooltip, message } from 'antd';
import {
  FireOutlined,
  BulbOutlined,
  CopyOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type {
  SensorDataRecord,
  SortField,
  SortOrder,
  SensorType,
} from '@/features/monitoring/types/sensor-data.types';

const DropletIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#0ea5e9" className="inline-block">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

interface SensorDataTableProps {
  records: SensorDataRecord[];
  loading: boolean;
  sortBy: SortField;
  sortOrder: SortOrder;
  onColumnSort: (field: SortField) => void;
}

export const SensorDataTable: React.FC<SensorDataTableProps> = ({
  records,
  loading,
  sortBy,
  sortOrder,
  onColumnSort,
}) => {
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    message.success('Đã sao chép UUID v7!');
  };

  // Helper render nút sort cạnh tiêu đề cột
  const renderSortIndicator = (field: SortField) => {
    const isActive = sortBy === field;
    return (
      <button
        onClick={() => onColumnSort(field)}
        className="ml-2.5 p-1.5 inline-flex items-center justify-center rounded hover:bg-white/25 transition-all cursor-pointer border-none bg-transparent"
        title={`Sort by ${field.toUpperCase()}`}
      >
        {isActive ? (
          sortOrder === 'asc' ? (
            <CaretUpOutlined className="text-base font-bold text-white drop-shadow-xs" />
          ) : (
            <CaretDownOutlined className="text-base font-bold text-white drop-shadow-xs" />
          )
        ) : (
          <SwapOutlined className="text-[13px] rotate-90 text-white/60 hover:text-white" />
        )}
      </button>
    );
  };

  // Helper badge icon theo loại sensor
  const renderSensorBadge = (type: SensorType, name: string) => {
    if (type === 'temperature') {
      return (
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0 shadow-xs">
            <FireOutlined className="text-sm" />
          </span>
          <span className="font-semibold text-slate-800 text-[15px]">{name}</span>
        </div>
      );
    }
    if (type === 'humidity') {
      return (
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 flex-shrink-0 shadow-xs">
            <DropletIcon />
          </span>
          <span className="font-semibold text-slate-800 text-[15px]">{name}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0 shadow-xs">
          <BulbOutlined className="text-sm" />
        </span>
        <span className="font-semibold text-slate-800 text-[15px]">{name}</span>
      </div>
    );
  };

  // Helper badge giá trị
  const renderValueBadge = (record: SensorDataRecord) => {
    let colorClass = 'text-slate-800 bg-slate-100 border-slate-200';
    if (record.type === 'temperature') {
      colorClass = 'text-red-700 bg-red-50/90 border-red-200';
    } else if (record.type === 'humidity') {
      colorClass = 'text-sky-700 bg-sky-50/90 border-sky-200';
    } else if (record.type === 'light') {
      colorClass = 'text-amber-700 bg-amber-50/90 border-amber-200';
    }

    return (
      <span
        className={`inline-block px-3.5 py-1.5 rounded-full text-[13.5px] font-bold border border-solid shadow-xs ${colorClass}`}
      >
        {record.value} {record.unit}
      </span>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-solid border-slate-200 shadow-sm overflow-hidden min-h-[520px] flex flex-col justify-between">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          {/* Header với tone màu #0099FF đồng bộ với Header trang web */}
          <thead>
            <tr className="bg-[#0099FF] text-white select-none">
              <th className="py-4 px-6 font-bold text-[13.5px] tracking-wider uppercase text-left w-[32%]">
                <div className="flex items-center">
                  <span>SENSOR ID</span>
                  {renderSortIndicator('id')}
                </div>
              </th>
              <th className="py-4 px-6 font-bold text-[13.5px] tracking-wider uppercase text-left w-[26%]">
                <div className="flex items-center">
                  <span>SENSOR NAME</span>
                  {renderSortIndicator('name')}
                </div>
              </th>
              <th className="py-4 px-6 font-bold text-[13.5px] tracking-wider uppercase text-left w-[18%]">
                <div className="flex items-center">
                  <span>VALUE</span>
                  {renderSortIndicator('value')}
                </div>
              </th>
              <th className="py-4 px-6 font-bold text-[13.5px] tracking-wider uppercase text-left w-[24%]">
                <div className="flex items-center">
                  <span>TIMESTAMP</span>
                  {renderSortIndicator('timestamp')}
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Spin size="large" />
                    <span className="text-slate-400 text-[15px]">Đang tải dữ liệu cảm biến...</span>
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <Empty description="Không tìm thấy dữ liệu cảm biến phù hợp" />
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr
                  key={record.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    index % 2 === 1 ? 'bg-slate-50/35' : 'bg-white'
                  }`}
                >
                  {/* SENSOR ID (UUID v7 Monospace with Copy Button) */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <Tooltip title="UUID v7 (Time-ordered)">
                        <span className="font-mono text-[13.5px] font-medium text-slate-700 select-all tracking-tight">
                          {record.id}
                        </span>
                      </Tooltip>
                      <button
                        onClick={() => handleCopyId(record.id)}
                        className="opacity-40 hover:opacity-100 text-slate-500 hover:text-[#0099FF] p-1.5 rounded-md hover:bg-slate-100 transition-all border-none bg-transparent cursor-pointer"
                        title="Sao chép UUID"
                      >
                        <CopyOutlined className="text-sm" />
                      </button>
                    </div>
                  </td>

                  {/* SENSOR NAME */}
                  <td className="py-4 px-6">
                    {renderSensorBadge(record.type, record.name)}
                  </td>

                  {/* VALUE */}
                  <td className="py-4 px-6">
                    {renderValueBadge(record)}
                  </td>

                  {/* TIMESTAMP */}
                  <td className="py-4 px-6 text-slate-600 font-mono text-[13.5px] font-medium">
                    {record.timestamp}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
