import React from 'react';
import { Row, Col } from 'antd';
import {
  FireOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { SensorChartCard } from './SensorChartCard';
import { ControlPanel } from './ControlPanel';
import { useDashboard } from '../hooks/useDashboard';

const DropletLargeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0284c7" style={{ display: 'inline-block' }}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

export const DashboardPage: React.FC = () => {
  // Lấy dữ liệu và hàm xử lý từ custom hook useDashboard
  const {
    deviceState,
    handleToggleDevice,
    tempData,
    humidityData,
    lightData,
    currentTemp,
    currentHumidity,
    currentLight,
  } = useDashboard();

  return (
    <div className="w-full mx-auto p-0 box-border my-auto">
      <Row gutter={[24, 24]} align="stretch">
        {/* Cột trái: 3 Card Biểu đồ (Nhiệt độ, Độ ẩm, Ánh sáng) - Căn đều flexbox */}
        <Col
          xs={24}
          lg={15}
          xl={16}
          xxl={17}
          className="!flex flex-col gap-4"
        >
          {/* 1. Nhiệt độ */}
          <SensorChartCard
            type="temperature"
            title="Temperature"
            unit="°C"
            currentValue={currentTemp}
            color="#ef4444"
            iconBg="#fee2e2"
            icon={<FireOutlined style={{ fontSize: 24, color: '#ef4444' }} />}
            threshold={18}
            yMin={0}
            yMax={45}
            yTicks={[1, 5, 15, 20, 25, 30, 35, 40, 45]}
            data={tempData}
          />

          {/* 2. Độ ẩm */}
          <SensorChartCard
            type="humidity"
            title="Humidity"
            unit="%"
            currentValue={currentHumidity}
            color="#0ea5e9"
            iconBg="#e0f2fe"
            icon={<DropletLargeIcon />}
            threshold={40}
            yMin={0}
            yMax={100}
            yTicks={[1, 20, 30, 40, 50, 60, 70, 90, 100]}
            data={humidityData}
          />

          {/* 3. Ánh sáng */}
          <SensorChartCard
            type="light"
            title="Light Intensity"
            unit="Lux"
            currentValue={currentLight}
            color="#f59e0b"
            iconBg="#fef3c7"
            icon={<BulbOutlined style={{ fontSize: 24, color: '#d97706' }} />}
            threshold={20}
            yMin={0}
            yMax={45}
            yTicks={[1, 5, 15, 20, 25, 30, 35, 40, 45]}
            data={lightData}
          />
        </Col>

        {/* Cột phải: Khối Control Panel - Căn đều với cột trái */}
        <Col
          xs={24}
          lg={9}
          xl={8}
          xxl={7}
          className="!flex flex-col"
        >
          <ControlPanel
            deviceState={deviceState}
            onToggleDevice={handleToggleDevice}
          />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
