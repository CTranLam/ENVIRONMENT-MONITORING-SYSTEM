import React, { useState } from 'react';
import { Table, Input, Select, Tag, Space, Typography, Card, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export interface SensorItem {
  id: number;
  time: string;
  temperature: number;
  humidity: number;
  light: number;
  dust: number;
  status: 'normal' | 'warning';
}

const mockSensorData: SensorItem[] = [
  { id: 1, time: '2026-09-12 15:30:00', temperature: 28.5, humidity: 68, light: 420, dust: 24, status: 'normal' },
  { id: 2, time: '2026-09-12 15:25:00', temperature: 28.6, humidity: 67, light: 415, dust: 25, status: 'normal' },
  { id: 3, time: '2026-09-12 15:20:00', temperature: 29.1, humidity: 69, light: 450, dust: 38, status: 'warning' },
  { id: 4, time: '2026-09-12 15:15:00', temperature: 28.8, humidity: 70, light: 430, dust: 26, status: 'normal' },
  { id: 5, time: '2026-09-12 15:10:00', temperature: 28.3, humidity: 71, light: 410, dust: 22, status: 'normal' },
  { id: 6, time: '2026-09-12 15:05:00', temperature: 28.0, humidity: 72, light: 390, dust: 21, status: 'normal' },
  { id: 7, time: '2026-09-12 15:00:00', temperature: 27.9, humidity: 73, light: 380, dust: 20, status: 'normal' },
  { id: 8, time: '2026-09-12 14:55:00', temperature: 29.5, humidity: 65, light: 520, dust: 42, status: 'warning' },
];

export const SensorDataPage: React.FC = () => {
  const [data, setData] = useState<SensorItem[]>(mockSensorData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData(mockSensorData);
      setLoading(false);
    }, 400);
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm);
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const columns: ColumnsType<SensorItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      align: 'center',
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      width: 180,
    },
    {
      title: 'Nhiệt độ (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (val: number) => <span style={{ fontWeight: 600, color: '#ef4444' }}>{val} °C</span>,
    },
    {
      title: 'Độ ẩm (%)',
      dataIndex: 'humidity',
      key: 'humidity',
      render: (val: number) => <span style={{ fontWeight: 600, color: '#0099FF' }}>{val} %</span>,
    },
    {
      title: 'Ánh sáng (Lux)',
      dataIndex: 'light',
      key: 'light',
      render: (val: number) => <span style={{ fontWeight: 600, color: '#f59e0b' }}>{val} Lux</span>,
    },
    {
      title: 'Bụi PM2.5 (µg/m³)',
      dataIndex: 'dust',
      key: 'dust',
      render: (val: number) => (
        <span style={{ fontWeight: 600, color: val > 35 ? '#ef4444' : '#10b981' }}>
          {val} µg/m³
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) =>
        status === 'warning' ? (
          <Tag color="warning">Cảnh báo</Tag>
        ) : (
          <Tag color="success">Bình thường</Tag>
        ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            Sensor Data
          </Title>
          <Text type="secondary">Bảng dữ liệu đo lường lịch sử từ hệ thống cảm biến môi trường</Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Làm mới
          </Button>
        </Space>
      </div>

      <Card
        style={{
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo thời gian hoặc ID..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            style={{ width: 160 }}
          >
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="normal">Bình thường</Select.Option>
            <Select.Option value="warning">Cảnh báo</Select.Option>
          </Select>
        </div>

        <Table<SensorItem>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
};

export default SensorDataPage;

