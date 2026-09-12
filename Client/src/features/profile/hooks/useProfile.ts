import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchProfileDataThunk, updateProfileThunk } from '../slices/profileSlice';
import type { UserProfile } from '../types/profile.types';

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading, error } = useAppSelector((state) => state.profile);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfileDataThunk());
    }
  }, [dispatch, profile]);

  const refresh = useCallback(() => {
    dispatch(fetchProfileDataThunk());
  }, [dispatch]);

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      return dispatch(updateProfileThunk(patch));
    },
    [dispatch]
  );

  return {
    profile,
    isLoading,
    error,
    refresh,
    updateProfile,
  };
};

export default useProfile;
