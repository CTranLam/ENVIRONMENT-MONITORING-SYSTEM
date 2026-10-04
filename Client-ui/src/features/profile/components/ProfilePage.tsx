import React from 'react';
import { Col, Row } from 'antd';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { MyProjectsCard } from '@/features/profile/components/MyProjectsCard';
import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard';

export const ProfilePage: React.FC = () => {
  const { profile, isLoading, updateProfile } = useProfile();

  return (
    <div className="w-full max-w-[1400px] mx-auto py-4 px-2 box-border my-auto">
      <Row gutter={[32, 32]} align="stretch">
        <Col xs={24} lg={10} xl={9}>
          <ProfileInfoCard
            profile={profile}
            loading={isLoading}
            onUpdateProfile={updateProfile}
          />
        </Col>

        <Col xs={24} lg={14} xl={15}>
          <MyProjectsCard
            profile={profile}
            loading={isLoading}
            onUpdateProfile={updateProfile}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
