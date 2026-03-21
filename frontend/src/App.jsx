// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLayout from './features/user-management/pages/AdminLayout';
import AdminDashboardPage from './features/user-management/pages/admin/AdminDashboardPage';
import CustomerRegistrationPage from './features/user-management/pages/admin/CustomerRegistrationPage';
import StaffRegistrationPage from './features/user-management/pages/admin/StaffRegistrationPage';
import RoleManagementPage from './features/user-management/pages/admin/RoleManagementPage';
import CustomerManagementPage from './features/user-management/pages/admin/CustomerManagementPage';
import SupportChatbotPage from './features/user-management/pages/admin/SupportChatbotPage';
import AdminProfilePage from './features/user-management/pages/admin/AdminProfilePage';
import LoginPage from './features/user-management/pages/LoginPage';
import ForgotPasswordPage from './features/user-management/pages/ForgotPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import { syncAxiosAuth } from './lib/auth';

function App() {
  useEffect(() => {
    syncAxiosAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="customer-registration" element={<CustomerRegistrationPage />} />
            <Route path="staff-registration" element={<StaffRegistrationPage />} />
            <Route path="role-management" element={<RoleManagementPage />} />
            <Route path="customer-management" element={<CustomerManagementPage />} />
            <Route path="support-chatbot" element={<SupportChatbotPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
