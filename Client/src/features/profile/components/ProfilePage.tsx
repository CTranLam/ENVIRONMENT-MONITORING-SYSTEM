import React from 'react';
import { Row, Col, Alert } from 'antd';
import { useProfile } from '../hooks/useProfile';
import { ProfileInfoCard } from './ProfileInfoCard';
import { MyProjectsCard } from './MyProjectsCard';

export const ProfilePage: React.FC = () => {
  const { profile, isLoading, error, updateProfile } = useProfile();

  return (
    <div className="w-full max-w-[1400px] mx-auto py-4 px-2 box-border my-auto">
      {error && (
        <Alert
          message="Lỗi tải dữ liệu profile"
          description={error}
          type="error"
          showIcon
          className="mb-6"
        />
      )}

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
