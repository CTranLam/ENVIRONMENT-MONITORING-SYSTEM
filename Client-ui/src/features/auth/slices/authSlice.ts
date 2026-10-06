import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { authApi } from '@/features/auth/services/authApi';
import type { AuthResponse, AuthState, LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types';

const initialState: AuthState = {
  isAuthenticated: Boolean(sessionStorage.getItem('ems.accessToken')),
  isLoading: false,
  error: null,
};

const messageFrom = (error: unknown, fallback: string) => axios.isAxiosError(error)
  ? String(error.response?.data?.message ?? fallback) : fallback;

export const loginThunk = createAsyncThunk<AuthResponse, LoginRequest, { rejectValue: string }>(
  'auth/login', async (payload, { rejectWithValue }) => {
    try { return await authApi.login(payload); } catch (error) { return rejectWithValue(messageFrom(error, 'Đăng nhập thất bại.')); }
  },
);
export const registerThunk = createAsyncThunk<AuthResponse, RegisterRequest, { rejectValue: string }>(
  'auth/register', async (payload, { rejectWithValue }) => {
    try { return await authApi.register(payload); } catch (error) { return rejectWithValue(messageFrom(error, 'Đăng ký thất bại.')); }
  },
);

export const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    logout: (state) => { sessionStorage.removeItem('ems.accessToken'); state.isAuthenticated = false; state.error = null; },
  },
  extraReducers: (builder) => builder
    .addCase(loginThunk.pending, (state) => { state.isLoading = true; state.error = null; })
    .addCase(registerThunk.pending, (state) => { state.isLoading = true; state.error = null; })
    .addCase(loginThunk.fulfilled, (state, action) => { sessionStorage.setItem('ems.accessToken', action.payload.accessToken); state.isLoading = false; state.isAuthenticated = true; })
    .addCase(registerThunk.fulfilled, (state, action) => { sessionStorage.setItem('ems.accessToken', action.payload.accessToken); state.isLoading = false; state.isAuthenticated = true; })
    .addCase(loginThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload ?? 'Đăng nhập thất bại.'; })
    .addCase(registerThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload ?? 'Đăng ký thất bại.'; }),
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
