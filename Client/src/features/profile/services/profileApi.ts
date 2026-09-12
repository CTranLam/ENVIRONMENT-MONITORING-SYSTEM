import apiClient from '@/services/apiClient';
import type { UserProfile, ProjectLink } from '../types/profile.types';

const defaultProfile: UserProfile = {
  name: 'Trần Quang Lâm',
  role: 'SOFTWARE ENGINEER',
  studentId: 'B23DCCN480',
  email: 'lamtq.work@gmail.com',
  location: 'Hanoi, Vietnam',
  isOnline: true,
};

const defaultProjects: ProjectLink[] = [
  {
    id: 'iot-report',
    title: 'IoT Project Report:',
    url: 'https://github.com',
  },
  {
    id: 'api-docs',
    title: 'API docs:',
    url: 'http://localhost:5000/api-docs',
  },
  {
    id: 'github',
    title: 'GitHub:',
    url: 'https://github.com',
  },
  {
    id: 'figma',
    title: 'Figma:',
    url: 'https://figma.com',
  },
];

export const profileApi = {
  getProfileData: async (): Promise<{ profile: UserProfile; projects: ProjectLink[] }> => {
    try {
      const response = await apiClient.get('/profile');
      return response.data;
    } catch {
      // Fallback mock data matching design mockup
      return {
        profile: defaultProfile,
        projects: defaultProjects,
      };
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

