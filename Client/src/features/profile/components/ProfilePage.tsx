import React from 'react';
import { Row, Col, Alert } from 'antd';
import { useProfile } from '../hooks/useProfile';
import { ProfileInfoCard } from './ProfileInfoCard';
import { MyProjectsCard } from './MyProjectsCard';

export const ProfilePage: React.FC = () => {
  const { profile, projects, isLoading, error } = useProfile();

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '24px 16px',
      }}
    >
      {error && (
        <Alert
          message="Lỗi tải dữ liệu profile"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      <Row gutter={[24, 24]} align="stretch">
        <Col xs={24} md={9} lg={8}>
          <ProfileInfoCard profile={profile} loading={isLoading} />
        </Col>

        <Col xs={24} md={15} lg={16}>
          <MyProjectsCard projects={projects} loading={isLoading} />
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;

