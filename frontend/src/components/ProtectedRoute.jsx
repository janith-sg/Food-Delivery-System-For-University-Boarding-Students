import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getUser } from '../lib/auth';

/**
 * Blocks unauthenticated users. Optionally restrict by user.accountType (e.g. admin only).
 * When `allowedStaffRoles` is set, staff users must have a matching `staffRole` (admins bypass this check).
 */
export default function ProtectedRoute({ children, allowedRoles, allowedStaffRoles }) {
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

  if (allowedStaffRoles?.length && user.accountType === 'staff') {
    const sr = String(user.staffRole || '').trim();
    if (!allowedStaffRoles.includes(sr)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
