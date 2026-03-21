import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getUser } from '../lib/auth';

/**
 * Blocks unauthenticated users. Optionally restrict by user.accountType (e.g. admin only).
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length) {
    const role = user.accountType;
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
