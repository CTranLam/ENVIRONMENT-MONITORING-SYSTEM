import React from 'react';
import { Row, Col, Typography } from 'antd';
import {
  FireOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { SensorChartCard } from './SensorChartCard';
import { ControlPanel } from './ControlPanel';
import { useDashboard } from '../hooks/useDashboard';
import { useAlerts } from '@/features/alerts';

const { Title } = Typography;

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

  // Lấy ngưỡng cảnh báo an toàn từ useAlerts
  const { thresholds } = useAlerts();

  return (
    <div className="w-full mx-auto p-0 box-border my-auto">
      {/* Tiêu đề hiển thị ở giữa phía trên khối biểu đồ và control panel */}
      <div className="text-center mb-5">
        <Title
          level={2}
          className="!font-bold !text-slate-900 !m-0 !text-[26px] tracking-tight"
        >
          Environment monitoring system
        </Title>
      </div>

      <Row gutter={[24, 24]} align="stretch">
        {/* Cột trái: 3 Card Biểu đồ (Nhiệt độ, Độ ẩm, Ánh sáng) - Mở rộng không gian */}
        <Col
          xs={24}
          lg={16}
          xl={18}
          xxl={18}
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
            minThreshold={thresholds.tempMin}
            maxThreshold={thresholds.tempMax}
            yMin={0}
            yMax={45}
            yTicks={[0, 10, 15, 25, 30, 37, 45]}
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
            minThreshold={thresholds.humidityMin}
            maxThreshold={thresholds.humidityMax}
            yMin={0}
            yMax={100}
            yTicks={[0, 20, 35, 50, 65, 80, 100]}
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
            minThreshold={thresholds.lightMin}
            maxThreshold={thresholds.lightMax}
            yMin={0}
            yMax={1000}
            yTicks={[0, 100, 300, 500, 700, 850, 1000]}
            data={lightData}
          />
        </Col>

        {/* Cột phải: Khối Control Panel - Thu gọn bề rộng và neo sát lên trên */}
        <Col
          xs={24}
          lg={8}
          xl={6}
          xxl={6}
          className="!flex flex-col justify-start"
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
