import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ProfileState, UserProfile } from '../types/profile.types';
import { profileApi } from '../services/profileApi';

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const fetchProfileDataThunk = createAsyncThunk(
  'profile/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      return await profileApi.getProfileData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải thông tin profile';
      return rejectWithValue(msg);
    }
  }
);

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileDataThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileDataThunk.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfileDataThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProfile } = profileSlice.actions;
export default profileSlice.reducer;
