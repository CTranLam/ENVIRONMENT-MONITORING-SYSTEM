import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Content } = Layout;
const { Text } = Typography;

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabItems = [
    { key: '/dashboard', label: 'Dashboard' },
    { key: '/sensor-data', label: 'Sensor Data' },
    { key: '/action-history', label: 'Action History' },
    { key: '/profile', label: 'Profile' },
  ];

  const currentPath = location.pathname === '/' ? '/profile' : location.pathname;

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Top Header with Breadcrumb / Title */}
      <div
        style={{
          padding: '12px 24px 4px 24px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Text type="secondary" style={{ fontSize: 13 }}>
          {currentPath === '/profile'
            ? 'Profile Page'
            : currentPath.replace('/', '').toUpperCase()}
        </Text>
      </div>

      {/* Tabs Navigation Bar matching mockup */}
      <Header
        style={{
          backgroundColor: '#fff',
          padding: '0 24px',
          borderBottom: '1px solid #e2e8f0',
          height: 48,
          lineHeight: '48px',
        }}
      >
        <Menu
          mode="horizontal"
          selectedKeys={[currentPath]}
          items={tabItems}
          onClick={({ key }) => navigate(key)}
          style={{
            borderBottom: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        />
      </Header>

      {/* Main Content framed with light blue border as in mockup */}
      <Content style={{ padding: '24px' }}>
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid #bfdbfe',
            borderRadius: 16,
            minHeight: 'calc(100vh - 150px)',
            padding: '24px 16px',
          }}
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout;

