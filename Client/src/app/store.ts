import { configureStore } from '@reduxjs/toolkit';
import { profileReducer } from '@/features/profile';
import { dashboardReducer } from '@/features/dashboard';
import { sensorDataReducer } from '@/features/monitoring';
import { actionHistoryReducer } from '@/features/action-history';
import { alertsReducer } from '@/features/alerts';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    dashboard: dashboardReducer,
    sensorData: sensorDataReducer,
    actionHistory: actionHistoryReducer,
    alerts: alertsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

