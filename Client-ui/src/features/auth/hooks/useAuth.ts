import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setProfile } from '@/features/profile/slices/profileSlice';
import { loginThunk, logout, registerThunk } from '@/features/auth/slices/authSlice';
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((rootState) => rootState.auth);
  const login = useCallback(async (payload: LoginRequest) => {
    const response = await dispatch(loginThunk(payload)).unwrap(); dispatch(setProfile(response.profile)); return response;
  }, [dispatch]);
  const register = useCallback(async (payload: RegisterRequest) => {
    const response = await dispatch(registerThunk(payload)).unwrap(); dispatch(setProfile(response.profile)); return response;
  }, [dispatch]);
  return { ...state, login, register, signOut: () => dispatch(logout()) };
};
