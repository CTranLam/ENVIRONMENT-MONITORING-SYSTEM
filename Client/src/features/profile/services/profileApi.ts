import apiClient from '@/services/apiClient';
import type { UserProfile } from '../types/profile.types';

const defaultProfile: UserProfile = {
  id: '1',
  username: 'admin',
  fullName: 'Trần Quang Lâm',
  role: 'SOFTWARE ENGINEER',
  studentId: 'B23DCCN480',
  email: 'lamtq.work@gmail.com',
  location: 'Hanoi, Vietnam',
  avatarUrl: '', // Link ảnh avatar từ DB (để trống nếu dùng avatar icon mặc định)
  iotReportUrl: 'https://github.com',
  apiDocsUrl: 'http://localhost:5000/api-docs',
  githubUrl: 'https://github.com',
  figmaUrl: 'https://figma.com',
};

export const profileApi = {
  getProfileData: async (): Promise<UserProfile> => {
    try {
      const response = await apiClient.get('/profile');
      return response.data;
    } catch {
      // Fallback mock data khi Backend chưa kết nối
      return defaultProfile;
    }
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await apiClient.put('/profile', data);
      return response.data;
    } catch {
      return { ...defaultProfile, ...data };
    }
  },
};
