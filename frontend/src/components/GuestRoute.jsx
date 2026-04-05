import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../lib/auth';
import { getPostLoginPath } from '../lib/postLoginRedirect';

/**
 * For /login and /register: if already signed in, send the user to their role home
 * (admin dashboard, food menu control for Food Menu Manager, etc.).
 */
export default function GuestRoute({ children }) {
  const token = getToken();
  const user = getUser();

  if (token && user) {
    return <Navigate to={getPostLoginPath(user)} replace />;
  }

  return children;
}
