/**
 * Default landing path after login (and when a logged-in user hits /login or /register).
 * Keep in sync with backend `constants/staffRoles.js` and staff routes in App.jsx.
 */

/** Standalone profile URL (staff, customer). Admins use `/admin/profile` inside AdminLayout. */
export const USER_PROFILE_PATH = '/profile';

/** Profile URL for the current user (admin → in-layout; others → standalone). */
export function getProfilePath(user) {
  if (user?.accountType === 'admin') return '/admin/profile';
  return USER_PROFILE_PATH;
}

const STAFF_ROLE_HOME = {
  'food menu manager': '/food-menu',
  'order manager': '/staff/orders',
  'delivery driver': '/rider/dashboard',
  'delivery manager': '/admin/deliveries',
};

function normalizedStaffRole(user) {
  return String(user?.staffRole || '')
    .trim()
    .toLowerCase();
}

export function getPostLoginPath(user) {
  if (!user) return '/';

  if (user.accountType === 'admin') {
    return '/admin/dashboard';
  }

  if (user.accountType === 'customer') {
    return '/menu';
  }

  if (user.accountType === 'staff') {
    const key = normalizedStaffRole(user);
    if (STAFF_ROLE_HOME[key] !== undefined) {
      return STAFF_ROLE_HOME[key];
    }
  }

  return '/';
}

/**
 * Only send the user back to `from` if that path matches their role (e.g. Order Manager
 * must not resume at `/` or `/food-menu` — those are not order-management screens).
 */
function isReturnPathAllowedForUser(user, path) {
  if (path === USER_PROFILE_PATH) {
    return ['admin', 'staff', 'customer'].includes(user?.accountType);
  }
  if (user?.accountType === 'admin') {
    return path.startsWith('/admin') || path === USER_PROFILE_PATH;
  }
  if (user?.accountType === 'customer') {
    return true;
  }
  if (user?.accountType === 'staff') {
    const key = normalizedStaffRole(user);
    if (key === 'food menu manager') {
      return path.startsWith('/food-menu') || path.startsWith('/admin/menu');
    }
    if (key === 'order manager') {
      return path.startsWith('/staff/orders');
    }
    if (key === 'delivery driver') {
      return path.startsWith('/rider');
    }
    if (key === 'delivery manager') {
      return path.startsWith('/admin/deliveries') || path.startsWith('/admin/notifications');
    }
  }
  return true;
}

/**
 * After login: use `from` only when it is a real deep link — not `/login`, `/register`,
 * or `/` for non-customers (otherwise staff/admin would stay on the public home).
 */
export function resolvePostLoginDestination(user, fromPathname) {
  const home = getPostLoginPath(user);
  const from = typeof fromPathname === 'string' ? fromPathname : '';
  if (!from || from === '/login' || from === '/register') return home;
  if (from === '/' && user?.accountType && user.accountType !== 'customer') return home;
  if (from === '/' && user?.accountType === 'customer') return home;
  if (!isReturnPathAllowedForUser(user, from)) return home;
  return from;
}
