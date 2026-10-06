import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { ProfilePage } from '@/features/profile';
import { DashboardPage } from '@/features/dashboard';
import { SensorDataPage } from '@/features/monitoring';
import { ActionHistoryPage } from '@/features/action-history';
import { AuthPage, useAuth } from '@/features/auth';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        {/* Trang Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Trang Profile */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Trang Sensor Data */}
        <Route path="/sensor-data" element={<SensorDataPage />} />

        {/* Trang Action History */}
        <Route path="/action-history" element={<ActionHistoryPage />} />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
