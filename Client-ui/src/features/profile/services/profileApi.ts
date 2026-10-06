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
};
