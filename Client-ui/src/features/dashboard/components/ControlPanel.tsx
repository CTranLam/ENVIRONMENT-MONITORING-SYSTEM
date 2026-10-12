import React from 'react';
import { Switch, Typography } from 'antd';
import {
  SettingOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  FireOutlined,
} from '@ant-design/icons';
import type {
  DeviceControlState,
  DeviceKey,
} from '@/features/dashboard/types/dashboard.types';

const { Title, Text } = Typography;

interface ControlPanelProps {
  deviceState: DeviceControlState;
  onToggleDevice: (device: DeviceKey) => void;
  pendingDeviceKey: DeviceKey | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  deviceState,
  onToggleDevice,
  pendingDeviceKey,
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
        {/* Green LED */}
        <div className={`w-full rounded-[20px] border-[1.5px] border-solid p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex flex-col gap-3 transition-colors ${deviceState.ledGreen ? 'bg-green-50 border-[#22c55e]' : 'bg-slate-50 border-slate-200'}`}>
          {/* Category Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FireOutlined className={`text-[15px] ${deviceState.ledGreen ? 'text-[#22c55e]' : 'text-slate-500'}`} />
              <Text className={`!font-bold !text-[12px] tracking-wider uppercase ${deviceState.ledGreen ? '!text-[#22c55e]' : '!text-slate-500'}`}>
                Green LED
              </Text>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${deviceState.ledGreen ? 'bg-green-100 text-[#22c55e]' : 'bg-slate-200 text-slate-600'}`}>
              D1
            </span>
          </div>

          {/* Row: LED Green */}
          <div className="bg-white rounded-[14px] px-4 py-3 flex items-center justify-between border border-solid border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center shadow-2xs flex-shrink-0 ${deviceState.ledGreen ? 'bg-green-100 text-[#22c55e]' : 'bg-slate-100 text-slate-500'}`}>
                <ThunderboltOutlined className="text-base" />
              </span>
              <div className="flex flex-col">
                <Text className="!font-bold !text-slate-800 text-[15px] leading-tight">
                  LED Green
                </Text>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">GPIO D1 · ESP8266</span>
              </div>
            </div>
            <Switch
              checked={deviceState.ledGreen}
              onChange={() => onToggleDevice('ledGreen')}
              loading={pendingDeviceKey === 'ledGreen'}
              disabled={pendingDeviceKey !== null}
              className="[&.ant-switch-checked]:!bg-[#22c55e]"
            />
          </div>
        </div>

        {/* Red LED */}
        <div className={`w-full rounded-[20px] border-[1.5px] border-solid p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex flex-col gap-3 transition-colors ${deviceState.ledRed ? 'bg-green-50 border-[#22c55e]' : 'bg-slate-50 border-slate-200'}`}>
          {/* Category Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BulbOutlined className={`text-[15px] ${deviceState.ledRed ? 'text-[#22c55e]' : 'text-slate-500'}`} />
              <Text className={`!font-bold !text-[12px] tracking-wider uppercase ${deviceState.ledRed ? '!text-[#22c55e]' : '!text-slate-500'}`}>
                Red LED
              </Text>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${deviceState.ledRed ? 'bg-green-100 text-[#22c55e]' : 'bg-slate-200 text-slate-600'}`}>
              D2
            </span>
          </div>

          {/* Row: LED Red */}
          <div className="bg-white rounded-[14px] px-4 py-3 flex items-center justify-between border border-solid border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center shadow-2xs flex-shrink-0 ${deviceState.ledRed ? 'bg-green-100 text-[#22c55e]' : 'bg-slate-100 text-slate-500'}`}>
                <BulbOutlined className="text-base" />
              </span>
              <div className="flex flex-col">
                <Text className="!font-bold !text-slate-800 text-[15px] leading-tight">
                  LED Red
                </Text>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">GPIO D2 · ESP8266</span>
              </div>
            </div>
            <Switch
              checked={deviceState.ledRed}
              onChange={() => onToggleDevice('ledRed')}
              loading={pendingDeviceKey === 'ledRed'}
              disabled={pendingDeviceKey !== null}
              className="[&.ant-switch-checked]:!bg-[#22c55e]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
