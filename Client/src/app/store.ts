import { configureStore } from '@reduxjs/toolkit';
import { profileReducer } from '@/features/profile';
import { dashboardReducer } from '@/features/dashboard/slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

