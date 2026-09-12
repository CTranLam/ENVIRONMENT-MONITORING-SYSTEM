import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { ProfilePage } from '@/features/profile';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/dashboard"
          element={
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <h2>Dashboard Page</h2>
              <p>Trang tổng quan đang phát triển...</p>
            </div>
          }
        />
        <Route
          path="/sensor-data"
          element={
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <h2>Sensor Data Page</h2>
              <p>Trang dữ liệu quan trắc đang phát triển...</p>
            </div>
          }
        />
        <Route
          path="/action-history"
          element={
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <h2>Action History Page</h2>
              <p>Trang lịch sử thao tác đang phát triển...</p>
            </div>
          }
        />
        <Route path="/" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

