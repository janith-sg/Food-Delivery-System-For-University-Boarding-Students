import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import UserMenuBar from '../features/user-management/components/UserMenuBar';
import { clearAuth } from '../lib/auth';
import { USER_PROFILE_PATH } from '../lib/postLoginRedirect';

/** UNI EATS user bar + delivery system nav for admin deliveries / notifications. */
export default function DeliveryAdminShell({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <UserMenuBar
        onLogout={() => {
          clearAuth();
          navigate('/login');
        }}
        onProfileClick={() => navigate(USER_PROFILE_PATH)}
      />
      <Navbar />
      {children}
    </div>
  );
}
