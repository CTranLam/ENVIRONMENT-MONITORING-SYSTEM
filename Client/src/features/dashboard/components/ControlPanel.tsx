import React from 'react';
import { Switch, Typography } from 'antd';
import {
  SettingOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  FireOutlined,
} from '@ant-design/icons';
import type { DeviceControlState } from '../types/dashboard.types';

const { Title, Text } = Typography;

interface ControlPanelProps {
  deviceState: DeviceControlState;
  onToggleDevice: (device: keyof DeviceControlState) => void;
  loading?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  deviceState,
  onToggleDevice,
}) => {
  return (
    <div className="w-full flex flex-col justify-start">
      {/* Title Header */}
      <div className="flex items-center gap-2 mb-3 h-7">
        <SettingOutlined className="text-xl text-slate-800" />
        <Title level={4} className="!m-0 !font-bold !text-slate-800 !text-[18px]">
          Control Panel
        </Title>
      </div>

      {/* 2 Groups compact container sát lên trên */}
      <div className="w-full flex flex-col gap-3.5">
        {/* Group 1: TEMPERATURE (Cooling Fan - LED 1) - Diện tích gọn gàng */}
        <div className="w-full bg-[#fff5f5] border-[1.5px] border-solid border-[#fecdd3] rounded-[20px] p-4 shadow-[0_2px_8px_rgba(244,63,94,0.04)] flex flex-col gap-3">
          {/* Category Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FireOutlined className="text-[#ef4444] text-[15px]" />
              <Text className="!text-[#ef4444] !font-bold !text-[12px] tracking-wider uppercase">
                Temperature
              </Text>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              LED 1
            </span>
          </div>

          {/* Row: Cooling Fan */}
          <div className="bg-white rounded-[14px] px-4 py-3 flex items-center justify-between border border-solid border-[#ffe4e6] shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-2xs flex-shrink-0">
                <ThunderboltOutlined className="text-base" />
              </span>
              <div className="flex flex-col">
                <Text className="!font-bold !text-slate-800 text-[15px] leading-tight">
                  Cooling Fan
                </Text>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">Relay 1 (LED 1)</span>
              </div>
            </div>
            <Switch
              checked={deviceState.coolingFan}
              onChange={() => onToggleDevice('coolingFan')}
              style={{
                backgroundColor: deviceState.coolingFan ? '#ef4444' : undefined,
              }}
            />
          </div>
        </div>

        {/* Group 2: LIGHT INTENSITY (Light - LED 2) - Diện tích gọn gàng */}
        <div className="w-full bg-[#fffbeb] border-[1.5px] border-solid border-[#fde68a] rounded-[20px] p-4 shadow-[0_2px_8px_rgba(217,119,6,0.04)] flex flex-col gap-3">
          {/* Category Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BulbOutlined className="text-[#d97706] text-[15px]" />
              <Text className="!text-[#d97706] !font-bold !text-[12px] tracking-wider uppercase">
                Lighting
              </Text>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              LED 2
            </span>
          </div>

          {/* Row: Light */}
          <div className="bg-white rounded-[14px] px-4 py-3 flex items-center justify-between border border-solid border-[#fef3c7] shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-2xs flex-shrink-0">
                <BulbOutlined className="text-base" />
              </span>
              <div className="flex flex-col">
                <Text className="!font-bold !text-slate-800 text-[15px] leading-tight">
                  Light
                </Text>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">Relay 2 (LED 2)</span>
              </div>
            </div>
            <Switch
              checked={deviceState.light}
              onChange={() => onToggleDevice('light')}
              style={{
                backgroundColor: deviceState.light ? '#f59e0b' : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

