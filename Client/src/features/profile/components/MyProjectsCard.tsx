import React from 'react';
import { Card, Typography, Button } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import type { ProjectLink } from '../types/profile.types';

const { Title, Text } = Typography;

interface MyProjectsCardProps {
  projects: ProjectLink[];
  loading?: boolean;
}

export const MyProjectsCard: React.FC<MyProjectsCardProps> = ({
  projects,
  loading = false,
}) => {
  const handleOpenLink = (url: string) => {
    if (!url || url === '#') {
      alert('Đường dẫn chưa được thiết lập!');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      loading={loading}
      style={{
        borderRadius: 20,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        border: '1px solid #e2e8f0',
        height: '100%',
        padding: '16px 20px',
      }}
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Centered Card Title */}
      <Title
        level={3}
        style={{
          textAlign: 'center',
          fontWeight: 700,
          color: '#0f172a',
          margin: '0 0 28px 0',
        }}
      >
        My Projects
      </Title>

      {/* Project Link Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {projects.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: 14,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1e293b',
              }}
            >
              {item.title}
            </Text>

            <Button
              type="primary"
              size="middle"
              icon={<LinkOutlined />}
              onClick={() => handleOpenLink(item.url)}
              style={{
                backgroundColor: '#0f172a',
                borderColor: '#0f172a',
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 13,
                height: 36,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Link
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MyProjectsCard;

