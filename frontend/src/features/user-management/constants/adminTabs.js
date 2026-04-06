/** Sidebar label → URL path segment */
export const TAB_PATHS = {
  Dashboard: 'dashboard',
  'User Registration': 'user-registration',
  'Customer Management': 'customer-management',
  'Staff Management': 'staff-management',
  'User Roles & Permissions': 'staff-user-roles',
  'Logs & Monitoring': 'logs-monitoring',
  Chat: 'chat',
};

export const pathToTab = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([label, slug]) => [slug, label]),
);

/** Fallback labels only; live roles come from GET /api/staff-roles/names */
export const STAFF_ROLES = [
  'Delivery Manager',
  'Order Manager',
  'Food Menu Manager',
  'Delivery Driver',
];
