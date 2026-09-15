import React from 'react';
import { Modal, Button, Typography } from 'antd';
import {
  DisconnectOutlined,
  FireFilled,
  BulbFilled,
  WarningFilled,
  ReloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type {
  AlertItem,
  AlertType,
} from '@/features/alerts/types/alerts.types';

const { Title, Text, Paragraph } = Typography;

interface AlertPopupModalProps {
  alert: AlertItem | null;
  onDismiss: () => void;
  onAlertAction: (alert: AlertItem) => void;
  onRetryConnection: () => void;
}

// Icon giọt nước SVG
const DropletSvgIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block' }}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

export const AlertPopupModal: React.FC<AlertPopupModalProps> = ({
  alert,
  onDismiss,
  onAlertAction,
  onRetryConnection,
}) => {
  if (!alert) return null;

  // Cấu hình màu sắc, icon và phong cách dựa trên loại cảnh báo
  const getAlertConfig = (type: AlertType) => {
    switch (type) {
      case 'SYSTEM_OFFLINE':
        return {
          icon: <DisconnectOutlined className="text-3xl text-red-500 animate-pulse" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          badgeColor: 'bg-red-100 text-red-700 border-red-200',
          buttonColor: '!bg-red-600 hover:!bg-red-500 !border-red-600',
        };
      case 'TEMPERATURE_HIGH':
        return {
          icon: <FireFilled className="text-3xl text-rose-500" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-500',
          badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
          buttonColor: '!bg-rose-600 hover:!bg-rose-500 !border-rose-600',
        };
      case 'TEMPERATURE_LOW':
        return {
          icon: <WarningFilled className="text-3xl text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
          buttonColor: '!bg-blue-600 hover:!bg-blue-500 !border-blue-600',
        };
      case 'HUMIDITY_HIGH':
        return {
          icon: <span className="text-sky-500"><DropletSvgIcon /></span>,
          bgColor: 'bg-sky-50',
          borderColor: 'border-sky-500',
          badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
          buttonColor: '!bg-sky-600 hover:!bg-sky-500 !border-sky-600',
        };
      case 'HUMIDITY_LOW':
        return {
          icon: <span className="text-amber-500"><DropletSvgIcon /></span>,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-500',
          badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
          buttonColor: '!bg-amber-600 hover:!bg-amber-500 !border-amber-600',
        };
      case 'LIGHT_HIGH':
        return {
          icon: <BulbFilled className="text-3xl text-amber-500" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-500',
          badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
          buttonColor: '!bg-amber-600 hover:!bg-amber-500 !border-amber-600',
        };
      case 'LIGHT_LOW':
        return {
          icon: <BulbFilled className="text-3xl text-indigo-500" />,
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-500',
          badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          buttonColor: '!bg-indigo-600 hover:!bg-indigo-500 !border-indigo-600',
        };
      default:
        return {
          icon: <WarningFilled className="text-3xl text-amber-500" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-500',
          badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
          buttonColor: '!bg-[#0099FF]',
        };
    }
  };

  const config = getAlertConfig(alert.type);

  return (
    <Modal
      open={!!alert}
      onCancel={onDismiss}
      footer={null}
      centered
      destroyOnClose
      width={480}
      className="alert-popup-modal"
      bodyStyle={{ padding: 0 }}
      maskClosable={false}
    >
      <div className="p-6 flex flex-col items-center text-center">
        {/* Vòng tròn Icon nổi bật với hiệu ứng viền */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${config.bgColor} shadow-md border-2 ${config.borderColor}`}
        >
          {config.icon}
        </div>

        {/* Tiêu đề cảnh báo */}
        <Title level={4} className="!font-bold !text-slate-900 !m-0 !mb-2 !text-[20px]">
          {alert.title}
        </Title>

        {/* Thời gian phát hiện */}
        <span className="text-xs text-slate-400 font-medium mb-3">
          Thời gian: {alert.timestamp}
        </span>

        {/* Nội dung chi tiết */}
        <Paragraph className="!text-slate-600 text-sm leading-relaxed mb-4">
          {alert.message}
        </Paragraph>

        {/* Thẻ thông số so sánh giá trị đo & ngưỡng (nếu có) */}
        {alert.currentValue !== undefined && alert.thresholdValue !== undefined && (
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 mb-5 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <Text className="!text-xs !text-slate-400 !font-medium">Giá trị đo được</Text>
              <Text className="!text-base !font-extrabold !text-slate-900 mt-0.5">
                {alert.currentValue} {alert.unit}
              </Text>
            </div>
            <div className="h-7 w-[1px] bg-slate-200" />
            <div className="flex flex-col items-center">
              <Text className="!text-xs !text-slate-400 !font-medium">Ngưỡng quy định</Text>
              <Text className="!text-base !font-bold !text-slate-600 mt-0.5">
                {alert.thresholdValue} {alert.unit}
              </Text>
            </div>
          </div>
        )}

        {/* Hàng nút bấm hành động */}
        <div className="w-full flex items-center justify-end gap-3 mt-2">
          <Button
            size="large"
            onClick={onDismiss}
            className="flex-1 !rounded-xl !h-11 font-medium !border-slate-300 hover:!border-slate-400 !text-slate-700"
          >
            Đã hiểu / Bỏ qua
          </Button>

          {alert.type === 'SYSTEM_OFFLINE' ? (
            <Button
              type="primary"
              size="large"
              icon={<ReloadOutlined />}
              onClick={onRetryConnection}
              className={`flex-1 !rounded-xl !h-11 font-bold ${config.buttonColor} shadow-md`}
            >
              Thử kết nối lại
            </Button>
          ) : alert.action ? (
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => onAlertAction(alert)}
              className={`flex-1 !rounded-xl !h-11 font-bold ${config.buttonColor} shadow-md`}
            >
              {alert.action.label}
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default AlertPopupModal;
