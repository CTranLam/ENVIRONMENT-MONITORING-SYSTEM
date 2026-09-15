import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchProfileThunk,
  updateProfileThunk,
} from '@/features/profile/slices/profileSlice';
import type { UpdateProfileRequest } from '@/features/profile/types/profile.types';

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isUpdating } = useAppSelector((state) => state.profile);

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

  return {
    profile,
    isLoading,
    isUpdating,
    refresh,
    updateProfile,
  };
};

export default useProfile;
