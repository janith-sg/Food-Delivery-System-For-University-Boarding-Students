/** Sidebar label → URL path segment */
export const TAB_PATHS = {
  Dashboard: 'dashboard',
  'Customer Registration': 'customer-registration',
  'Customer Management': 'customer-management',
  'Staff Registration': 'staff-registration',
  'Role Management': 'role-management',
  'User Profile': 'profile',
};

export const pathToTab = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([label, slug]) => [slug, label]),
);

/** Must match backend STAFF_ROLES */
export const STAFF_ROLES = [
  'Delivery Manager',
  'Order Manager',
  'Food Menu Manager',
  'Delivery Driver',
];
