export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  studentId: string;       
  className: string | null;
  avatarUrl: string | null;
  bioText: string | null;
  location: string | null;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  iotReportUrl: string | null;
  apiDocsUrl: string | null;
  githubUrl: string | null;
  figmaUrl: string | null;
}

/** Fields that can be changed from the profile screen. */
export type UpdateProfileRequest = Partial<
  Pick<
    UserProfile,
    | 'fullName'
    | 'email'
    | 'studentId'
    | 'className'
    | 'bioText'
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
  /** True while an avatar image is being uploaded to object storage. */
  isUploadingAvatar: boolean;
}
