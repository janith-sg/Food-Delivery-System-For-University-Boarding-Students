import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../lib/auth';

/**
 * For /login: if already logged in as admin, skip login screen.
 */
export default function GuestRoute({ children, redirectTo = '/admin/dashboard' }) {
  const token = getToken();
  const user = getUser();

  if (token && user?.accountType === 'admin') {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
