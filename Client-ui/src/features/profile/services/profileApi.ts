import apiClient from '@/services/apiClient';
import type { UpdateProfileRequest, UserProfile } from '@/features/profile/types/profile.types';

export const profileApi = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/profile/me');
    return response.data;
  },
  async updateProfile(patch: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/profile/me', patch);
    return response.data;
  },
  /**
   * Upload ảnh đại diện lên object storage (MinIO) qua backend.
   * Backend lưu object key và trả về profile đã có `avatarUrl` trỏ tới ảnh.
   */
  async uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<UserProfile>('/profile/me/avatar', formData);
    return response.data;
  },
};
