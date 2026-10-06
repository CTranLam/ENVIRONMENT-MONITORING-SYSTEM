import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchProfileThunk,
  updateProfileThunk,
  uploadAvatarThunk,
} from '@/features/profile/slices/profileSlice';
import type { UpdateProfileRequest } from '@/features/profile/types/profile.types';

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isUpdating, isUploadingAvatar } = useAppSelector(
    (state) => state.profile,
  );

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfileThunk());
    }
  }, [dispatch, profile]);

  // refresh function to re-fetch the profile data
  const refresh = useCallback(() => {
    return dispatch(fetchProfileThunk());
  }, [dispatch]);

  const updateProfile = useCallback(
    (patch: UpdateProfileRequest) => {
      return dispatch(updateProfileThunk(patch));
    },
    [dispatch]
  );

  /** Upload ảnh đại diện mới lên MinIO; profile trong store cập nhật từ response. */
  const uploadAvatar = useCallback(
    (file: File) => {
      return dispatch(uploadAvatarThunk(file));
    },
    [dispatch]
  );

  return {
    profile,
    isLoading,
    isUpdating,
    isUploadingAvatar,
    refresh,
    updateProfile,
    uploadAvatar,
  };
};

export default useProfile;
