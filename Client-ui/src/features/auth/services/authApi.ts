import apiClient from '@/services/apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types';

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    return (await apiClient.post<AuthResponse>('/auth/login', payload)).data;
  },
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    return (await apiClient.post<AuthResponse>('/auth/register', payload)).data;
  },
};
