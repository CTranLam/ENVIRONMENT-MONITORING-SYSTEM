import React from 'react';
import { Switch, Typography } from 'antd';
import {
  SettingOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  SyncOutlined,
  BulbOutlined,
  FireOutlined,
} from '@ant-design/icons';
import type { DeviceControlState } from '../types/dashboard.types';

const { Title, Text } = Typography;

const DropletIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0284c7" style={{ display: 'inline-block' }}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

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
    <div className="w-full h-full flex flex-col">
      {/* Title Header */}
      <div className="flex items-center gap-2 mb-3 h-7">
        <SettingOutlined className="text-lg text-slate-800" />
        <Title level={4} className="!m-0 !font-bold !text-slate-800">
          Control Panel
        </Title>
      </div>

      {/* 3 Groups flex container to span equal vertical height */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Group 1: TEMPERATURE (Red / Rose Theme) */}
        <div className="flex-1 min-h-[120px] bg-[#fff5f5] border-[1.5px] border-solid border-[#fecdd3] rounded-[20px] px-5 py-4 shadow-[0_2px_10px_rgba(244,63,94,0.04)] flex flex-col justify-center">
          {/* Category Header */}
          <div className="flex items-center gap-1.5 mb-3.5">
            <FireOutlined className="text-[#ef4444] text-sm" />
            <Text className="!text-[#ef4444] !font-bold !text-[11px] tracking-wider uppercase">
              Temperature
            </Text>
          </div>

          {/* Row: Cooling Fan */}
          <div className="bg-white rounded-[14px] px-4 py-3 flex items-center justify-between border border-solid border-[#ffe4e6]">
            <div className="flex items-center gap-2.5">
              <ThunderboltOutlined className="text-base text-[#ef4444]" />
              <Text className="!font-semibold !text-slate-800 text-sm">
                Cooling Fan
              </Text>
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

        {/* Group 2: HUMIDITY (Blue Theme) */}
        <div className="flex-[1.25] min-h-[160px] bg-[#f0f9ff] border-[1.5px] border-solid border-[#bae6fd] rounded-[20px] px-5 py-4 shadow-[0_2px_10px_rgba(2,132,199,0.04)] flex flex-col justify-center">
          {/* Category Header */}
          <div className="flex items-center gap-1.5 mb-3.5">
            <DropletIcon />
            <Text className="!text-[#0284c7] !font-bold !text-[11px] tracking-wider uppercase">
              Humidity
            </Text>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Row 1: Misting System */}
            <div className="bg-white rounded-[14px] px-4 py-3 flex items-center justify-between border border-solid border-[#e0f2fe]">
              <div className="flex items-center gap-2.5">
                <CloudOutlined className="text-base text-[#0099FF]" />
                <Text className="!font-semibold !text-slate-800 text-sm">
                  Misting System
                </Text>
              </div>
              <Switch
                checked={deviceState.mistingSystem}
                onChange={() => onToggleDevice('mistingSystem')}
                style={{
                  backgroundColor: deviceState.mistingSystem ? '#0099FF' : undefined,
                }}
              />
            </div>

            {/* Row 2: Ventilation Fan */}
            <div className="bg-white rounded-[14px] px-4 py-3 flex items-center justify-between border border-solid border-[#e0f2fe]">
              <div className="flex items-center gap-2.5">
                <SyncOutlined className="text-base text-[#0099FF]" />
                <Text className="!font-semibold !text-slate-800 text-sm">
                  Ventilation Fan
                </Text>
              </div>
              <Switch
                checked={deviceState.ventilationFan}
                onChange={() => onToggleDevice('ventilationFan')}
                style={{
                  backgroundColor: deviceState.ventilationFan ? '#0099FF' : undefined,
                }}
              />
            </div>
          </div>
        </div>

        {/* Group 3: LIGHT INTENSITY (Yellow / Amber Theme) */}
        <div className="flex-1 min-h-[120px] bg-[#fffbeb] border-[1.5px] border-solid border-[#fde68a] rounded-[20px] px-5 py-4 shadow-[0_2px_10px_rgba(217,119,6,0.04)] flex flex-col justify-center">
          {/* Category Header */}
          <div className="flex items-center gap-1.5 mb-3.5">
            <BulbOutlined className="text-[#d97706] text-sm" />
            <Text className="!text-[#d97706] !font-bold !text-[11px] tracking-wider uppercase">
              Light Intensity
            </Text>
          </div>

          {/* Row: Light */}
          <div className="bg-white rounded-[14px] px-4 py-3 flex items-center justify-between border border-solid border-[#fef3c7]">
            <div className="flex items-center gap-2.5">
              <BulbOutlined className="text-base text-[#f59e0b]" />
              <Text className="!font-semibold !text-slate-800 text-sm">
                Light
              </Text>
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

