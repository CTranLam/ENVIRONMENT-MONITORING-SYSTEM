import React from 'react';
import { Card, Typography, Avatar } from 'antd';
import { MailOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
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
      className="!rounded-[24px] shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-200 h-full py-7 px-4"
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Avatar Container: hỗ trợ avatarUrl từ DB hoặc icon mặc định */}
      <div className="relative mb-5">
        <Avatar
          size={112}
          src={profile?.avatarUrl || undefined}
          icon={!profile?.avatarUrl ? <UserOutlined style={{ fontSize: 56, color: '#0099FF' }} /> : undefined}
          className="!bg-[#f0f9ff] !border-[3px] !border-[#0099FF] shadow-[0_6px_18px_rgba(0,153,255,0.18)]"
        />
        {/* Pulsing online status indicator */}
        <span className="status-dot-pulse absolute bottom-1 right-1.5 !w-4 !h-4 !bg-emerald-500 border-2 border-white shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" />
      </div>

      {/* Full Name */}
      <Title
        level={2}
        className="!m-0 !mb-1.5 !font-bold !text-slate-900 text-center !text-[26px]"
      >
        {profile?.fullName || 'Trần Quang Lâm'}
      </Title>

      {/* Role */}
      <Text className="!text-emerald-500 !font-bold !text-sm tracking-wider uppercase mb-2">
        {profile?.role || 'SOFTWARE ENGINEER'}
      </Text>

      {/* Student ID / Code */}
      <Text className="!text-slate-500 !text-[15px] !font-semibold mb-9">
        {profile?.studentId || 'B23DCCN480'}
      </Text>

      {/* Email pill container */}
      <div className="w-full max-w-[360px] bg-slate-100 rounded-[14px] px-5 py-3.5 mb-4 flex items-center gap-3.5 transition-all">
        <MailOutlined className="text-[#0099FF] text-lg" />
        <Text className="!text-slate-700 text-sm font-medium">
          {profile?.email || 'lamtq.work@gmail.com'}
        </Text>
      </div>

      {/* Location pill container */}
      <div className="w-full max-w-[360px] bg-slate-100 rounded-[14px] px-5 py-3.5 flex items-center gap-3.5 transition-all">
        <EnvironmentOutlined className="text-[#ef4444] text-lg" />
        <Text className="!text-slate-700 text-sm font-medium">
          {profile?.location || 'Hanoi, Vietnam'}
        </Text>
      </div>
    </Card>
  );
};

export default ProfileInfoCard;
