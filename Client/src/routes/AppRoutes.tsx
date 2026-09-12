import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { ProfilePage } from '@/features/profile';
import { DashboardPage } from '@/features/dashboard';

// Placeholder trắng cho các trang chưa phát triển
const BlankPage: React.FC = () => {
  return <div style={{ minHeight: '65vh', width: '100%', backgroundColor: '#ffffff' }} />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Trang Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Trang Profile */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* 2 trang còn lại để trắng theo yêu cầu */}
        <Route path="/sensor-data" element={<BlankPage />} />
        <Route path="/action-history" element={<BlankPage />} />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
