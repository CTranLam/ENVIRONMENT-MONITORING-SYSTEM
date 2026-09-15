import React, { useState } from 'react';
import { Card, Typography, Button, Modal, Input, Tooltip } from 'antd';
import { LinkOutlined, EditOutlined } from '@ant-design/icons';
import type {
  UpdateProfileRequest,
  UserProfile,
} from '@/features/profile/types/profile.types';

const { Title, Text } = Typography;

interface ProjectItem {
  id: string;
  key: ProjectLinkField;
  title: string;
  url: string;
}

interface MyProjectsCardProps {
  profile: UserProfile | null;
  loading?: boolean;
  onUpdateProfile?: (patch: UpdateProfileRequest) => void;
}

type ProjectLinkField = 'iotReportUrl' | 'apiDocsUrl' | 'githubUrl' | 'figmaUrl';

export const MyProjectsCard: React.FC<MyProjectsCardProps> = ({
  profile,
  loading = false,
  onUpdateProfile,
}) => {
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [editUrl, setEditUrl] = useState<string>('');

  const projectItems: ProjectItem[] = [
    {
      id: 'iot-report',
      key: 'iotReportUrl',
      title: 'IoT Project Report:',
      url: profile?.iotReportUrl || 'https://github.com',
    },
    {
      id: 'api-docs',
      key: 'apiDocsUrl',
      title: 'API docs:',
      url: profile?.apiDocsUrl || 'http://localhost:5000/api-docs',
    },
    {
      id: 'github',
      key: 'githubUrl',
      title: 'GitHub:',
      url: profile?.githubUrl || 'https://github.com',
    },
    {
      id: 'figma',
      key: 'figmaUrl',
      title: 'Figma:',
      url: profile?.figmaUrl || 'https://figma.com',
    },
  ];

  const handleOpenLink = (url: string) => {
    if (!url || url === '#') {
      alert('Đường dẫn dự án chưa được thiết lập!');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEdit = (item: ProjectItem) => {
    setEditingItem(item);
    setEditUrl(item.url || '');
  };

  const handleSaveModal = () => {
    if (editingItem && onUpdateProfile) {
      const patch: UpdateProfileRequest = { [editingItem.key]: editUrl.trim() };
      onUpdateProfile(patch);
    }
    setEditingItem(null);
  };

  const handleCancelModal = () => {
    setEditingItem(null);
    setEditUrl('');
  };

  return (
    <Card
      loading={loading}
      className="!rounded-[26px] shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-200 h-full py-8 px-7"
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Centered Card Title */}
      <Title
        level={2}
        className="!text-center !font-bold !text-slate-900 !m-0 !mb-8 !text-[28px]"
      >
        My Projects
      </Title>

      {/* 4 Project Link Rows từ Database */}
      <div className="flex flex-col gap-5">
        {projectItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-100 rounded-2xl px-7 py-4 flex items-center justify-between transition-all hover:bg-slate-150"
          >
            <div className="flex flex-col gap-1 overflow-hidden pr-3">
              <Text className="!text-[17px] !font-semibold !text-slate-800">
                {item.title}
              </Text>
              {item.url && (
                <Text className="!text-xs !text-slate-400 font-mono truncate max-w-[280px] sm:max-w-[340px]">
                  {item.url}
                </Text>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <Button
                type="primary"
                size="large"
                icon={<LinkOutlined />}
                onClick={() => handleOpenLink(item.url)}
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900 !rounded-[12px] !font-semibold !text-[15px] !h-[44px] !px-5 flex items-center gap-2 shadow-md cursor-pointer"
              >
                Link
              </Button>

              <Tooltip title="Chỉnh sửa liên kết">
                <Button
                  icon={<EditOutlined className="text-base !text-slate-800 hover:!text-[#0099FF]" style={{ stroke: 'currentColor', strokeWidth: 20 }} />}
                  onClick={() => handleOpenEdit(item)}
                  className="!rounded-[12px] !h-[44px] !w-[44px] flex items-center justify-center !border-slate-400 hover:!border-[#0099FF] hover:!text-[#0099FF] !text-slate-800 !bg-white cursor-pointer shadow-sm"
                />
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Chỉnh Sửa URL Dự Án */}
      <Modal
        title={`Chỉnh sửa liên kết - ${editingItem?.title.replace(':', '')}`}
        open={!!editingItem}
        onOk={handleSaveModal}
        onCancel={handleCancelModal}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{ className: '!bg-[#0099FF] !border-[#0099FF]' }}
        centered
        destroyOnClose
      >
        <div className="py-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Đường dẫn URL:
          </label>
          <Input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="https://..."
            onPressEnter={handleSaveModal}
            className="!rounded-lg !py-2"
            autoFocus
          />
        </div>
      </Modal>
    </Card>
  );
};

export default MyProjectsCard;
