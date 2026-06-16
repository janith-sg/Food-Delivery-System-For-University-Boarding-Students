// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLayout from './features/user-management/pages/AdminLayout';
import AdminDashboardPage from './features/user-management/pages/admin/AdminDashboardPage';
import UserRegistrationPage from './features/user-management/pages/admin/UserRegistrationPage';
import RoleManagementPage from './features/user-management/pages/admin/RoleManagementPage';
import StaffDetailPage from './features/user-management/pages/admin/StaffDetailPage';
import CustomerManagementPage from './features/user-management/pages/admin/CustomerManagementPage';
import CustomerDetailPage from './features/user-management/pages/admin/CustomerDetailPage';
import UserRolesPermissionsPage from './features/user-management/pages/admin/UserRolesPermissionsPage';
import AuditLogsPage from './features/user-management/pages/admin/AuditLogsPage';
import AdminChatPage from './features/user-management/pages/admin/AdminChatPage';
import AdminProfilePage from './features/user-management/pages/admin/AdminProfilePage';
import LoginPage from './features/user-management/pages/LoginPage';
import RegisterPage from './features/user-management/pages/RegisterPage';
import ForgotPasswordPage from './features/user-management/pages/ForgotPasswordPage';
import RiderDashboardPage from './features/delivery-managemnet/pages/RiderDashboardPage';
import AdminDeliveryPage from './features/delivery-managemnet/pages/AdminDeliveryPage';
import FoodMenu from './features/food-menu-management/FoodMenu';
import DeliveryAdminShell from './components/DeliveryAdminShell';
import AdminNotificationPage from './features/notification-management/pages/AdminNotificationPage';
import AdminOrders from './features/order-managemnt/pages/AdminOrders';
import AdminGroupOrders from './features/order-managemnt/pages/AdminGroupOrders';
import CustomerDashboardPage from './features/delivery-managemnet/pages/CustomerDashboardPage';
import Checkout from './features/order-managemnt/pages/Checkout';
import OrderManagement from './features/order-managemnt/pages/OrderManagement';
import GroupOrderFlow from './features/order-managemnt/pages/GroupOrderFlow';
import { CartProvider } from './features/order-managemnt/context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import StaffPageShell from './components/StaffPageShell';
import { syncAxiosAuth, getUser } from './lib/auth';
import { USER_PROFILE_PATH } from './lib/postLoginRedirect';

function StandaloneProfileRoute() {
  const user = getUser();
  if (user?.accountType === 'admin') {
    return <Navigate to="/admin/profile" replace />;
  }
  return <AdminProfilePage />;
}

function App() {
  useEffect(() => {
    syncAxiosAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/menu" element={<FoodMenu />} />
        <Route path="/menu/category/:categorySlug" element={<FoodMenu />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'customer']}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group-order"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'customer']}>
              <GroupOrderFlow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-management"
          element={
            <CartProvider>
              <OrderManagement />
            </CartProvider>
          }
        />
        <Route
          path={USER_PROFILE_PATH}
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'customer']}>
              <StandaloneProfileRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/deliveries"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']} allowedStaffRoles={['Delivery Manager']}>
              <DeliveryAdminShell>
                <AdminDeliveryPage />
              </DeliveryAdminShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']} allowedStaffRoles={['Delivery Manager']}>
              <DeliveryAdminShell>
                <AdminNotificationPage />
              </DeliveryAdminShell>
            </ProtectedRoute>
          }
        />
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
            <Route path="user-registration" element={<UserRegistrationPage />} />
            <Route path="customer-registration" element={<Navigate to="/admin/user-registration" replace />} />
            <Route path="staff-registration" element={<Navigate to="/admin/user-registration" replace />} />
            <Route path="staff-management/:staffId" element={<StaffDetailPage />} />
            <Route path="staff-management" element={<RoleManagementPage />} />
            <Route path="staff-user-roles" element={<UserRolesPermissionsPage />} />
            <Route path="logs-monitoring" element={<AuditLogsPage />} />
            <Route path="chat" element={<AdminChatPage />} />
            <Route path="role-management" element={<Navigate to="/admin/staff-management" replace />} />
            <Route path="customer-management/:customerId" element={<CustomerDetailPage />} />
            <Route path="customer-management" element={<CustomerManagementPage />} />
            <Route path="menu" element={<FoodMenu isAdmin />} />
            <Route path="menu/category/:categorySlug" element={<FoodMenu isAdmin />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
        <Route
          path="/food-menu"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']} allowedStaffRoles={['Food Menu Manager']}>
              <FoodMenu isAdmin adminBasePath="/food-menu" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food-menu/category/:categorySlug"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']} allowedStaffRoles={['Food Menu Manager']}>
              <FoodMenu isAdmin adminBasePath="/food-menu" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/orders"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']} allowedStaffRoles={['Order Manager']}>
              <StaffPageShell>
                <div className="space-y-6">
                  <AdminOrders />
                  <AdminGroupOrders />
                </div>
              </StaffPageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/orders/group"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']} allowedStaffRoles={['Order Manager']}>
              <StaffPageShell>
                <AdminGroupOrders />
              </StaffPageShell>
            </ProtectedRoute>
          }
        />
        <Route path="/staff/delivery" element={<Navigate to="/rider/dashboard" replace />} />
        <Route
          path="/rider/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']} allowedStaffRoles={['Delivery Driver']}>
              <StaffPageShell>
                <RiderDashboardPage />
              </StaffPageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
