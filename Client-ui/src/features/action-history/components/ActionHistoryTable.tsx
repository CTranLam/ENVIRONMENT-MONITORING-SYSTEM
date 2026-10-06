import React from 'react';
import { Spin, Empty, Tooltip, message } from 'antd';
import {
  ThunderboltOutlined,
  BulbOutlined,
  CopyOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  SwapOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type {
  ActionHistoryRecord,
  ActionSortField,
  ActionSortOrder,
  DeviceType,
  DeviceAction,
  ActionStatus,
} from '@/features/action-history/types/action-history.types';

interface ActionHistoryTableProps {
  records: ActionHistoryRecord[];
  loading: boolean;
  startEntry: number;
  sortBy: ActionSortField;
  sortOrder: ActionSortOrder;
  onColumnSort: (field: ActionSortField) => void;
}

export const ActionHistoryTable: React.FC<ActionHistoryTableProps> = ({
  records,
  loading,
  startEntry,
  sortBy,
  sortOrder,
  onColumnSort,
}) => {
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    message.success('Đã sao chép Device UUID!');
  };

  // Nút sort cạnh tiêu đề từng cột
  const renderSortIndicator = (field: ActionSortField) => {
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

  // Badge hiển thị thiết bị kèm icon
  const renderDeviceBadge = (key: DeviceType, name: string) => {
    if (key === 'ledGreen') {
      return (
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0 shadow-xs">
            <ThunderboltOutlined className="text-sm" />
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

  // Badge hiển thị Action (ON / OFF)
  const renderActionBadge = (action: DeviceAction) => {
    const isON = action === 'ON';
    return (
      <span
        className={`inline-block px-3.5 py-1 rounded-full text-[13px] font-bold border border-solid shadow-xs ${
          isON
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}
      >
        {action}
      </span>
    );
  };

  // Badge hiển thị Status (SUCCESS / FAILED / PENDING)
  const renderStatusBadge = (status: ActionStatus) => {
    const styles: Record<ActionStatus, string> = {
      SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      FAILED: 'bg-red-50 text-red-600 border-red-200',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold border border-solid shadow-xs ${styles[status]}`}
      >
        {status === 'SUCCESS' && <CheckCircleFilled className="text-emerald-500 text-xs" />}
        {status === 'FAILED' && <CloseCircleFilled className="text-red-500 text-xs" />}
        {status === 'PENDING' && <ClockCircleOutlined className="text-amber-500 text-xs" />}
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-solid border-slate-200 shadow-sm overflow-hidden min-h-[520px] flex flex-col justify-between">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          {/* Header tone màu #0099FF đồng bộ Header trang web */}
          <thead>
            <tr className="bg-[#0099FF] text-white select-none">
              <th className="py-4 px-4 font-bold text-[13.5px] tracking-wider uppercase text-center w-[5%]">
                No.
              </th>
              <th className="py-4 px-6 font-bold text-[13.5px] tracking-wider uppercase text-left w-[23%]">
                <div className="flex items-center">
                  <span>DEVICE ID</span>
                  {renderSortIndicator('deviceId')}
                </div>
              </th>
              <th className="py-4 px-6 font-bold text-[13.5px] tracking-wider uppercase text-left w-[18%]">
                <div className="flex items-center">
                  <span>DEVICE</span>
                  {renderSortIndicator('device')}
                </div>
              </th>
              <th className="py-4 px-6 font-bold text-[13.5px] tracking-wider uppercase text-left w-[10%]">
                <div className="flex items-center">
                  <span>ACTION</span>
                  {renderSortIndicator('action')}
                </div>
              </th>
              <th className="py-4 px-6 font-bold text-[13.5px] tracking-wider uppercase text-left w-[13%]">
                <div className="flex items-center">
                  <span>STATUS</span>
                  {renderSortIndicator('status')}
                </div>
              </th>
              <th className="py-4 px-6 font-bold text-[13.5px] tracking-wider uppercase text-left w-[15%]">
                Sent By
              </th>
              <th className="py-4 px-6 font-bold text-[13.5px] tracking-wider uppercase text-left w-[16%]">
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
                <td colSpan={7} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Spin size="large" />
                    <span className="text-slate-400 text-[15px]">Đang tải lịch sử điều khiển...</span>
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <Empty description="Không tìm thấy lịch sử điều khiển thiết bị phù hợp" />
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
                  <td className="py-4 px-4 text-center font-medium text-slate-600 tabular-nums">
                    {startEntry + index}
                  </td>
                  {/* DEVICE ID (UUID v7 Monospace with Copy Button) */}
                  <td className="py-4 px-6">
                    {record.deviceId ? (
                      <div className="flex items-center gap-2.5">
                        <Tooltip title="Device UUID v7">
                          <span className="font-mono text-[13.5px] font-medium text-slate-700 select-all tracking-tight">
                            {record.deviceId}
                          </span>
                        </Tooltip>
                        <button
                          onClick={() => handleCopyId(record.deviceId!)}
                          className="opacity-40 hover:opacity-100 text-slate-500 hover:text-[#0099FF] p-1.5 rounded-md hover:bg-slate-100 transition-all border-none bg-transparent cursor-pointer"
                          title="Sao chép Device UUID"
                        >
                          <CopyOutlined className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[13.5px] font-medium">—</span>
                    )}
                  </td>

                  {/* DEVICE */}
                  <td className="py-4 px-6">
                    {renderDeviceBadge(record.deviceKey, record.device)}
                  </td>

                  {/* ACTION */}
                  <td className="py-4 px-6">
                    {renderActionBadge(record.action)}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-6">
                    {renderStatusBadge(record.status)}
                  </td>

                  {/* SENT BY */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-700 font-medium text-[14px] whitespace-nowrap">
                      <span className="w-7 h-7 rounded-full bg-sky-50 text-[#0099FF] inline-flex items-center justify-center">
                        <UserOutlined className="text-xs" />
                      </span>
                      {record.sentBy}
                    </div>
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
