import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenuBar from '../features/user-management/components/UserMenuBar';
import { clearAuthWithAudit, getUser } from '../lib/auth';
import { getProfilePath } from '../lib/postLoginRedirect';

/** Top bar + padded content for staff tools (order management, etc.). */
export default function StaffPageShell({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100">
      <UserMenuBar
        onLogout={async () => {
          await clearAuthWithAudit();
          navigate('/login');
        }}
        onProfileClick={() => navigate(getProfilePath(getUser()))}
      />
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">{children}</div>
    </div>
  );
}
