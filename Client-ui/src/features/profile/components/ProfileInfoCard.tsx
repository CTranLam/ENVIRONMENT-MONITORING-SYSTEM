import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Avatar, Input, Tooltip, Modal, Button, message } from 'antd';
import {
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  CameraOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type {
  UpdateProfileRequest,
  UserProfile,
} from '@/features/profile/types/profile.types';

const { Title, Text } = Typography;

interface ProfileInfoCardProps {
  profile: UserProfile | null;
  loading?: boolean;
  onUpdateProfile?: (patch: UpdateProfileRequest) => void;
  /** Upload ảnh đại diện mới lên MinIO (multipart). */
  onUploadAvatar?: (file: File) => void;
  uploadingAvatar?: boolean;
}

// Nén ảnh về kích thước tối ưu cho avatar (max 400x400) và trả về File để upload.
const resizeAvatar = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Lỗi xử lý hình ảnh'));
              return;
            }
            resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.85,
        );
      };
      img.onerror = () => reject(new Error('Lỗi xử lý hình ảnh'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Lỗi đọc tệp'));
    reader.readAsDataURL(file);
  });
};

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  profile,
  loading = false,
  onUpdateProfile,
  onUploadAvatar,
  uploadingAvatar = false,
}) => {
  const [editingField, setEditingField] = useState<'fullName' | 'studentId' | 'email' | 'location' | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Modal cập nhật avatar
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string>(profile?.avatarUrl || '');
  // File đã chọn và nén, sẵn sàng gửi lên MinIO; null nghĩa là người dùng dán URL.
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Giải phóng blob URL của ảnh xem trước khi đóng modal hoặc chọn ảnh khác.
  useEffect(() => {
    return () => {
      if (previewAvatar.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, [previewAvatar]);

  const handleStartEdit = (field: 'fullName' | 'studentId' | 'email' | 'location', currentVal: string) => {
    setEditingField(field);
    setEditValue(currentVal || '');
  };

  const handleSaveEdit = () => {
    if (editingField && onUpdateProfile) {
      const patch: UpdateProfileRequest = { [editingField]: editValue.trim() };
      onUpdateProfile(patch);
    }
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleOpenAvatarModal = () => {
    setPreviewAvatar(profile?.avatarUrl || '');
    setPendingAvatarFile(null);
    setAvatarModalOpen(true);
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn một tệp hình ảnh (PNG, JPG, WEBP)!');
      return;
    }

    try {
      const prepared = await resizeAvatar(file);
      if (previewAvatar.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatar);
      }
      setPendingAvatarFile(prepared);
      setPreviewAvatar(URL.createObjectURL(prepared));
    } catch {
      message.error('Không thể xử lý ảnh đã chọn!');
    }
    e.target.value = '';
  };

  const handleSaveAvatar = () => {
    // Ảnh chọn từ máy: upload lên MinIO; backend trả về profile đã có URL mới.
    if (pendingAvatarFile && onUploadAvatar) {
      onUploadAvatar(pendingAvatarFile);
      setPendingAvatarFile(null);
      setAvatarModalOpen(false);
      return;
    }
    // Không chọn tệp: lưu URL dán tay như trước.
    if (onUpdateProfile && previewAvatar.trim() !== (profile?.avatarUrl ?? '')) {
      onUpdateProfile({ avatarUrl: previewAvatar.trim() });
    }
    setAvatarModalOpen(false);
  };

  return (
    <Card
      loading={loading}
      className="!rounded-[26px] shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-200 h-full py-8 px-6"
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Avatar Container */}
      <div className="relative mb-6">
        <Avatar
          size={124}
          src={profile?.avatarUrl || undefined}
          icon={!profile?.avatarUrl ? <UserOutlined style={{ fontSize: 62, color: '#0099FF' }} /> : undefined}
          className="!bg-[#f0f9ff] !border-[3px] !border-[#0099FF] shadow-[0_6px_20px_rgba(0,153,255,0.18)] object-cover"
        />
        {/* Nút Upload / Sửa Avatar Mới - Góc dưới bên phải */}
        <Tooltip title="Tải lên ảnh đại diện mới">
          <button
            type="button"
            onClick={handleOpenAvatarModal}
            className="absolute bottom-0 right-0 w-9 h-9 bg-slate-800 hover:bg-[#0099FF] text-white rounded-full border-2 border-white shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 z-10"
          >
            <CameraOutlined className="text-[17px] !text-white" style={{ stroke: 'currentColor', strokeWidth: 15 }} />
          </button>
        </Tooltip>
      </div>

      {/* 1. Full Name */}
      <div className="w-full max-w-[390px] flex items-center justify-center mb-2">
        {editingField === 'fullName' ? (
          <div className="flex items-center gap-2 w-full">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              autoFocus
              className="!rounded-lg !text-[18px] !font-bold text-center !py-1"
            />
            <button
              onClick={handleSaveEdit}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
              title="Lưu"
            >
              <CheckOutlined className="text-base font-bold" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all border-none bg-transparent cursor-pointer"
              title="Hủy"
            >
              <CloseOutlined className="text-base font-bold" />
            </button>
          </div>
        ) : (
          <div className="group flex items-center justify-center gap-2 relative">
            <Title
              level={2}
              className="!m-0 !font-bold !text-slate-900 text-center !text-[28px]"
            >
              {profile?.fullName || '—'}
            </Title>
            <Tooltip title="Chỉnh sửa họ tên">
              <button
                type="button"
                onClick={() => handleStartEdit('fullName', profile?.fullName ?? '')}
                className="text-slate-800 hover:text-[#0099FF] hover:bg-slate-100 p-1.5 rounded-lg transition-all border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <EditOutlined className="text-lg !text-slate-800 hover:!text-[#0099FF]" style={{ stroke: 'currentColor', strokeWidth: 20 }} />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* 2. Student ID / Code */}
      <div className="w-full max-w-[390px] flex items-center justify-center mb-8">
        {editingField === 'studentId' ? (
          <div className="flex items-center gap-2 w-[240px]">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              autoFocus
              className="!rounded-lg !text-[15px] text-center !py-1"
            />
            <button
              onClick={handleSaveEdit}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
              title="Lưu"
            >
              <CheckOutlined className="text-sm font-bold" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all border-none bg-transparent cursor-pointer"
              title="Hủy"
            >
              <CloseOutlined className="text-sm font-bold" />
            </button>
          </div>
        ) : (
          <div className="group flex items-center justify-center gap-2">
            <Text className="!text-slate-600 !text-[16px] !font-semibold">
              {profile?.studentId || '—'}
            </Text>
            <Tooltip title="Chỉnh sửa mã sinh viên">
              <button
                type="button"
                onClick={() => handleStartEdit('studentId', profile?.studentId ?? '')}
                className="text-slate-800 hover:text-[#0099FF] hover:bg-slate-100 p-1.5 rounded-lg transition-all border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <EditOutlined className="text-base !text-slate-800 hover:!text-[#0099FF]" style={{ stroke: 'currentColor', strokeWidth: 20 }} />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* 3. Email pill container */}
      <div className="w-full max-w-[390px] bg-slate-100 rounded-[16px] px-5 py-3.5 mb-4 flex items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-3.5 flex-1 overflow-hidden">
          <MailOutlined className="text-[#0099FF] text-xl flex-shrink-0" />
          {editingField === 'email' ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
                className="!rounded-md !text-[14px] !py-0.5"
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-all border-none bg-transparent cursor-pointer"
                title="Lưu"
              >
                <CheckOutlined className="text-sm font-bold" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-slate-500 hover:text-slate-700 rounded transition-all border-none bg-transparent cursor-pointer"
                title="Hủy"
              >
                <CloseOutlined className="text-sm font-bold" />
              </button>
            </div>
          ) : (
            <Text className="!text-slate-800 text-[15px] font-medium truncate flex-1">
              {profile?.email || '—'}
            </Text>
          )}
        </div>
        {editingField !== 'email' && (
          <Tooltip title="Chỉnh sửa email">
            <button
              type="button"
              onClick={() => handleStartEdit('email', profile?.email ?? '')}
              className="text-slate-800 hover:text-[#0099FF] hover:bg-slate-200 p-1.5 rounded-lg transition-all border-none bg-transparent cursor-pointer flex items-center justify-center flex-shrink-0"
            >
              <EditOutlined className="text-base !text-slate-800 hover:!text-[#0099FF]" style={{ stroke: 'currentColor', strokeWidth: 20 }} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* 4. Location pill container */}
      <div className="w-full max-w-[390px] bg-slate-100 rounded-[16px] px-5 py-3.5 flex items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-3.5 flex-1 overflow-hidden">
          <EnvironmentOutlined className="text-[#ef4444] text-xl flex-shrink-0" />
          {editingField === 'location' ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
                className="!rounded-md !text-[14px] !py-0.5"
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-all border-none bg-transparent cursor-pointer"
                title="Lưu"
              >
                <CheckOutlined className="text-sm font-bold" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-slate-500 hover:text-slate-700 rounded transition-all border-none bg-transparent cursor-pointer"
                title="Hủy"
              >
                <CloseOutlined className="text-sm font-bold" />
              </button>
            </div>
          ) : (
            <Text className="!text-slate-800 text-[15px] font-medium truncate flex-1">
              {profile?.location || '—'}
            </Text>
          )}
        </div>
        {editingField !== 'location' && (
          <Tooltip title="Chỉnh sửa địa chỉ">
            <button
              type="button"
              onClick={() => handleStartEdit('location', profile?.location ?? '')}
              className="text-slate-800 hover:text-[#0099FF] hover:bg-slate-200 p-1.5 rounded-lg transition-all border-none bg-transparent cursor-pointer flex items-center justify-center flex-shrink-0"
            >
              <EditOutlined className="text-base !text-slate-800 hover:!text-[#0099FF]" style={{ stroke: 'currentColor', strokeWidth: 20 }} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Modal Cập Nhật Avatar */}
      <Modal
        title="Cập nhật ảnh đại diện"
        open={avatarModalOpen}
        onOk={handleSaveAvatar}
        onCancel={() => setAvatarModalOpen(false)}
        okText={uploadingAvatar ? 'Đang tải lên...' : 'Lưu ảnh'}
        cancelText="Hủy"
        confirmLoading={uploadingAvatar}
        maskClosable={!uploadingAvatar}
        okButtonProps={{ className: '!bg-[#0099FF] !border-[#0099FF]' }}
        centered
        destroyOnClose
      >
        <div className="py-4 flex flex-col items-center gap-5">
          {/* Avatar Preview */}
          <div className="relative">
            <Avatar
              size={110}
              src={previewAvatar || undefined}
              icon={!previewAvatar ? <UserOutlined style={{ fontSize: 55, color: '#0099FF' }} /> : undefined}
              className="!bg-[#f0f9ff] !border-[3px] !border-[#0099FF] shadow-md object-cover"
            />
          </div>

          {/* Nút Upload từ máy tính */}
          <div className="w-full flex flex-col items-center">
            <Button
              type="dashed"
              size="large"
              icon={<UploadOutlined />}
              loading={uploadingAvatar}
              disabled={uploadingAvatar}
              onClick={() => avatarFileInputRef.current?.click()}
              className="w-full !h-12 !rounded-xl !border-slate-300 hover:!border-[#0099FF] hover:!text-[#0099FF] flex items-center justify-center gap-2 font-medium cursor-pointer text-slate-700"
            >
              {pendingAvatarFile
                ? `Đã chọn: ${pendingAvatarFile.name} (bấm để đổi)`
                : 'Chọn ảnh từ máy tính (PNG, JPG, WEBP)'}
            </Button>
            <span className="mt-2 text-xs text-slate-400">
              Ảnh được nén còn tối đa 400×400 và lưu trên MinIO. Tối đa 2 MB.
            </span>
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileSelect}
            />
          </div>

          <div className="w-full flex items-center gap-3">
            <div className="h-[1px] bg-slate-200 flex-1" />
            <span className="text-xs text-slate-400 uppercase font-medium">Hoặc dán URL</span>
            <div className="h-[1px] bg-slate-200 flex-1" />
          </div>

          {/* Ô nhập link URL */}
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Đường dẫn URL ảnh:
            </label>
            <Input
              value={pendingAvatarFile ? '' : previewAvatar}
              disabled={!!pendingAvatarFile}
              onChange={(e) => setPreviewAvatar(e.target.value)}
              placeholder={
                pendingAvatarFile
                  ? 'Đang dùng ảnh vừa chọn từ máy tính'
                  : 'https://example.com/avatar.jpg'
              }
              className="!rounded-lg !py-2"
              onPressEnter={handleSaveAvatar}
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default ProfileInfoCard;
