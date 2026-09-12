export interface UserProfile {
  id?: string;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  studentId: string;       
  avatarUrl?: string;   
  location?: string;       
  role?: string;           
  iotReportUrl?: string;   
  apiDocsUrl?: string;     
  githubUrl?: string;      
  figmaUrl?: string;       
}

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
