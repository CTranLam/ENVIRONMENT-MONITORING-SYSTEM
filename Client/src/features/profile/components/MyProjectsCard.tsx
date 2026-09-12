import React from 'react';
import { Card, Typography, Button } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import type { UserProfile } from '../types/profile.types';

const { Title, Text } = Typography;

interface MyProjectsCardProps {
  profile: UserProfile | null;
  loading?: boolean;
}

export const MyProjectsCard: React.FC<MyProjectsCardProps> = ({
  profile,
  loading = false,
}) => {
  const projectItems = [
    {
      id: 'iot-report',
      title: 'IoT Project Report:',
      url: profile?.iotReportUrl || '#',
    },
    {
      id: 'api-docs',
      title: 'API docs:',
      url: profile?.apiDocsUrl || '#',
    },
    {
      id: 'github',
      title: 'GitHub:',
      url: profile?.githubUrl || 'https://github.com',
    },
    {
      id: 'figma',
      title: 'Figma:',
      url: profile?.figmaUrl || 'https://figma.com',
    },
  ];

  const handleOpenLink = (url: string) => {
    if (!url || url === '#') {
      alert('Đường dẫn dự án chưa được thiết lập trong database!');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      loading={loading}
      className="!rounded-[24px] shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-200 h-full py-7 px-6"
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Centered Card Title */}
      <Title
        level={2}
        className="!text-center !font-bold !text-slate-900 !m-0 !mb-8 !text-[26px]"
      >
        My Projects
      </Title>

      {/* 4 Project Link Rows từ Database */}
      <div className="flex flex-col gap-[18px]">
        {projectItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-100 rounded-2xl px-6 py-4 flex items-center justify-between transition-all"
          >
            <Text className="!text-base !font-semibold !text-slate-800">
              {item.title}
            </Text>

            <Button
              type="primary"
              size="large"
              icon={<LinkOutlined />}
              onClick={() => handleOpenLink(item.url)}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900 !rounded-[10px] !font-semibold !text-sm !h-[42px] !px-[22px] flex items-center gap-2 shadow-md"
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
