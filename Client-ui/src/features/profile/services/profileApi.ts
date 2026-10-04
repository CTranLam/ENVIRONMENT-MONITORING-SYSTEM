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
  iotReportUrl: 'https://ptiteduvn-my.sharepoint.com/:w:/r/personal/lamtq_b23cn480_stu_ptit_edu_vn/_layouts/15/Doc.aspx?sourcedoc=%7B32F9E2F7-EAA1-4DF1-B6A2-FD787A47B208%7D&file=BTL-IOT.docx&action=default&mobileredirect=true&wdOrigin=APPHOME-WEB.DIRECT%2CAPPHOME-WEB.FILEBROWSER.RECENT&wdPreviousSession=81ba4a6e-94b3-4671-b6e6-18b3473c4c18&wdPreviousSessionSrc=AppHomeWeb&ct=1790149942054',
  apiDocsUrl: 'http://localhost:8080/swagger-ui.html',
  githubUrl: 'https://github.com/CTranLam/ENVIRONMENT-MONITORING-SYSTEM',
  figmaUrl: 'https://www.figma.com/design/fJX4Oy0EqBTVABP1AIUHQQ/Iot?node-id=0-1&p=f&t=Depdw7JAei5kmUqf-0',
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
