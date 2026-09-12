import React from 'react';
import { Card, Typography } from 'antd';
import { MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { UserProfile } from '../types/profile.types';

const { Title, Text } = Typography;

interface ProfileInfoCardProps {
  profile: UserProfile | null;
  loading?: boolean;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  profile,
  loading = false,
}) => {
  return (
    <Card
      loading={loading}
      style={{
        borderRadius: 20,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        border: '1px solid #e2e8f0',
        height: '100%',
        padding: '16px 8px',
      }}
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Green status indicator */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: '#10b981',
          marginBottom: 16,
          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
        }}
      />

      {/* Name */}
      <Title
        level={3}
        style={{
          margin: '0 0 4px 0',
          fontWeight: 700,
          color: '#0f172a',
          textAlign: 'center',
        }}
      >
        {profile?.name || 'Trần Quang Lâm'}
      </Title>

      {/* Role */}
      <Text
        style={{
          color: '#10b981',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {profile?.role || 'SOFTWARE ENGINEER'}
      </Text>

      {/* Student ID / Code */}
      <Text
        style={{
          color: '#94a3b8',
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 32,
        }}
      >
        {profile?.studentId || 'B23DCCN480'}
      </Text>

      {/* Email pill container */}
      <div
        style={{
          width: '100%',
          maxWidth: 300,
          backgroundColor: '#f1f5f9',
          borderRadius: 12,
          padding: '10px 16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <MailOutlined style={{ color: '#64748b', fontSize: 16 }} />
        <Text style={{ color: '#334155', fontSize: 13, fontWeight: 500 }}>
          {profile?.email || 'Chưa cập nhật email'}
        </Text>
      </div>

      {/* Location pill container */}
      <div
        style={{
          width: '100%',
          maxWidth: 300,
          backgroundColor: '#f1f5f9',
          borderRadius: 12,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <EnvironmentOutlined style={{ color: '#64748b', fontSize: 16 }} />
        <Text style={{ color: '#334155', fontSize: 13, fontWeight: 500 }}>
          {profile?.location || 'Hanoi, Vietnam'}
        </Text>
      </div>
    </Card>
  );
};

export default ProfileInfoCard;

