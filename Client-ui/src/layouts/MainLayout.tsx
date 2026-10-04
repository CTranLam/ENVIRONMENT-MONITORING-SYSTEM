import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useProfile } from '@/features/profile';
import { useAlerts, AlertPopupModal } from '@/features/alerts';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const {
    isSystemOnline,
    currentPopupAlert,
    dismissAlert,
    handleAlertAction,
    retryConnection,
  } = useAlerts({ initialize: true });

  const navItems = [
    { key: '/dashboard', label: 'Dashboard' },
    { key: '/sensor-data', label: 'Sensor Data' },
    { key: '/action-history', label: 'Action History' },
    { key: '/profile', label: 'Profile' },
  ];

  const currentPath = location.pathname === '/' ? '/profile' : location.pathname;

  return (
    <div className="min-h-screen flex flex-col bg-white w-full m-0 p-0">
      {/* Shared Header with #0099FF, navigation cluster on the left, avatar on the right */}
      <header className="w-full bg-[#0099FF] min-h-[70px] flex items-center justify-between px-7 box-border">
        {/* Left: White cluster container holding all 4 navigation buttons */}
        <nav className="nav-cluster-container">
          {navItems.map((item) => {
            const isActive = currentPath === item.key;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`nav-cluster-btn ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: User Avatar & Information */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 cursor-pointer py-1 pr-3.5 pl-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all select-none"
          title="Xem trang Profile"
        >
          <Avatar
            size={40}
            src={profile?.avatarUrl || undefined}
            icon={!profile?.avatarUrl ? <UserOutlined /> : undefined}
            className="!bg-white !text-[#0099FF] font-bold shadow-sm"
          />
          <div className="flex flex-col text-left">
            <span className="text-white font-semibold text-sm leading-[18px]">
              {profile?.fullName || 'Trần Quang Lâm'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content: full width, natural white background, aligned with header margins */}
      <main className="flex-1 w-full bg-white px-7 py-6 box-border flex flex-col">
        <Outlet />
      </main>

      {/* Shared Bottom / Footer full width with #0099FF - Lựa chọn 1 (Clean & Modern) */}
      <footer className="w-full bg-[#0099FF] text-white px-8 py-3.5 flex items-center justify-between text-[13px] font-medium box-border flex-wrap gap-3">
        {/* Bên trái: Tên hệ thống & năm */}
        <div className="text-white/90">
          © 2026 Environment Monitoring System (EMS)
        </div>

        {/* Ở giữa: Thông tin tác giả */}
        <div className="text-white font-semibold">
          Made by Tran Quang Lam — B23DCCN480
        </div>

        {/* Bên phải: Trạng thái kết nối ESP8266 & phiên bản (Chỉ hiển thị trạng thái thực, không click) */}
        <div className="flex items-center gap-2 select-none">
          {isSystemOnline ? (
            <>
              <span className="status-dot-pulse" />
              <span>
                ESP8266: <strong className="text-white font-bold">Online</strong>
              </span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              <span className="text-amber-200">
                ESP8266: <strong className="font-bold underline">Offline</strong>
              </span>
            </>
          )}
          <span className="opacity-60">|</span>
          <span className="opacity-90">v1.0.0</span>
        </div>
      </footer>

      {/* Modal Popup Cảnh Báo Toàn Cục (Hiển thị chính giữa màn hình) */}
      <AlertPopupModal
        alert={currentPopupAlert}
        onDismiss={dismissAlert}
        onAlertAction={handleAlertAction}
        onRetryConnection={retryConnection}
      />
    </div>
  );
};

export default MainLayout;
