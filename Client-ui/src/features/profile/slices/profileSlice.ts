import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { profileApi } from '@/features/profile/services/profileApi';
import type {
  ProfileState,
  UpdateProfileRequest,
  UserProfile,
} from '@/features/profile/types/profile.types';

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
};

export const fetchProfileThunk = createAsyncThunk<UserProfile>(
  'profile/fetch',
  () => profileApi.getProfile(),
);

export const updateProfileThunk = createAsyncThunk<UserProfile, UpdateProfileRequest>(
  'profile/update',
  (patch) => profileApi.updateProfile(patch),
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
      .addCase(fetchProfileThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfileThunk.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateProfileThunk.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isUpdating = false;
        state.profile = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state) => {
        state.isUpdating = false;
      });
  },
});

export const { setProfile } = profileSlice.actions;
export default profileSlice.reducer;
