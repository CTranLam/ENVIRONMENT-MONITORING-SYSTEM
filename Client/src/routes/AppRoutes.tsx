import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { ProfilePage } from '@/features/profile';
import { DashboardPage } from '@/features/dashboard';
import { SensorDataPage } from '@/features/monitoring';
import { ActionHistoryPage } from '@/features/action-history';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
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
    </Routes>
  );
};

export default AppRoutes;
