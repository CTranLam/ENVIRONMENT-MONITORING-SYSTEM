export interface UserProfile {
  name: string;
  role: string;
  studentId: string;
  email: string;
  location: string;
  isOnline: boolean;
}

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
}

export interface ProfileState {
  profile: UserProfile | null;
  projects: ProjectLink[];
  isLoading: boolean;
  error: string | null;
}

