import type { UserProfile } from '@/features/profile';

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest extends LoginRequest { fullName: string; studentId: string; className?: string; }
export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  email: string;
  permissions: string[];
  profile: UserProfile;
}
export interface AuthState { isAuthenticated: boolean; isLoading: boolean; error: string | null; }
