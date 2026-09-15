import apiClient from '@/services/apiClient';
import type { UpdateProfileRequest, UserProfile } from '@/features/profile/types/profile.types';

const defaultProfile: UserProfile = {
  id: '1',
  username: 'admin',
  fullName: 'Trần Quang Lâm',
  role: 'SOFTWARE ENGINEER',
  studentId: 'B23DCCN480',
  email: 'lamtq.work@gmail.com',
  location: 'Hanoi, Vietnam',
  avatarUrl: '',
  iotReportUrl: 'https://github.com',
  apiDocsUrl: 'http://localhost:5000/api-docs',
  githubUrl: 'https://github.com',
  figmaUrl: 'https://figma.com',
};

// Dùng tạm đến khi Profile API của backend sẵn sàng. Dữ liệu chỉ tồn tại trong tab hiện tại.
let currentProfileData: UserProfile = { ...defaultProfile };

const profileKeys: Array<keyof UserProfile> = [
  'id',
  'username',
  'fullName',
  'email',
  'studentId',
  'avatarUrl',
  'location',
  'role',
  'iotReportUrl',
  'apiDocsUrl',
  'githubUrl',
  'figmaUrl',
];

const isUserProfile = (value: unknown): value is UserProfile => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return profileKeys.every((key) => typeof candidate[key] === 'string');
};

const useMockProfile = (patch?: UpdateProfileRequest): UserProfile => {
  currentProfileData = { ...currentProfileData, ...patch };
  return currentProfileData;
};

export const profileApi = {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<unknown>('/profile');
      if (isUserProfile(response.data)) {
        currentProfileData = response.data;
        return currentProfileData;
      }
    } catch {
      // Backend chưa sẵn sàng hoặc request thất bại: tiếp tục bằng mock data.
    }

    return useMockProfile();
  },

  async updateProfile(patch: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.put<unknown>('/profile', patch);
      if (isUserProfile(response.data)) {
        currentProfileData = response.data;
        return currentProfileData;
      }
    } catch {
      // Backend chưa sẵn sàng hoặc request thất bại: lưu patch vào mock data.
    }

    return useMockProfile(patch);
  },
};
