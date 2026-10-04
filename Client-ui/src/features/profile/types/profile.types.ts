export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  studentId: string;       
  avatarUrl: string;
  location: string;
  role: string;
  iotReportUrl: string;
  apiDocsUrl: string;
  githubUrl: string;
  figmaUrl: string;
}

/** Fields that can be changed from the profile screen. */
export type UpdateProfileRequest = Partial<
  Pick<
    UserProfile,
    | 'fullName'
    | 'email'
    | 'studentId'
    | 'avatarUrl'
    | 'location'
    | 'iotReportUrl'
    | 'apiDocsUrl'
    | 'githubUrl'
    | 'figmaUrl'
  >
>;

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
}
