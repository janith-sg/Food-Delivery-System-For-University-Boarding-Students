import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenuBar from '../features/user-management/components/UserMenuBar';
import { clearAuth } from '../lib/auth';
import { USER_PROFILE_PATH } from '../lib/postLoginRedirect';

/** Top bar + padded content for staff tools (order management, etc.). */
export default function StaffPageShell({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100">
      <UserMenuBar
        onLogout={() => {
          clearAuth();
          navigate('/login');
        }}
        onProfileClick={() => navigate(USER_PROFILE_PATH)}
      />
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">{children}</div>
    </div>
  );
}
