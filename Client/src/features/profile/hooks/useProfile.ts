import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchProfileDataThunk } from '../slices/profileSlice';

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { profile, projects, isLoading, error } = useAppSelector(
    (state) => state.profile
  );

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfileDataThunk());
    }
  }, [dispatch, profile]);

  const refresh = () => {
    dispatch(fetchProfileDataThunk());
  };

  return {
    profile,
    projects,
    isLoading,
    error,
    refresh,
  };
};

export default useProfile;

